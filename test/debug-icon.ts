import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

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

// Test the failing icon URL
const testUrl = {
  type: 'Icon',
  url: 'https://www.freepik.com/icon/location_4249665#fromView=popular&page=1&position=1&uuid=c13f62bd-661a-466c-8f31-3825ae12c250'
};

async function debugIcon() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log(`Debugging failing ${testUrl.type} asset...`);
  console.log(`URL: ${testUrl.url}`);
  
  try {
    // Extract the download link
    console.log('Extracting download link...');
    const downloadLink = await getDownloadLink(testUrl.url);
    console.log('✅ Download link extracted successfully!');
    console.log('🔗 Link:', downloadLink);
  } catch (error) {
    console.error('❌ Link extraction failed:', error.message);
  }
  
  // Close the browser
  console.log('Closing browser...');
  await close();
  console.log('✅ Icon debug test completed!');
}

debugIcon().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});