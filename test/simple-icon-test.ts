import { getDownloadLink, close } from '../src/downloader/link-extractor';
import * as dotenv from 'dotenv';

dotenv.config();

async function testIconDownload() {
  console.log('Testing icon download link extraction...');
  
  try {
    // Use a simple icon URL for testing
    const iconUrl = 'https://www.freepik.com/icon/location_4249665';
    
    console.log('Extracting download link for icon...');
    const downloadLink = await getDownloadLink(iconUrl);
    console.log('Download link extracted successfully:');
    console.log(downloadLink);
    
  } catch (error) {
    console.error('Icon download test failed:', error.message);
  } finally {
    await close();
  }
}

testIconDownload();