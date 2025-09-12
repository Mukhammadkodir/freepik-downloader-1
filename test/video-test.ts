import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

// Test URLs for video assets
const testUrls = [
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/male-legs-pedals-training-stationary-bike-closeup-shot-healthy-lifestyle-fitness-home-gym_3249272#fromView=image_search_similar&page=1&position=5&uuid=186f309d-e2b1-4670-bbc6-4d79124e3bc6'
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome'
  }
];

async function testVideos() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Starting video tests...');
  console.log(`Testing ${testUrls.length} video assets...\n`);
  
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
      if (downloadLink.includes('downloadscdn') || downloadLink.includes('videocdn')) {
        console.log('✅ Link is from Freepik CDN');
      } else {
        console.log('⚠️  Link may not be from Freepik CDN');
      }
      
    } catch (error) {
      console.error('❌ Link extraction failed:', error.message);
    }
    
    console.log(); // Empty line for readability
  }
  
  // Close the browser
  console.log('Closing browser...');
  await close();
  console.log('✅ Video tests completed!');
}

testVideos().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});