const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true
  },
  username: String,
  firstName: String,
  lastName: String,
  isDarkTheme: {
    type: Boolean,
    default: false
  },
  isCompactGrid: {
    type: Boolean,
    default: false
  },
  sortType: {
    type: String,
    enum: ['alphabet', 'popularity'],
    default: 'alphabet'
  },
  favoriteApps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App'
  }],
  lastActive: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);