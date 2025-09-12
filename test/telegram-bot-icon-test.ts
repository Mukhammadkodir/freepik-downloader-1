import { extractFreepikDownloadLink } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function testTelegramBotIcon() {
  console.log('Testing Telegram bot icon download link extraction...');
  
  try {
    // Use an icon URL for testing
    const iconUrl = 'https://www.freepik.com/icon/location_4249665#fromView=popular&page=1&position=1&uuid=c13f62bd-661a-466c-8f31-3825ae12c250';
    
    console.log(`Extracting download link for icon: ${iconUrl}`);
    const downloadLink = await extractFreepikDownloadLink(iconUrl);
    console.log('✅ Download link extracted successfully!');
    console.log('🔗 Link:', downloadLink);
    
  } catch (error) {
    console.error('❌ Link extraction failed:', error.message);
  }
}

testTelegramBotIcon();