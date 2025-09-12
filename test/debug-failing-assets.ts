import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

// Test one of the failing video URLs
const testUrl = {
  type: 'Video',
  url: 'https://www.freepik.com/premium-video/abstract-geometric-shapes-spiral-background-animation_6204317#fromView=search&page=1&position=0&uuid=8a420ff5-0d49-4b70-a9ca-ea15458bd404'
};

async function debugFailingAsset() {
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
  console.log('✅ Debug test completed!');
}

debugFailingAsset().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});