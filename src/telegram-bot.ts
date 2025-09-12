import TelegramBot = require('node-telegram-bot-api');
import { extractFreepikDownloadLink, cleanup } from './telegram-bot-helper';
import { default as freepik } from './index';
import * as dotenv from 'dotenv';
import { getSavedCookie } from './cookie/cookie';

// Load environment variables
dotenv.config();

// Get the bot token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN || '7737359947:AAEEEnXlW5UBepDZ_C7ZvI5QTrureYlLHWg';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

console.log('Freepik Telegram Bot Started...');

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text || '';
  
  console.log(`Received message from ${chatId}: ${messageText}`);
  
  // Check if the message contains a Freepik URL
  if (messageText.includes('freepik.com')) {
    try {
      // Notify user that we're processing
      await bot.sendMessage(chatId, '🔍 Processing your Freepik link...');
      
      // Extract the direct download link
      const downloadLink = await extractFreepikDownloadLink(messageText);
      
      // Send the download link to the user
      await bot.sendMessage(chatId, `✅ Here's your direct download link:\n\n${downloadLink}\n\nClick the link to download the file directly!`);
      
      console.log(`Sent download link to ${chatId}`);
    } catch (error) {
      console.error(`Error processing request for ${chatId}:`, error);
      await bot.sendMessage(chatId, '❌ Sorry, I couldn\'t extract the download link. Please make sure the URL is correct and I have access to a valid Freepik premium account.');
    }
  } else if (messageText === '/start') {
    await bot.sendMessage(chatId, '👋 Welcome to the Freepik Downloader Bot!\n\nSend me a Freepik URL and I\'ll give you a direct download link.\n\nExample: https://www.freepik.com/premium-psd/your-design_1234567.htm');
  } else if (messageText === '/help') {
    await bot.sendMessage(chatId, 'ℹ️ Send me any Freepik URL and I\'ll provide a direct download link.\n\nI only work with valid Freepik premium URLs.');
  } else {
    // For any other message, provide help
    await bot.sendMessage(chatId, 'Please send me a valid Freepik URL.\n\nType /help for more information.');
  }
});

// Handle errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Telegram bot...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Telegram bot...');
  await cleanup();
  process.exit(0);
});