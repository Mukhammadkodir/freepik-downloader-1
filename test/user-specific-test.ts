import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

async function userSpecificTest() {
  console.log('=== USER SPECIFIC URL TEST ===');
  console.log('This test allows you to input your exact URL to diagnose the issue.');
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Promisify the question function
  const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  };
  
  try {
    // Get the URL from user
    const userUrl = await askQuestion('Please enter the Freepik URL you\'re having trouble with: ');
    
    if (!userUrl || userUrl.trim() === '') {
      console.log('No URL provided. Exiting.');
      return;
    }
    
    console.log(`\nTesting URL: ${userUrl}`);
    
    const startTime = Date.now();
    const downloadLink = await extractFreepikDownloadLink(userUrl);
    const endTime = Date.now();
    
    console.log('\n=== RESULTS ===');
    console.log('✅ SUCCESS: Download link extracted!');
    console.log('🔗 Download Link:', downloadLink);
    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    
    // Analysis of the result
    console.log('\n=== ANALYSIS ===');
    
    // Check for tracking pixels
    if (downloadLink.includes('/download.gif')) {
      console.log('❌ FAILURE: Got tracking pixel instead of download URL');
      console.log('   This indicates the system is still capturing tracking pixels.');
      console.log('   URL contains "/download.gif" which should be excluded.');
    } else {
      console.log('✅ SUCCESS: Did not get tracking pixel URL');
    }
    
    // Check for API endpoints
    if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
      console.log('❌ FAILURE: Got API endpoint instead of download URL');
      console.log('   This indicates the system is still capturing API endpoints.');
    } else {
      console.log('✅ SUCCESS: Did not get API endpoint URL');
    }
    
    // Check for valid CDN domains
    const validCdns = ['videocdn.cdnpk.net', 'downloadscdn', 'audiocdn.cdnpk.net', 'cdn-icons.flaticon.com', '3d.cdnpk.net'];
    const hasValidCdn = validCdns.some(cdn => downloadLink.includes(cdn));
    
    if (hasValidCdn) {
      console.log('✅ SUCCESS: Got URL from valid CDN');
      console.log(`   CDN: ${validCdns.find(cdn => downloadLink.includes(cdn))}`);
    } else {
      console.log('⚠️  WARNING: URL not from recognized CDN');
      console.log('   This might still be a valid download URL, but from an unexpected source.');
    }
    
    // Check for valid file extensions
    const validExtensions = ['.mov', '.mp4', '.zip', '.psd', '.jpg', '.png', '.svg', '.mp3', '.wav', '.obj', '.fbx'];
    const hasValidExtension = validExtensions.some(ext => downloadLink.includes(ext));
    
    if (hasValidExtension) {
      console.log('✅ SUCCESS: URL has valid file extension');
      console.log(`   Extension: ${validExtensions.find(ext => downloadLink.includes(ext))}`);
    } else {
      console.log('⚠️  WARNING: URL does not have recognized file extension');
    }
    
    // Overall assessment
    if (downloadLink.includes('/download.gif')) {
      console.log('\n🚨 CRITICAL ISSUE: Still getting tracking pixels!');
      console.log('   The system is not properly filtering out tracking pixels.');
    } else if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
      console.log('\n🚨 CRITICAL ISSUE: Still getting API endpoints!');
      console.log('   The system is not properly filtering out API endpoints.');
    } else if (hasValidCdn && hasValidExtension) {
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
      console.error('Stack trace:', error.stack);
    }
  } finally {
    rl.close();
    await cleanup();
  }
}

userSpecificTest();