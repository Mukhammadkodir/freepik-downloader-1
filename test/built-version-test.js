const { extractFreepikDownloadLink } = require('../../dist/telegram-bot-helper');
const dotenv = require('dotenv');

dotenv.config();

async function testBuiltVersion() {
  console.log('=== TESTING BUILT VERSION ===');
  
  // Use a simple test URL
  const testUrl = 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
  
  console.log(`Testing URL: ${testUrl}`);
  
  try {
    // Extract the direct download link
    const downloadLink = await extractFreepikDownloadLink(testUrl);
    
    console.log('✅ SUCCESS: Download link extracted!');
    console.log('🔗 Download Link:', downloadLink);
    
    // Check if it's a tracking pixel
    if (downloadLink.includes('/download.gif')) {
      console.log('❌ FAILURE: Got tracking pixel instead of download URL');
    } else {
      console.log('✅ SUCCESS: Did not get tracking pixel URL');
    }
    
    // Check if it's an API endpoint
    if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
      console.log('❌ FAILURE: Got API endpoint instead of download URL');
    } else {
      console.log('✅ SUCCESS: Did not get API endpoint URL');
    }
    
    // Check for valid CDN domains
    const validCdns = ['videocdn.cdnpk.net', 'downloadscdn', 'audiocdn.cdnpk.net', 'cdn-icons.flaticon.com', '3d.cdnpk.net'];
    const hasValidCdn = validCdns.some(cdn => downloadLink.includes(cdn));
    
    if (hasValidCdn) {
      console.log('✅ SUCCESS: Got URL from valid CDN');
    } else {
      console.log('⚠️  WARNING: URL not from recognized CDN');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testBuiltVersion();