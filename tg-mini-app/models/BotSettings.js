// models/BotSettings.js
const mongoose = require('mongoose');

const BotSettingsSchema = new mongoose.Schema({
  welcomeMessage: {
    text: String,
    imageUrl: String,
    buttons: [{
      text: String,
      url: String
    }]
  },
  // Дополнительные настройки можно добавить здесь
});

module.exports = mongoose.model('BotSettings', BotSettingsSchema);