import { extractFreepikDownloadLink } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugMultipleVideoDownloads() {
  console.log('=== DEBUGGING MULTIPLE VIDEO DOWNLOADS ===');
  
  // Test URLs for multiple videos
  const testUrls = [
    'https://www.freepik.com/premium-video/animation-moving-plants-tree-dark-blue-background_2602788#fromView=search&page=1&position=6&uuid=a0bc1374-913b-40f6-8cda-5bbc9bd08eaa',
    'https://www.freepik.com/premium-video/gold-bitcoin-btc-isolated-computer-motherboard-background-cryptocurrency-mining-virtual-money_3305744#fromView=resource_detail&position=3&from_element=cross_selling__video'
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const testUrl = testUrls[i];
    console.log(`\n--- TEST ${i + 1}: ${testUrl} ---`);
    
    try {
      console.log(`Starting download link extraction for video ${i + 1}...`);
      
      // Extract the direct download link
      const startTime = Date.now();
      const downloadLink = await extractFreepikDownloadLink(testUrl);
      const endTime = Date.now();
      
      console.log(`✅ SUCCESS: Download link extracted in ${endTime - startTime}ms!`);
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
      
      // Add a delay between requests to ensure proper cleanup
      console.log('Waiting 5 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
  
  console.log('\n=== DEBUG COMPLETE ===');
}

debugMultipleVideoDownloads().catch(console.error);