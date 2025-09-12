// Example Telegram bot integration
// This is a simplified example showing how to use the link extractor in a Telegram bot

const { getDownloadLink, close } = require('../dist/downloader/link-extractor');
const dotenv = require('dotenv');
const freepik = require('../dist/index.js');

dotenv.config();

// Mock Telegram bot function
async function handleFreepikLink(telegramUserId, freepikUrl) {
  console.log(`User ${telegramUserId} requested Freepik link: ${freepikUrl}`);
  
  try {
    // Extract the direct download link
    const downloadLink = await getDownloadLink(freepikUrl);
    
    // Send the download link back to the user
    console.log(`Sending download link to user ${telegramUserId}: ${downloadLink}`);
    
    // In a real Telegram bot, you would use:
    // bot.sendMessage(telegramUserId, `Here's your download link: ${downloadLink}`);
    
    return downloadLink;
  } catch (error) {
    console.error(`Failed to extract download link for user ${telegramUserId}:`, error.message);
    
    // In a real Telegram bot, you would use:
    // bot.sendMessage(telegramUserId, `Sorry, I couldn't extract the download link. Please try again later.`);
    
    return null;
  } finally {
    // Close the browser when done
    await close();
  }
}

// Example usage
async function example() {
  // Set the cookie first (in a real app, you would do this once when the bot starts)
  freepik.default.setCookie(process.env.TEST_COOKIE);
  
  // Handle a user request
  const userId = "123456789";
  const freepikUrl = process.env.TEST_DOWNLOAD_URL;
  
  const downloadLink = await handleFreepikLink(userId, freepikUrl);
  
  if (downloadLink) {
    console.log("✅ Successfully extracted and would send the download link to the user");
  } else {
    console.log("❌ Failed to extract the download link");
  }
}

// Run the example
example().catch(console.error);