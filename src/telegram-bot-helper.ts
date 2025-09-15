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
    
    // Validate that we got a proper download URL, not a tracking pixel or API endpoint
    const invalidPatterns = [
      '/api/',
      'walletId=',
      '/download.gif', // tracking pixel
      '/user/downloads/limit'
    ];
    
    const isValidDownloadUrl = !invalidPatterns.some(pattern => downloadLink.includes(pattern));
    
    // Additional validation: check if it's from a known CDN
    const validCdnDomains = [
      'downloadscdn',
      'videocdn.cdnpk.net',
      'audiocdn.cdnpk.net',
      'cdn-icons.flaticon.com',
      '3d.cdnpk.net'
    ];
    
    const isFromValidCdn = validCdnDomains.some(domain => downloadLink.includes(domain));
    
    // Check for valid file extensions
    const validExtensions = ['.zip', '.rar', '.psd', '.jpg', '.png', '.svg', '.mp4', '.mov', '.mp3', '.wav', '.obj', '.fbx'];
    const hasValidExtension = validExtensions.some(ext => downloadLink.includes(ext));
    
    if (!isValidDownloadUrl) {
      throw new Error('Extracted link is an API endpoint or tracking pixel, not a direct download URL');
    }
    
    // If it's not from a valid CDN and doesn't have a valid extension, it's likely not a real download URL
    if (!isFromValidCdn && !hasValidExtension) {
      throw new Error('Extracted link does not appear to be a valid download URL');
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