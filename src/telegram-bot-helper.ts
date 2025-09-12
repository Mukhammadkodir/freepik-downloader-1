import freepik from './index';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Helper function to extract Freepik download link for Telegram bot
 * @param freepikUrl The Freepik asset URL
 * @returns Direct download URL that can be sent to Telegram users
 */
export async function extractFreepikDownloadLink(freepikUrl: string): Promise<string> {
  try {
    console.log(`Extracting download link for Freepik URL: ${freepikUrl}`);
    
    // Use TEST_COOKIE from environment variables if available, otherwise use saved cookie
    const cookie = process.env.TEST_COOKIE || undefined;
    
    // Extract the direct download link, passing the cookie
    const downloadLink = await freepik.getDownloadLink(freepikUrl, cookie as any);
    
    console.log(`Successfully extracted download link: ${downloadLink}`);
    
    // Validate that we didn't get an API endpoint
    if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
      throw new Error('Extracted link is an API endpoint, not a direct download URL');
    }
    
    return downloadLink;
  } catch (error) {
    console.error('Failed to extract download link:', error);
    throw new Error(`Failed to extract download link: ${error.message}`);
  }
}

/**
 * Cleanup function to close the browser instance
 */
export async function cleanup(): Promise<void> {
  await freepik.close();
}