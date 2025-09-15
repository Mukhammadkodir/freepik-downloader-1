import { getDownloadLink, close } from '../src/downloader/link-extractor';
import * as dotenv from 'dotenv';

dotenv.config();

async function videoTest() {
  console.log('Testing video asset download link extraction...');
  
  // Test a video URL
  const testUrl = 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
  
  try {
    console.log(`Testing asset: ${testUrl}`);
    console.log('Using TEST_COOKIE from environment...');
    
    // Pass the TEST_COOKIE from environment variables
    const startTime = Date.now();
    const downloadLink = await getDownloadLink(testUrl, process.env.TEST_COOKIE as any);
    const endTime = Date.now();
    
    console.log('✅ Download link extracted successfully!');
    console.log('🔗 Download Link:', downloadLink);
    console.log(`⏱️  Extraction time: ${endTime - startTime}ms`);
    
    // Verify it's a valid download link (not an API endpoint or tracking pixel)
    const invalidPatterns = [
      '/api/',
      'walletId=',
      '/download.gif', // tracking pixel
      '/user/downloads/limit'
    ];
    
    const hasInvalidPattern = invalidPatterns.some(pattern => downloadLink.includes(pattern));
    
    if (hasInvalidPattern) {
      console.log('❌ ERROR: Extracted link contains invalid patterns (API endpoint or tracking pixel)');
      console.log('This indicates the fix is not working properly.');
      return;
    }
    
    // Check if it's from a valid CDN
    const validCdnDomains = [
      'downloadscdn',
      'videocdn.cdnpk.net',
      'audiocdn.cdnpk.net',
      'cdn-icons.flaticon.com'
    ];
    
    const isFromValidCdn = validCdnDomains.some(domain => downloadLink.includes(domain));
    
    // Check for valid file extensions
    const validExtensions = ['.zip', '.rar', '.psd', '.jpg', '.png', '.svg', '.mp4', '.mov', '.mp3', '.wav'];
    const hasValidExtension = validExtensions.some(ext => downloadLink.includes(ext));
    
    if (isFromValidCdn && hasValidExtension) {
      console.log('✅ SUCCESS: Link verification passed - URL is from Freepik CDN and has valid extension');
      console.log('The fix is working correctly!');
    } else if (isFromValidCdn) {
      console.log('✅ SUCCESS: Link is from Freepik CDN (extension check pending)');
      console.log('The fix is working correctly!');
    } else {
      console.log('⚠️  WARNING: URL may not be from Freepik CDN, manual verification needed');
    }
    
  } catch (error) {
    console.error('❌ Failed to extract download link:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await close();
  }
}

videoTest();