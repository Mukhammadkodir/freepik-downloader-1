import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function trackingPixelTest() {
  console.log('=== TRACKING PIXEL TEST ===');
  console.log('Testing if the system correctly rejects tracking pixel URLs...');
  
  try {
    // Test with a URL that should result in a tracking pixel being captured
    // We'll use a URL that we know might cause issues
    const testUrl = 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
    
    console.log(`Testing URL: ${testUrl}`);
    
    const downloadLink = await extractFreepikDownloadLink(testUrl);
    
    console.log('\n=== ANALYSIS ===');
    console.log('Download link received:', downloadLink);
    
    // Check if we got a tracking pixel
    if (downloadLink.includes('/download.gif')) {
      console.log('\n❌ FAILURE: Got tracking pixel instead of download URL');
      console.log('   This means the system is not properly filtering out tracking pixels.');
      console.log('   URL contains "/download.gif" which should be excluded.');
      
      // This should have been caught by our validation
      console.log('\n🔍 Checking why validation didn\'t catch this...');
      console.log('   Validation should have thrown an error for tracking pixel URLs.');
      console.log('   If we got here, there might be an issue with the validation logic.');
      
      return;
    }
    
    // Check if we got an API endpoint
    if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
      console.log('\n❌ FAILURE: Got API endpoint instead of download URL');
      console.log('   This means the system is not properly filtering out API endpoints.');
      return;
    }
    
    // Check if we got a proper download URL
    const validCdns = ['videocdn.cdnpk.net', 'downloadscdn', 'audiocdn.cdnpk.net', 'cdn-icons.flaticon.com'];
    const validExtensions = ['.mov', '.mp4', '.zip', '.psd', '.jpg', '.png', '.svg', '.mp3', '.wav', '.obj', '.fbx'];
    
    const hasValidCdn = validCdns.some(cdn => downloadLink.includes(cdn));
    const hasValidExtension = validExtensions.some(ext => downloadLink.includes(ext));
    
    if (hasValidCdn) {
      console.log('\n✅ SUCCESS: Got URL from valid CDN');
      console.log(`   CDN: ${validCdns.find(cdn => downloadLink.includes(cdn))}`);
    } else {
      console.log('\n⚠️  WARNING: URL not from recognized CDN');
    }
    
    if (hasValidExtension) {
      console.log('✅ SUCCESS: URL has valid file extension');
      console.log(`   Extension: ${validExtensions.find(ext => downloadLink.includes(ext))}`);
    } else {
      console.log('⚠️  WARNING: URL does not have recognized file extension');
    }
    
    if (hasValidCdn && hasValidExtension) {
      console.log('\n🎉 OVERALL SUCCESS: System is working correctly!');
      console.log('   The system successfully provided a proper download URL.');
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: URL received but format is unexpected');
      console.log('   Manual verification recommended.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    // Check if this is the expected error for invalid URLs
    if (error.message.includes('tracking pixel') || 
        error.message.includes('API endpoint') || 
        error.message.includes('valid download URL')) {
      console.log('✅ EXPECTED ERROR: Validation is working correctly');
      console.log('   The system correctly rejected an invalid URL.');
    } else {
      console.log('❌ UNEXPECTED ERROR: This might indicate a different issue');
    }
  } finally {
    await cleanup();
  }
}

trackingPixelTest();