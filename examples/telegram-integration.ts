import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example Telegram bot message handler
 * @param userId Telegram user ID
 * @param freepikUrl Freepik URL sent by user
 */
export async function handleFreepikRequest(userId: string, freepikUrl: string): Promise<void> {
  console.log(`Processing Freepik request for user ${userId}: ${freepikUrl}`);
  
  try {
    // Extract the direct download link
    const downloadLink = await extractFreepikDownloadLink(freepikUrl);
    
    // In your actual Telegram bot, you would send this link to the user:
    console.log(`✅ SUCCESS: Send this link to user ${userId}:`);
    console.log(downloadLink);
    
    // Example of how you would use it with a Telegram bot library:
    // await bot.sendMessage(userId, `Here's your download link: ${downloadLink}`);
    
  } catch (error) {
    console.error(`❌ ERROR: Failed to process request for user ${userId}:`, error.message);
    
    // In your actual Telegram bot, you would send an error message:
    // await bot.sendMessage(userId, `Sorry, I couldn't extract the download link. Please make sure the URL is correct and I have access to a valid Freepik premium account.`);
  }
}

/**
 * Example usage
 */
async function main() {
  // This would be set once when your bot starts
  const { default: freepik } = await import('../src/index');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  // Simulate a user sending a Freepik URL
  const userId = "123456789";
  const freepikUrl = process.env.TEST_DOWNLOAD_URL!;
  
  await handleFreepikRequest(userId, freepikUrl);
  
  // Clean up when your bot shuts down
  await cleanup();
}

// Run example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}