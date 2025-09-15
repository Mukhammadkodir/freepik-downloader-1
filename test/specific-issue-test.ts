import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function specificIssueTest() {
  console.log('=== SPECIFIC ISSUE TEST ===');
  console.log('Testing the exact scenario you mentioned...');
  
  // Test the exact type of URL that was causing issues
  const problematicUrl = 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
  
  try {
    console.log(`Testing URL: ${problematicUrl}`);
    
    const startTime = Date.now();
    const downloadLink = await extractFreepikDownloadLink(problematicUrl);
    const endTime = Date.now();
    
    console.log('\n=== RESULTS ===');
    console.log('✅ SUCCESS: Download link extracted!');
    console.log('🔗 Download Link:', downloadLink);
    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    
    // Check if we got the problematic download.gif URL
    if (downloadLink.includes('/download.gif')) {
      console.log('\n❌ ISSUE CONFIRMED: Got tracking pixel instead of actual download URL');
      console.log('   This is the exact issue you reported.');
      console.log('   URL contains "/download.gif" which is a tracking pixel, not a download link.');
      return;
    }
    
    // Check if we got an API endpoint
    if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
      console.log('\n❌ ISSUE CONFIRMED: Got API endpoint instead of actual download URL');
      console.log('   This is the exact issue you reported.');
      console.log('   URL contains API patterns which are not direct download links.');
      return;
    }
    
    // Check if we got a proper download URL
    const validCdns = ['videocdn.cdnpk.net', 'downloadscdn'];
    const validExtensions = ['.mov', '.mp4', '.zip', '.psd', '.jpg', '.png'];
    
    const hasValidCdn = validCdns.some(cdn => downloadLink.includes(cdn));
    const hasValidExtension = validExtensions.some(ext => downloadLink.includes(ext));
    
    if (hasValidCdn && hasValidExtension) {
      console.log('\n✅ ISSUE RESOLVED: Got proper download URL');
      console.log('   The system is now correctly providing actual download links.');
      console.log('   URL is from a valid CDN and has a proper file extension.');
      return;
    }
    
    console.log('\n⚠️  UNCLEAR RESULT: URL format is unexpected');
    console.log('   Manual verification needed.');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    // Check if this is the expected error when we get invalid URLs
    if (error.message.includes('tracking pixel') || error.message.includes('API endpoint')) {
      console.log('✅ EXPECTED ERROR: Validation is working correctly');
      console.log('   The system correctly rejected an invalid URL.');
    }
  } finally {
    await cleanup();
  }
}

specificIssueTest();