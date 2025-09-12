/**
 * Simple example of how to integrate Freepik link extraction into a Telegram bot
 * 
 * This example shows how to:
 * 1. Extract direct download links from Freepik URLs
 * 2. Send those links to Telegram users without triggering download popups
 */

const { extractFreepikDownloadLink, cleanup } = require('../dist/telegram-bot-helper');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Process a Freepik URL and return a direct download link
 * @param {string} freepikUrl - The Freepik asset URL
 * @returns {Promise<string>} - Direct download URL
 */
async function getFreepikDownloadLink(freepikUrl) {
  try {
    console.log(`Extracting download link for: ${freepikUrl}`);
    
    // Extract the direct download link
    const downloadLink = await extractFreepikDownloadLink(freepikUrl);
    
    console.log('✅ Download link extracted successfully');
    return downloadLink;
  } catch (error) {
    console.error('❌ Failed to extract download link:', error.message);
    throw error;
  }
}

/**
 * Example of how to use in a Telegram bot
 */
async function telegramBotExample() {
  // Set your Freepik cookie (do this once when your bot starts)
  const freepik = require('../dist/index.js');
  freepik.default.setCookie(process.env.TEST_COOKIE);
  
  // Simulate a user sending a Freepik URL to your bot
  const userId = "123456789";
  const freepikUrl = process.env.TEST_DOWNLOAD_URL;
  
  console.log(`User ${userId} sent Freepik URL: ${freepikUrl}`);
  
  try {
    // Get the direct download link
    const downloadLink = await getFreepikDownloadLink(freepikUrl);
    
    // Send the link to the user (without triggering download popup)
    console.log(`\n📤 Sending this link to user ${userId}:`);
    console.log(downloadLink);
    
    // In your actual Telegram bot, you would do something like:
    // await bot.sendMessage(userId, `Here's your download link: ${downloadLink}`);
    
    console.log('\n✅ User will receive the link without any download popup!');
    
  } catch (error) {
    console.error(`\n❌ Failed to process request for user ${userId}`);
    
    // In your actual Telegram bot, you would do something like:
    // await bot.sendMessage(userId, 'Sorry, I could not extract the download link. Please try again later.');
  } finally {
    // Clean up when shutting down your bot
    await cleanup();
  }
}

// Run the example
if (require.main === module) {
  telegramBotExample().catch(console.error);
}

// Export functions for use in your Telegram bot
module.exports = {
  getFreepikDownloadLink
};