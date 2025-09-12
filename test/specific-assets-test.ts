import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

// Test URLs for different asset types that are having issues
const testUrls = [
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/closeup-businessman-spinning-street-man-raising-hands-city-center_2363172#fromView=resource_detail&position=3&from_element=cross_selling__video'
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/abstract-geometric-shapes-spiral-background-animation_6204317#fromView=search&page=1&position=0&uuid=8a420ff5-0d49-4b70-a9ca-ea15458bd404'
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/animation-spot-purple-shapes-falling_3181460#fromView=search&page=1&position=1&uuid=b66a6079-dccf-4939-8b0b-f9ec96c71f54'
  },
  {
    type: 'Photo',
    url: 'https://www.freepik.com/premium-photo/medium-shot-father-kid-living-countryside_57276049.htm#from_element=cross_selling__photo'
  },
  {
    type: 'Icon',
    url: 'https://www.freepik.com/icon/location_4249665#fromView=popular&page=1&position=1&uuid=c13f62bd-661a-466c-8f31-3825ae12c250'
  }
];

async function testSpecificAssets() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Starting specific assets test...');
  console.log(`Testing ${testUrls.length} assets that were reported as failing...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
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
        successCount++;
      } else {
        console.log('⚠️  Link may not be from Freepik CDN');
        failCount++;
      }
      
    } catch (error) {
      console.error('❌ Link extraction failed:', error.message);
      failCount++;
    }
    
    console.log(); // Empty line for readability
  }
  
  // Close the browser
  console.log('Closing browser...');
  await close();
  
  console.log(`\n--- Test Summary ---`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Success Rate: ${Math.round((successCount / testUrls.length) * 100)}%`);
  
  if (failCount > 0) {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

testSpecificAssets().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});