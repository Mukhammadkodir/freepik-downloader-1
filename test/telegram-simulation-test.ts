import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function telegramSimulationTest() {
  console.log('=== TELEGRAM BOT SIMULATION TEST ===');
  
  // Test the exact scenario that might be failing
  // Let's test with a few different video URLs to see what happens
  
  const testUrls = [
    'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome',
    // Add more test URLs if needed
  ];
  
  for (const testUrl of testUrls) {
    try {
      console.log(`\n--- Testing URL: ${testUrl} ---`);
      
      const startTime = Date.now();
      const downloadLink = await extractFreepikDownloadLink(testUrl);
      const endTime = Date.now();
      
      console.log('✅ SUCCESS: Download link extracted!');
      console.log('🔗 Download Link:', downloadLink);
      console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
      
      // Additional validation specific to what Telegram bot expects
      console.log('\n--- Telegram Bot Validation ---');
      
      // Check if it's a tracking pixel or API endpoint
      if (downloadLink.includes('/download.gif')) {
        console.log('❌ FAILURE: Got tracking pixel instead of download URL');
      } else if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
        console.log('❌ FAILURE: Got API endpoint instead of download URL');
      } else if (downloadLink.includes('videocdn.cdnpk.net') || downloadLink.includes('downloadscdn')) {
        console.log('✅ SUCCESS: Got proper CDN download URL');
      } else {
        console.log('⚠️  WARNING: URL format unexpected, manual verification needed');
        console.log('   URL does not contain expected CDN domains');
      }
      
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
  
  await cleanup();
}

telegramSimulationTest();