require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Добавьте эти строки в начало файла для логирования
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});



const app = express();
const port = process.env.PORT || 5000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const mongoURI = process.env.MONGODB_URI || 'your_default_mongodb_uri';

app.use(express.json());


const User = require('./models/User');
const UserAction = require('./models/UserAction');

const UserSettingsSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  settings: {
    isDarkTheme: Boolean,
    isCompactGrid: Boolean,
  }
});
const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);

const AppModel = require('./models/App');

let hashedPassword;

// Эндпоинт для получения аналитики
app.get('/api/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApps = await AppModel.countDocuments();
    const onlineUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    // Получаем 10 самых активных пользователей
    const topUsers = await UserAction.aggregate([
      { $group: { _id: '$user', launchCount: { $sum: 1 } } },
      { $sort: { launchCount: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }},
      { $unwind: '$userInfo' },
      { $project: {
        username: { $ifNull: ['$userInfo.username', '$userInfo.firstName'] },
        telegramId: '$userInfo.telegramId',
        launchCount: 1
      }}
    ]);

    // Получаем статистику по избранным приложениям
    const appFavorites = await AppModel.aggregate([
      { $project: {
        name: 1,
        favoriteCount: 1
      }},
      { $sort: { favoriteCount: -1 }}
    ]);

    res.json({
      totalUsers,
      totalApps,
      onlineUsers,
      topUsers,
      appFavorites
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Эндпоинт для добавления/удаления из избранного
app.post('/api/favorites', async (req, res) => {
  const { userId, appId, action } = req.body;
  try {
    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const app = await AppModel.findById(appId);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    if (action === 'add') {
      if (!user.favoriteApps.includes(appId)) {
        user.favoriteApps.push(appId);
        app.favoriteCount += 1;
      }
    } else if (action === 'remove') {
      user.favoriteApps = user.favoriteApps.filter(id => id.toString() !== appId);
      app.favoriteCount = Math.max(0, app.favoriteCount - 1);
    }

    await user.save();
    await app.save();

    await UserAction.create({
      user: user._id,
      action: action === 'add' ? 'addFavorite' : 'removeFavorite',
      app: app._id
    });

    res.json({ success: true, favoriteApps: user.favoriteApps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware
app.use(cors({
  origin: ['https://web.telegram.org', 'https://timecommunity.xyz', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// Добавьте этот middleware перед другими route handlers
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.use('/icons', (req, res, next) => {
  console.log(`Requesting icon: ${req.url}`);
  next();
}, express.static(path.join(__dirname, 'icons'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.jpg') {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

app.get('/api/check-image-paths', async (req, res) => {
  try {
    const apps = await AppModel.find({}, 'name icon');
    const imagePaths = apps.map(app => ({
      name: app.name,
      path: app.icon,
      exists: fs.existsSync(path.join(__dirname, app.icon))
    }));
    res.json(imagePaths);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//baza
app.get('/api/users-favorites', async (req, res) => {
  try {
    const users = await User.find({})
      .select('username telegramId favoriteApps')
      .populate('favoriteApps', 'name');
    
    const usersWithFavorites = users.map(user => ({
      username: user.username || `User ${user.telegramId}`,
      telegramId: user.telegramId,
      favorites: user.favoriteApps.map(app => app.name)
    }));

    res.json(usersWithFavorites);
  } catch (error) {
    console.error('Error fetching users and favorites:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Настройка хранилища для загруженных файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'icons');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Database connection
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Hash admin password
bcrypt.hash(ADMIN_PASSWORD, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    hashedPassword = hash;
    console.log('Admin password hashed successfully');
  }
});

app.post('/api/apps/:id/launch', async (req, res) => {
  console.log(`Received launch request for app ID: ${req.params.id}`);
  console.log(`Request body:`, req.body);
  try {
    const appId = req.params.id;
    const userId = req.body.userId;

    let user;
    if (userId) {
      user = await User.findOne({ telegramId: userId });
      if (!user) {
        console.log(`User not found with telegramId: ${userId}`);
      }
    }

    const app = await AppModel.findByIdAndUpdate(
      appId,
      { $inc: { launchCount: 1 } },
      { new: true }
    );

    if (!app) {
      console.log(`App not found with id: ${appId}`);
      return res.status(404).json({ message: 'App not found' });
    }

    console.log(`Incremented launch count for app ${appId}`);
    
    if (user) {
      await UserAction.create({
        user: user._id,
        action: 'launch',
        app: app._id
      });
      console.log(`UserAction created for user ${user._id}, app ${app._id}`);
    }
    
    console.log(`App launch processed. App ID: ${app._id}, Launch count: ${app.launchCount}`);
    res.json(app);
  } catch (error) {
    console.error(`Error processing app launch: ${error.message}`);
    res.status(500).json({ message: 'Failed to launch app. Please try again.' });
  }
});

// Эндпоинт для обновления последней активности пользователя
app.post('/api/user/activity', async (req, res) => {
  const { userId, username, firstName, lastName, action, appId } = req.body;
  console.log('Received user activity data:', req.body);

  try {
    const user = await User.findOneAndUpdate(
      { telegramId: userId },
      { 
        lastActive: new Date(),
        username: username || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    /* Если действие - запуск приложения, обновляем соответствующие данные
    if (action === 'launch' && appId) {
      await UserAction.create({
        user: user._id,
        action: 'launch',
        app: appId
      });
    }

    console.log('User saved/updated:', user);
    */
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user activity:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.userId });
    if (user) {
      res.json({ favoriteApps: user.favoriteApps || [] });
    } else {
      res.json({ favoriteApps: [] });
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/user/settings', async (req, res) => {
  const { userId, isDarkTheme, isCompactGrid, sortType } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { telegramId: userId },
      { $set: { isDarkTheme, isCompactGrid, sortType } },
      { new: true, upsert: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/user/settings/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.userId });
    if (user) {
      res.json({
        isDarkTheme: user.isDarkTheme,
        isCompactGrid: user.isCompactGrid,
        favoriteApps: user.favoriteApps,
        sortType: user.sortType,
        username: user.username || user.firstName || `User ${user.telegramId}`
      });
    } else {
      res.json({ isDarkTheme: false, isCompactGrid: false, favoriteApps: [], sortType: 'alphabet' , username: `User ${req.params.userId}` });
    }
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: error.message });
  }
});



app.get('/api/settings/:userId', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const userId = parseInt(req.params.userId);
  try {
    const userSettings = await UserSettings.findOne({ userId });
    if (userSettings) {
      res.json(userSettings.settings);
    } else {
      res.json({ isDarkTheme: false, isCompactGrid: false });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// App routes
app.get('/api/apps', async (req, res) => {
  try {
    const userId = req.query.userId;
    const sortType = req.query.sortType || 'alphabet';
    
    let apps;
    if (sortType === 'popularity') {
      apps = await AppModel.find().sort({ launchCount: -1, name: 1 });
    } else {
      apps = await AppModel.find().sort({ name: 1 });
    }
    
    logger.info(`Fetched ${apps.length} apps. Sort type: ${sortType}`);
    
    if (userId) {
      const user = await User.findOne({ telegramId: userId });
      if (user) {
        const appsWithFavorite = apps.map(app => ({
          ...app.toObject(),
          isFavorite: user.favoriteApps.includes(app._id)
        }));
        logger.info(`Returning apps with favorite info for user: ${userId}`);
        return res.json(appsWithFavorite);
      }
    }
    
    res.json(apps);
  } catch (error) {
    logger.error(`Error fetching apps: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/apps', async (req, res) => {
  const app = new AppModel(req.body);
  try {
    const newApp = await app.save();
    res.status(201).json(newApp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/apps/:id', async (req, res) => {
  try {
    const app = await AppModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    res.json(app);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/apps/:id', async (req, res) => {
  try {
    const app = await AppModel.findByIdAndDelete(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    res.json({ message: 'App deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Authentication route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && hashedPassword) {
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// File upload route
app.post('/api/upload', upload.single('icon'), (req, res) => {
  if (req.file) {
    const iconUrl = `/icons/${req.file.filename}`;
    
    const buildIconsPath = path.join(__dirname, 'build', 'icons');
    if (!fs.existsSync(buildIconsPath)) {
      fs.mkdirSync(buildIconsPath, { recursive: true });
    }
    fs.copyFileSync(req.file.path, path.join(buildIconsPath, req.file.filename));
    
    res.json({ url: iconUrl });
  } else {
    res.status(400).send('No file uploaded.');
  }
});

// Clear image cache route (placeholder)
app.post('/api/clear-image-cache', (req, res) => {
  res.json({ success: true, message: 'Image cache cleared' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});