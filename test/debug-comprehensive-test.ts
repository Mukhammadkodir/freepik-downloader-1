import { getDownloadLink, close } from '../src/downloader/link-extractor';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugComprehensiveTest() {
  console.log('=== COMPREHENSIVE DEBUG TEST ===');
  
  // Test a video URL
  const testUrl = 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
  
  try {
    console.log(`Testing asset: ${testUrl}`);
    console.log('Using TEST_COOKIE from environment...');
    
    // Pass the TEST_COOKIE from environment variables
    const startTime = Date.now();
    const downloadLink = await getDownloadLink(testUrl, process.env.TEST_COOKIE as any);
    const endTime = Date.now();
    
    console.log('\n=== RESULTS ===');
    console.log('✅ Download link extracted successfully!');
    console.log('🔗 Download Link:', downloadLink);
    console.log(`⏱️  Extraction time: ${endTime - startTime}ms`);
    
    // Detailed validation
    console.log('\n=== VALIDATION ===');
    
    // Check for invalid patterns
    const invalidPatterns = [
      '/api/',
      'walletId=',
      '/download.gif', // tracking pixel
      '/user/downloads/limit'
    ];
    
    console.log('Checking for invalid patterns:');
    for (const pattern of invalidPatterns) {
      const hasPattern = downloadLink.includes(pattern);
      console.log(`  ${pattern}: ${hasPattern ? '❌ FOUND' : '✅ NOT FOUND'}`);
    }
    
    const hasInvalidPattern = invalidPatterns.some(pattern => downloadLink.includes(pattern));
    
    // Check for valid CDN domains
    const validCdnDomains = [
      'downloadscdn',
      'videocdn.cdnpk.net',
      'audiocdn.cdnpk.net',
      'cdn-icons.flaticon.com',
      '3d.cdnpk.net'
    ];
    
    console.log('\nChecking for valid CDN domains:');
    let foundValidCdn = false;
    for (const domain of validCdnDomains) {
      const hasDomain = downloadLink.includes(domain);
      console.log(`  ${domain}: ${hasDomain ? '✅ FOUND' : '❌ NOT FOUND'}`);
      if (hasDomain) foundValidCdn = true;
    }
    
    // Check for valid file extensions
    const validExtensions = ['.zip', '.rar', '.psd', '.jpg', '.png', '.svg', '.mp4', '.mov', '.mp3', '.wav', '.obj', '.fbx'];
    console.log('\nChecking for valid file extensions:');
    let foundValidExtension = false;
    for (const ext of validExtensions) {
      const hasExtension = downloadLink.includes(ext);
      console.log(`  ${ext}: ${hasExtension ? '✅ FOUND' : '❌ NOT FOUND'}`);
      if (hasExtension) foundValidExtension = true;
    }
    
    console.log('\n=== FINAL ASSESSMENT ===');
    if (hasInvalidPattern) {
      console.log('❌ CRITICAL: Extracted link contains invalid patterns (API endpoint or tracking pixel)');
      console.log('This indicates the fix is not working properly.');
    } else if (foundValidCdn && foundValidExtension) {
      console.log('✅ SUCCESS: Link verification passed - URL is from Freepik CDN and has valid extension');
      console.log('The fix is working correctly!');
    } else if (foundValidCdn) {
      console.log('⚠️  PARTIAL SUCCESS: Link is from Freepik CDN but extension check failed');
      console.log('Manual verification needed');
    } else if (foundValidExtension) {
      console.log('⚠️  PARTIAL SUCCESS: Link has valid extension but CDN check failed');
      console.log('Manual verification needed');
    } else {
      console.log('❌ FAILURE: URL does not appear to be a valid download URL');
      console.log('Neither CDN nor valid extension found');
    }
    
  } catch (error) {
    console.error('❌ Failed to extract download link:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await close();
  }
}

debugComprehensiveTest();