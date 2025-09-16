import { extractFreepikDownloadLink } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function simulateTelegramBotUsage() {
  console.log('=== SIMULATING TELEGRAM BOT USAGE ===');
  
  // Test URLs for multiple videos (simulating real user behavior)
  const testUrls = [
    'https://www.freepik.com/premium-video/animation-moving-plants-tree-dark-blue-background_2602788#fromView=search&page=1&position=6&uuid=a0bc1374-913b-40f6-8cda-5bbc9bd08eaa',
    'https://www.freepik.com/premium-video/gold-bitcoin-btc-isolated-computer-motherboard-background-cryptocurrency-mining-virtual-money_3305744#fromView=resource_detail&position=3&from_element=cross_selling__video',
    'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome'
  ];
  
  // Simulate processing messages one after another (like a real Telegram bot)
  for (let i = 0; i < testUrls.length; i++) {
    const testUrl = testUrls[i];
    const chatId = `user_${i + 1}`;
    const messageId = `msg_${Date.now()}_${i}`;
    
    console.log(`\n--- PROCESSING MESSAGE ${i + 1} from ${chatId} (${messageId}) ---`);
    console.log(`🔍 Processing Freepik link: ${testUrl}`);
    
    try {
      const startTime = Date.now();
      
      // This simulates the exact same flow as the Telegram bot
      const downloadLink = await extractFreepikDownloadLink(testUrl);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      console.log(`✅ SUCCESS: Download link extracted in ${processingTime}ms!`);
      console.log(`📋 Here's your direct download link:`);
      console.log(`🔗 ${downloadLink}`);
      
      // Validate the download link (same as Telegram bot does)
      if (downloadLink.includes('/download.gif')) {
        console.log('❌ VALIDATION FAILED: Got tracking pixel instead of download URL');
      } else if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
        console.log('❌ VALIDATION FAILED: Got API endpoint instead of download URL');
      } else if (downloadLink.includes('videocdn.cdnpk.net') || downloadLink.includes('downloadscdn')) {
        console.log('✅ VALIDATION PASSED: Got proper CDN download URL');
      } else {
        console.log('⚠️  VALIDATION WARNING: URL format unexpected, manual verification needed');
      }
      
      console.log(`📤 Sent download link to ${chatId}`);
      
      // Simulate some delay between messages (like real user behavior)
      if (i < testUrls.length - 1) {
        console.log('⏱️  Waiting 3 seconds before next message...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`❌ ERROR processing message from ${chatId}:`, error.message);
      console.log(`📤 Sent error message to ${chatId}: Sorry, I couldn't extract the download link.`);
    }
  }
  
  console.log('\n=== TELEGRAM BOT SIMULATION COMPLETE ===');
}

// Run the simulation
simulateTelegramBotUsage().catch(error => {
  console.error('Simulation failed:', error);
  process.exit(1);
});