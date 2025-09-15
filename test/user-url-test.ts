import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

async function testUserUrl() {
  console.log('=== USER URL TEST ===');
  console.log('This test allows you to input a specific Freepik URL to test.');
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Ask user for URL
  rl.question('Please enter a Freepik URL to test (or press Enter to use default): ', async (url) => {
    if (!url || url.trim() === '') {
      url = 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
      console.log(`Using default URL: ${url}`);
    }
    
    try {
      console.log(`\nTesting URL: ${url}`);
      
      const startTime = Date.now();
      const downloadLink = await extractFreepikDownloadLink(url);
      const endTime = Date.now();
      
      console.log('\n=== RESULTS ===');
      console.log('✅ SUCCESS: Download link extracted!');
      console.log('🔗 Download Link:', downloadLink);
      console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
      
      // Detailed analysis
      console.log('\n=== ANALYSIS ===');
      
      // Check for problematic patterns
      const problematicPatterns = [
        { pattern: '/download.gif', description: 'Tracking pixel' },
        { pattern: '/api/', description: 'API endpoint' },
        { pattern: 'walletId=', description: 'Wallet ID parameter' },
        { pattern: '/user/downloads/limit', description: 'Download limit endpoint' }
      ];
      
      console.log('Checking for problematic patterns:');
      let hasProblematicPattern = false;
      for (const { pattern, description } of problematicPatterns) {
        const found = downloadLink.includes(pattern);
        console.log(`  ${description} (${pattern}): ${found ? '❌ FOUND' : '✅ NOT FOUND'}`);
        if (found) hasProblematicPattern = true;
      }
      
      // Check for valid CDN domains
      const validCdns = [
        { domain: 'videocdn.cdnpk.net', type: 'Video CDN' },
        { domain: 'downloadscdn', type: 'General Download CDN' },
        { domain: 'audiocdn.cdnpk.net', type: 'Audio CDN' },
        { domain: 'cdn-icons.flaticon.com', type: 'Icon CDN' },
        { domain: '3d.cdnpk.net', type: '3D Model CDN' }
      ];
      
      console.log('\nChecking for valid CDN domains:');
      let foundValidCdn = false;
      for (const { domain, type } of validCdns) {
        const found = downloadLink.includes(domain);
        console.log(`  ${type} (${domain}): ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
        if (found) foundValidCdn = true;
      }
      
      // Check for valid file extensions
      const validExtensions = [
        '.mov', '.mp4', '.avi', '.webm',  // Video
        '.mp3', '.wav', '.aac',           // Audio
        '.jpg', '.jpeg', '.png', '.webp', // Images
        '.psd', '.ai', '.eps',            // Design files
        '.svg',                           // Vector
        '.zip', '.rar',                   // Archives
        '.obj', '.fbx', '.blend'          // 3D models
      ];
      
      console.log('\nChecking for valid file extensions:');
      let foundValidExtension = false;
      for (const ext of validExtensions) {
        const found = downloadLink.includes(ext);
        console.log(`  ${ext}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
        if (found) foundValidExtension = true;
      }
      
      console.log('\n=== FINAL ASSESSMENT ===');
      if (hasProblematicPattern) {
        console.log('❌ CRITICAL: Extracted link contains problematic patterns');
        console.log('   This indicates the system is not working correctly.');
      } else if (foundValidCdn && foundValidExtension) {
        console.log('✅ SUCCESS: Link is a proper download URL from Freepik CDN');
        console.log('   The system is working correctly!');
      } else if (foundValidCdn) {
        console.log('⚠️  PARTIAL SUCCESS: Link is from Freepik CDN but extension check failed');
        console.log('   Manual verification recommended.');
      } else if (foundValidExtension) {
        console.log('⚠️  PARTIAL SUCCESS: Link has valid extension but CDN check failed');
        console.log('   Manual verification recommended.');
      } else {
        console.log('❌ FAILURE: URL does not appear to be a valid download URL');
        console.log('   Neither CDN nor valid extension found.');
      }
      
    } catch (error) {
      console.error('\n❌ ERROR:', error.message);
      console.error('Stack trace:', error.stack);
    } finally {
      await cleanup();
      rl.close();
    }
  });
}

// Run the test
testUserUrl();