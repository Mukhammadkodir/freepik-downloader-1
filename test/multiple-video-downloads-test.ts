import { extractFreepikDownloadLink } from '../dist/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function testMultipleVideoDownloads() {
  console.log('=== TESTING MULTIPLE VIDEO DOWNLOADS ===');
  
  // Test URLs for multiple videos
  const testUrls = [
    'https://www.freepik.com/premium-video/animation-moving-plants-tree-dark-blue-background_2602788#fromView=search&page=1&position=6&uuid=a0bc1374-913b-40f6-8cda-5bbc9bd08eaa',
    'https://www.freepik.com/premium-video/gold-bitcoin-btc-isolated-computer-motherboard-background-cryptocurrency-mining-virtual-money_3305744#fromView=resource_detail&position=3&from_element=cross_selling__video',
    'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome'
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const testUrl = testUrls[i];
    console.log(`\n--- TEST ${i + 1}: ${testUrl} ---`);
    
    try {
      // Extract the direct download link
      const downloadLink = await extractFreepikDownloadLink(testUrl);
      
      console.log('✅ SUCCESS: Download link extracted!');
      console.log('🔗 Download Link:', downloadLink);
      
      // Validate the download link
      if (downloadLink.includes('/download.gif')) {
        console.log('❌ FAILURE: Got tracking pixel instead of download URL');
      } else if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
        console.log('❌ FAILURE: Got API endpoint instead of download URL');
      } else if (downloadLink.includes('videocdn.cdnpk.net') || downloadLink.includes('downloadscdn')) {
        console.log('✅ SUCCESS: Got proper CDN download URL');
      } else {
        console.log('⚠️  WARNING: URL format unexpected, manual verification needed');
      }
      
    } catch (error) {
      console.error('❌ ERROR:', error.message);
    }
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

testMultipleVideoDownloads();