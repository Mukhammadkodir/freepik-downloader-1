import { extractFreepikDownloadLink } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function testTelegramBotWithIcon() {
  console.log('Testing Telegram bot with icon URL...');
  
  try {
    // Test with a specific icon URL
    const iconUrl = 'https://www.freepik.com/icon/location_4249665';
    
    console.log('Extracting download link for icon...');
    const downloadLink = await extractFreepikDownloadLink(iconUrl);
    console.log('Download link extracted successfully:');
    console.log(downloadLink);
    
  } catch (error) {
    console.error('Telegram bot test failed:', error.message);
  }
}

testTelegramBotWithIcon();