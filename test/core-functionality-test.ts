import { extractFreepikDownloadLink } from '../dist/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function testCoreFunctionality() {
  console.log('=== TESTING CORE FUNCTIONALITY ===');
  
  // Test with a simple video URL
  const testUrl = 'https://www.freepik.com/premium-video/animation-moving-plants-tree-dark-blue-background_2602788#fromView=search&page=1&position=6&uuid=a0bc1374-913b-40f6-8cda-5bbc9bd08eaa';
  
  console.log(`Testing URL: ${testUrl}`);
  
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
    console.error('Stack trace:', error.stack);
  }
}

testCoreFunctionality();