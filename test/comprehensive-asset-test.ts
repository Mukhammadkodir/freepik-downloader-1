import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

// Test URLs for all asset types
const testUrls = [
  // Working asset types (should continue to work)
  {
    type: 'Photo',
    url: 'https://www.freepik.com/premium-photo/woman-beach-with-her-baby-enjoying-sunset_77346447.htm'
  },
  {
    type: 'Vector',
    url: 'https://www.freepik.com/premium-vector/free-vector-halloween-design-template_222299712.htm'
  },
  {
    type: 'PSD',
    url: process.env.TEST_DOWNLOAD_URL || 'https://www.freepik.com/premium-psd/psd-6-september-defiance-day-pakistan_67042227.htm'
  },
  {
    type: 'Template',
    url: 'https://www.freepik.com/premium-template/business-card-template_12345678.htm'
  },
  {
    type: 'Mockup',
    url: 'https://www.freepik.com/premium-mockup/t-shirt-mockup_12345678.htm'
  },
  
  // Previously non-working asset types (should now work)
  {
    type: 'Icon',
    url: 'https://www.freepik.com/icon/location_4249665'
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704'
  },
  {
    type: '3D Model',
    url: 'https://www.freepik.com/3d-model/chair_12345678'
  },
  {
    type: 'Audio',
    url: 'https://www.freepik.com/premium-audio/background-music_12345678'
  },
  {
    type: 'Font',
    url: 'https://www.freepik.com/font/arial_12345678'
  }
];

async function testAllAssetTypes() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Starting comprehensive asset type test...');
  console.log(`Testing ${testUrls.length} different asset types...\n`);
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const [index, testUrl] of testUrls.entries()) {
    console.log(`--- Test ${index + 1}/${testUrls.length}: ${testUrl.type} ---`);
    console.log(`URL: ${testUrl.url}`);
    
    try {
      // Extract the download link
      console.log('Extracting download link...');
      const downloadLink = await getDownloadLink(testUrl.url);
      console.log('✅ Download link extracted successfully!');
      console.log('🔗 Link:', downloadLink.substring(0, 100) + '...');
      
      // Validate the link
      const isValidLink = downloadLink.includes('downloadscdn') || 
                         downloadLink.includes('videocdn.cdnpk.net') || 
                         downloadLink.includes('audiocdn.cdnpk.net') ||
                         downloadLink.includes('cdn-icons.flaticon.com') ||
                         downloadLink.includes('freepik.com/download');
      
      if (isValidLink) {
        console.log('✅ Link validation passed - URL is from Freepik CDN');
        successCount++;
        results.push({ type: testUrl.type, status: 'SUCCESS', link: downloadLink });
      } else {
        console.log('⚠️  Link validation warning - URL may not be from Freepik CDN');
        failCount++;
        results.push({ type: testUrl.type, status: 'WARNING', link: downloadLink });
      }
      
    } catch (error) {
      console.error('❌ Link extraction failed:', error.message);
      failCount++;
      results.push({ type: testUrl.type, status: 'FAILED', error: error.message });
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
  
  console.log('\n--- Detailed Results ---');
  results.forEach(result => {
    console.log(`${result.type}: ${result.status}`);
    if (result.status === 'FAILED') {
      console.log(`  Error: ${result.error}`);
    } else if (result.link) {
      console.log(`  Link: ${result.link.substring(0, 80)}...`);
    }
  });
  
  if (failCount > 0) {
    console.log('\n⚠️  Some tests failed. The improved logic should handle more asset types.');
  } else {
    console.log('\n🎉 All tests passed! The link extractor now works with all asset types.');
  }
}

testAllAssetTypes().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});