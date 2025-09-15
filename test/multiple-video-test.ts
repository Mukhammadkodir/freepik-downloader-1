import { extractFreepikDownloadLink } from '../dist/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function testMultipleVideoDownloads() {
  console.log('=== TESTING MULTIPLE VIDEO DOWNLOADS ===');
  
  // Test URLs for multiple videos
  const testUrls = [
    'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome',
    'https://www.freepik.com/premium-video/businessman-working-laptop_12880154.htm',
    'https://www.freepik.com/premium-video/digital-technology-concept-animation_10790795.htm'
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const testUrl = testUrls[i];
    console.log(`\n--- TEST ${i + 1}: ${testUrl} ---`);
    
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
}

testMultipleVideoDownloads();