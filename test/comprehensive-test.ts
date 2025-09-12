import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

// Test URLs for different asset types (add your own URLs here)
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
  //   type: 'Vector',
  //   url: 'https://www.freepik.com/premium-vector/your-vector-url_1234567.htm'
  // },
  // {
  //   type: 'Video',
  //   url: 'https://www.freepik.com/premium-video/your-video-url_1234567.htm'
  // },
  // {
  //   type: 'Audio',
  //   url: 'https://www.freepik.com/premium-audio/your-audio-url_1234567.htm'
  // }
];

async function runComprehensiveTest() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Starting comprehensive link extraction test...');
  console.log(`Testing ${testUrls.length} asset types...\n`);
  
  for (const [index, testUrl] of testUrls.entries()) {
    console.log(`--- Test ${index + 1}/${testUrls.length}: ${testUrl.type} ---`);
    console.log(`URL: ${testUrl.url}`);
    
    try {
      // Extract the download link
      console.log('Extracting download link...');
      const downloadLink = await getDownloadLink(testUrl.url);
      console.log('✅ Download link extracted successfully!');
      console.log('🔗 Link:', downloadLink.substring(0, 100) + '...');
      
      // Check if the link contains expected elements
      if (downloadLink.includes('downloadscdn')) {
        console.log('✅ Link is from Freepik CDN');
      } else {
        console.log('⚠️  Link may not be from Freepik CDN');
      }
      
      // Check file extension based on asset type
      const fileExtensions = {
        'PSD': ['.psd', '.zip'],
        'Image': ['.jpg', '.jpeg', '.png', '.webp'],
        'Vector': ['.ai', '.eps', '.svg'],
        'Video': ['.mp4', '.avi', '.mov'],
        'Audio': ['.mp3', '.wav', '.aac']
      };
      
      const expectedExtensions = fileExtensions[testUrl.type] || [];
      const hasExpectedExtension = expectedExtensions.some(ext => downloadLink.includes(ext));
      
      if (expectedExtensions.length > 0) {
        if (hasExpectedExtension) {
          console.log('✅ Link has expected file extension');
        } else {
          console.log('⚠️  Link may not have expected file extension');
        }
      }
      
    } catch (error) {
      console.error('❌ Link extraction failed:', error.message);
    }
    
    console.log(); // Empty line for readability
  }
  
  // Close the browser
  console.log('Closing browser...');
  await close();
  console.log('✅ Test completed successfully!');
}

runComprehensiveTest().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});