const mongoose = require('mongoose');

const AppSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['app', 'game'], 
    required: true 
  },
  icon: { 
    type: String, 
    required: true 
  },
  link: { 
    type: String, 
    required: true,
    trim: true
  },
  launchCount: { 
    type: Number, 
    default: 0 
  },
  favoriteCount: { // Новое поле
    type: Number,
    default: 0
  },
  order: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('App', AppSchema);