import { getDownloadLink, close } from '../src/downloader/link-extractor';
import * as dotenv from 'dotenv';

dotenv.config();

async function testMultipleIcons() {
  console.log('Testing multiple icon download link extraction...');
  
  const testIcons = [
    'https://www.freepik.com/icon/location_4249665',
    'https://www.freepik.com/icon/heart_1688120',
    'https://www.freepik.com/icon/star_1688127'
  ];
  
  try {
    for (const iconUrl of testIcons) {
      console.log(`\nTesting icon: ${iconUrl}`);
      try {
        const downloadLink = await getDownloadLink(iconUrl);
        console.log(`✅ Download link extracted successfully: ${downloadLink}`);
      } catch (error) {
        console.error(`❌ Failed to extract download link for ${iconUrl}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Multiple icons test failed:', error.message);
  } finally {
    await close();
  }
}

testMultipleIcons();