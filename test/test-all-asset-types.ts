import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

// Test URLs for all asset types mentioned in the issue
const testUrls = [
  // Working asset types (✅)
  {
    type: 'Image',
    url: 'https://www.freepik.com/premium-photo/woman-beach-with-her-baby-enjoying-sunset_77346447.htm',
    working: true
  },
  {
    type: 'Vector',
    url: 'https://www.freepik.com/premium-vector/free-vector-halloween-design-template_222299712.htm',
    working: true
  },
  {
    type: 'Photo',
    url: 'https://www.freepik.com/premium-photo/rain-pine-forest-forest-background_257439423.htm',
    working: true
  },
  {
    type: 'Illustration',
    url: 'https://www.freepik.com/premium-vector/cute-cartoon-illustration_12345678.htm',
    working: true
  },
  {
    type: 'Audio',
    url: 'https://www.freepik.com/premium-audio/background-music_12345678',
    working: true
  },
  {
    type: 'Design',
    url: 'https://www.freepik.com/premium-template/business-card-design_12345678.htm',
    working: true
  },
  {
    type: 'Template',
    url: 'https://www.freepik.com/premium-template/flyer-template_12345678.htm',
    working: true
  },
  {
    type: 'Mockup',
    url: 'https://www.freepik.com/premium-mockup/t-shirt-mockup_12345678.htm',
    working: true
  },
  {
    type: 'Font',
    url: 'https://www.freepik.com/font/arial-font_12345678',
    working: true
  },
  {
    type: 'PSD',
    url: process.env.TEST_DOWNLOAD_URL || 'https://www.freepik.com/premium-psd/psd-6-september-defiance-day-pakistan_67042227.htm',
    working: true
  },
  
  // Previously non-working asset types (should now work)
  {
    type: 'Icon',
    url: 'https://www.freepik.com/icon/location_4249665',
    working: false
  },
  {
    type: '3D',
    url: 'https://www.freepik.com/3d-model/chair_12345678',
    working: false
  },
  {
    type: 'Video',
    url: 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704',
    working: false
  },
  {
    type: 'Videos',
    url: 'https://www.freepik.com/premium-video/abstract-geometric-shapes-spiral-background-animation_6204317',
    working: false
  },
  {
    type: 'Video Template',
    url: 'https://www.freepik.com/premium-video-template/social-media-template_12345678',
    working: false
  },
  {
    type: 'Motion Graphics',
    url: 'https://www.freepik.com/premium-motion-graphics/animated-logo_12345678',
    working: false
  }
];

async function testAllAssetTypes() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Testing all Freepik asset types...');
  console.log(`Testing ${testUrls.length} different asset types...\n`);
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  // Test working assets first to ensure they still work
  console.log('=== Testing Previously Working Assets ===\n');
  const workingAssets = testUrls.filter(asset => asset.working);
  
  for (const [index, testUrl] of workingAssets.entries()) {
    console.log(`--- Working Asset Test ${index + 1}/${workingAssets.length}: ${testUrl.type} ---`);
    console.log(`URL: ${testUrl.url}`);
    
    try {
      const downloadLink = await getDownloadLink(testUrl.url);
      console.log('✅ Download link extracted successfully!');
      console.log('🔗 Link:', downloadLink.substring(0, 100) + '...');
      
      const isValidLink = downloadLink.includes('downloadscdn') || 
                         downloadLink.includes('videocdn.cdnpk.net') || 
                         downloadLink.includes('audiocdn.cdnpk.net') ||
                         downloadLink.includes('cdn-icons.flaticon.com') ||
                         downloadLink.includes('freepik.com/download');
      
      if (isValidLink) {
        console.log('✅ Link validation passed');
        successCount++;
        results.push({ type: testUrl.type, status: 'SUCCESS', link: downloadLink });
      } else {
        console.log('⚠️  Link validation warning');
        failCount++;
        results.push({ type: testUrl.type, status: 'WARNING', link: downloadLink });
      }
      
    } catch (error) {
      console.error('❌ Link extraction failed:', error.message);
      failCount++;
      results.push({ type: testUrl.type, status: 'FAILED', error: error.message });
    }
    
    console.log();
  }
  
  // Test previously non-working assets
  console.log('\n=== Testing Previously Non-Working Assets ===\n');
  const nonWorkingAssets = testUrls.filter(asset => !asset.working);
  
  for (const [index, testUrl] of nonWorkingAssets.entries()) {
    console.log(`--- Non-Working Asset Test ${index + 1}/${nonWorkingAssets.length}: ${testUrl.type} ---`);
    console.log(`URL: ${testUrl.url}`);
    
    try {
      const downloadLink = await getDownloadLink(testUrl.url);
      console.log('✅ Download link extracted successfully!');
      console.log('🔗 Link:', downloadLink.substring(0, 100) + '...');
      
      const isValidLink = downloadLink.includes('downloadscdn') || 
                         downloadLink.includes('videocdn.cdnpk.net') || 
                         downloadLink.includes('audiocdn.cdnpk.net') ||
                         downloadLink.includes('cdn-icons.flaticon.com') ||
                         downloadLink.includes('freepik.com/download');
      
      if (isValidLink) {
        console.log('✅ Link validation passed - FIXED!');
        successCount++;
        results.push({ type: testUrl.type, status: 'FIXED', link: downloadLink });
      } else {
        console.log('⚠️  Link validation warning');
        failCount++;
        results.push({ type: testUrl.type, status: 'WARNING', link: downloadLink });
      }
      
    } catch (error) {
      console.error('❌ Link extraction still failed:', error.message);
      failCount++;
      results.push({ type: testUrl.type, status: 'STILL_FAILED', error: error.message });
    }
    
    console.log();
  }
  
  // Close the browser
  console.log('Closing browser...');
  await close();
  
  console.log(`\n--- Final Test Summary ---`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Success Rate: ${Math.round((successCount / testUrls.length) * 100)}%`);
  
  console.log('\n--- Asset Type Results ---');
  results.forEach(result => {
    const statusEmoji = {
      'SUCCESS': '✅',
      'FIXED': '🔧✅',
      'WARNING': '⚠️',
      'FAILED': '❌',
      'STILL_FAILED': '❌'
    };
    
    console.log(`${statusEmoji[result.status]} ${result.type}: ${result.status}`);
    if (result.status === 'FAILED' || result.status === 'STILL_FAILED') {
      console.log(`    Error: ${result.error}`);
    } else if (result.link) {
      console.log(`    Link: ${result.link.substring(0, 80)}...`);
    }
  });
  
  const fixedCount = results.filter(r => r.status === 'FIXED').length;
  if (fixedCount > 0) {
    console.log(`\n🎉 Fixed ${fixedCount} previously non-working asset types!`);
  }
  
  if (failCount > 0) {
    console.log('\n⚠️  Some asset types still need work. Check the errors above for details.');
  } else {
    console.log('\n🎉 All asset types are now working!');
  }
}

testAllAssetTypes().catch(error => {
  console.error('Test failed with error:', error);
  
  // Close the browser even if there was an error
  close().catch(() => {
    // Ignore errors when closing
  });
});