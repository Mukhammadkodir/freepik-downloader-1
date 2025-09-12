import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink } from '../src/downloader/link-extractor'
dotenv.config()

freepik.setCookie(process.env.TEST_COOKIE!);

// Test URLs for different asset types
const testUrls = [
  {
    type: 'PSD',
    url: process.env.TEST_DOWNLOAD_URL || 'https://www.freepik.com/premium-psd/psd-6-september-defiance-day-pakistan_67042227.htm'
  },
  // Add more test URLs for different asset types here
  // {
  //   type: 'Image',
  //   url: 'https://www.freepik.com/premium-photo/your-image-url_1234567.htm'
  // },
  // {
  //   type: 'Video',
  //   url: 'https://www.freepik.com/premium-video/your-video-url_1234567.htm'
  // }
];

(async () => {
  console.log('Starting tests for different Freepik asset types...');
  
  for (const testUrl of testUrls) {
    try {
      console.log(`\nTesting ${testUrl.type} download...`);
      console.log(`URL: ${testUrl.url}`);
      
      // Test link extraction (Telegram bot approach)
      console.log('Extracting download link...');
      const downloadLink = await getDownloadLink(testUrl.url);
      console.log(`Extracted download link: ${downloadLink}`);
      
      // Test actual download
      console.log('Testing actual download...');
      const file = await freepik.downloadByUrlV2(testUrl.url)
      console.log(`Downloaded file: ${file.filename}`)
      console.log(`File size: ${file.size} bytes`)
      file.delete()
      console.log('File deleted successfully')
    } catch (error) {
      console.error(`Error testing ${testUrl.type}:`, error.message)
    }
  }
  
  console.log('\nAll tests completed.');
  
  // Close the browser instance
  const { close } = await import('../src/downloader/link-extractor');
  await close();
})()