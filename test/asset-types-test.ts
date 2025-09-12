import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

// Test URLs for different asset types
const testUrls = [
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/male-legs-pedals-training-stationary-bike-closeup-shot-healthy-lifestyle-fitness-home-gym_3249272#fromView=image_search_similar&page=1&position=5&uuid=186f309d-e2b1-4670-bbc6-4d79124e3bc6'
  },
  {
    type: 'Photo',
    url: 'https://www.freepik.com/premium-photo/woman-beach-with-her-baby-enjoying-sunset_77346447.htm#fromView=serie&page=1&position=9&from_element=series_block'
  },
  {
    type: 'Photo',
    url: 'https://www.freepik.com/premium-photo/rain-pine-forest-forest-background_257439423.htm#from_element=cross_selling__photo'
  },
  {
    type: 'Vector',
    url: 'https://www.freepik.com/premium-vector/free-vector-halloween-design-template_222299712.htm#fromView=search&page=1&position=3&uuid=e8992362-59cd-430d-8d60-08ac0c154aaf&query=Halloween'
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome'
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/teal-blue-diagonal-striped-background_5668265#fromView=search&page=1&position=4&uuid=22322d7e-4d1a-468c-8638-d227a3e035ff'
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/animation-light-spots-colourful-shapes-black-background_5314894#fromView=search&page=1&position=0&uuid=104311cb-565b-446f-9d99-9d242f061c6b'
  }
];

async function testAssetTypes() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Starting asset type tests...');
  console.log(`Testing ${testUrls.length} different asset types...\n`);
  
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
      if (downloadLink.includes('downloadscdn') || 
          downloadLink.includes('videocdn.cdnpk.net') || 
          downloadLink.includes('cdn-icons.flaticon.com') ||
          downloadLink.includes('download.gif')) {
        console.log('✅ Link is from Freepik CDN or related download service');
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
    console.log('\n🎉 All tests passed! The link extractor works with all asset types.');
  }
}

testAssetTypes().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});