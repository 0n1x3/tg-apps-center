require('dotenv').config();
checkRequiredEnvVariables();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Константы для эмодзи
const EMOJI = {
    DIAMOND: '\u{1F48E}',
    PLAY: '\u{1F3AE}',
    NFT: '\u{1F320}'
  };

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log(logMessage);
    fs.appendFileSync('bot.log', logMessage);
}

log('Bot script started');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
    log('TELEGRAM_BOT_TOKEN is not set in the environment variables');
    process.exit(1);
}

log('TELEGRAM_BOT_TOKEN is set');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('polling_error', (error) => {
    log(`Bot polling error: ${error.message}`);
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    log(`Received /start command from chat ${chatId}`);
    const welcomeMessage = createWelcomeMessage(chatId);
    bot.sendPhoto(chatId, welcomeMessage.photo, {
        caption: welcomeMessage.caption,
        reply_markup: welcomeMessage.reply_markup,
        parse_mode: welcomeMessage.parse_mode
    })
    .then(() => log(`Sent welcome message with image and buttons to chat ${chatId}`))
    .catch(error => log(`Error sending welcome message to chat ${chatId}: ${error.message}`));
});

log('Bot initialized and started polling');

// Здесь можно добавить дополнительную логику бота
function createWelcomeMessage(chatId) {
    return {
        chat_id: chatId,
        photo: process.env.WELCOME_IMAGE_URL,
        caption: `Каталог игр и приложений для комьюнити от TIME COMMUNITY ${EMOJI.DIAMOND}`,
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: `${EMOJI.PLAY} ${process.env.BUTTON1_TEXT}`, url: process.env.BUTTON1_URL }],
                [{ text: `${EMOJI.DIAMOND} ${process.env.BUTTON2_TEXT}`, url: process.env.BUTTON2_URL }],
                [{ text: `${EMOJI.NFT} ${process.env.BUTTON3_TEXT}`, url: process.env.BUTTON3_URL }]
            ]
        }),
        parse_mode: 'Markdown'
    };
}

function checkRequiredEnvVariables() {
    const requiredVars = ['TELEGRAM_BOT_TOKEN', 'WELCOME_IMAGE_URL', 'BUTTON1_TEXT', 'BUTTON1_URL', 'BUTTON2_TEXT', 'BUTTON2_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        log(`Missing required environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }
}

setInterval(() => {
    log('Bot is still running...');
}, 60000);

log('Bot script finished loading');