const mongoose = require('mongoose');

const UserActionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['launch', 'clickApp', 'addFavorite', 'removeFavorite']
  },
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserAction', UserActionSchema);