import { extractFreepikDownloadLink } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function quickMultipleVideoTest() {
  console.log('=== QUICK MULTIPLE VIDEO TEST ===');
  
  // Test just 2 videos quickly
  const testUrls = [
    'https://www.freepik.com/premium-video/animation-moving-plants-tree-dark-blue-background_2602788',
    'https://www.freepik.com/premium-video/gold-bitcoin-btc-isolated-computer-motherboard-background-cryptocurrency-mining-virtual-money_3305744'
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const testUrl = testUrls[i];
    console.log(`\n--- VIDEO ${i + 1}: ${testUrl} ---`);
    
    try {
      const startTime = Date.now();
      const downloadLink = await extractFreepikDownloadLink(testUrl);
      const endTime = Date.now();
      
      console.log(`✅ SUCCESS in ${endTime - startTime}ms`);
      console.log(`🔗 ${downloadLink.substring(0, 100)}...`);
      
      if (downloadLink.includes('videocdn.cdnpk.net') || downloadLink.includes('downloadscdn')) {
        console.log('✅ Got proper CDN URL');
      } else {
        console.log('❌ Unexpected URL format');
      }
      
    } catch (error) {
      console.error(`❌ ERROR: ${error.message}`);
    }
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

quickMultipleVideoTest().catch(console.error);