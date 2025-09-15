import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function debugFullWorkflow() {
  console.log('=== FULL WORKFLOW DEBUG TEST ===');
  console.log('This test will provide detailed debugging information about the entire process.');
  
  // Use a known problematic URL or get from environment
  const testUrl = process.env.TEST_DOWNLOAD_URL || 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
  
  console.log(`Testing URL: ${testUrl}`);
  
  try {
    // Clear any existing debug files
    if (fs.existsSync('debug-link-extractor.png')) {
      fs.unlinkSync('debug-link-extractor.png');
    }
    
    console.log('\n--- STEP 1: Extracting download link ---');
    const startTime = Date.now();
    const downloadLink = await extractFreepikDownloadLink(testUrl);
    const endTime = Date.now();
    
    console.log('✅ SUCCESS: Download link extracted!');
    console.log('🔗 Download Link:', downloadLink);
    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    
    // Check if debug screenshot was created
    if (fs.existsSync('debug-link-extractor.png')) {
      console.log('📸 Debug screenshot created: debug-link-extractor.png');
    } else {
      console.log('⚠️  No debug screenshot found');
    }
    
    console.log('\n--- STEP 2: Detailed URL Analysis ---');
    
    // Check for tracking pixels
    const isTrackingPixel = downloadLink.includes('/download.gif');
    console.log(`📊 Contains tracking pixel (/download.gif): ${isTrackingPixel ? 'YES ❌' : 'NO ✅'}`);
    
    // Check for API endpoints
    const isApiEndpoint = downloadLink.includes('/api/') || downloadLink.includes('walletId=');
    console.log(`📊 Contains API endpoint: ${isApiEndpoint ? 'YES ❌' : 'NO ✅'}`);
    
    // Check for valid CDN domains
    const validCdns = ['videocdn.cdnpk.net', 'downloadscdn', 'audiocdn.cdnpk.net', 'cdn-icons.flaticon.com', '3d.cdnpk.net'];
    const validCdn = validCdns.find(cdn => downloadLink.includes(cdn));
    console.log(`📊 Valid CDN domain: ${validCdn ? `${validCdn} ✅` : 'NONE ⚠️'}`);
    
    // Check for valid file extensions
    const validExtensions = ['.mov', '.mp4', '.zip', '.psd', '.jpg', '.png', '.svg', '.mp3', '.wav', '.obj', '.fbx'];
    const validExtension = validExtensions.find(ext => downloadLink.includes(ext));
    console.log(`📊 Valid file extension: ${validExtension ? `${validExtension} ✅` : 'NONE ⚠️'}`);
    
    console.log('\n--- STEP 3: Validation Logic Check ---');
    
    // Replicate the exact validation logic from telegram-bot-helper.ts
    const invalidPatterns = [
      '/api/',
      'walletId=',
      '/download.gif', // tracking pixel
      '/user/downloads/limit'
    ];
    
    const isValidDownloadUrl = !invalidPatterns.some(pattern => downloadLink.includes(pattern));
    console.log(`✅ URL validation passed: ${isValidDownloadUrl ? 'YES' : 'NO'}`);
    
    const isFromValidCdn = validCdns.some(domain => downloadLink.includes(domain));
    console.log(`✅ From valid CDN: ${isFromValidCdn ? 'YES' : 'NO'}`);
    
    const hasValidExtension = validExtensions.some(ext => downloadLink.includes(ext));
    console.log(`✅ Has valid extension: ${hasValidExtension ? 'YES' : 'NO'}`);
    
    if (!isFromValidCdn && !hasValidExtension) {
      console.log('⚠️  WARNING: URL is not from valid CDN and has no valid extension');
    }
    
    console.log('\n--- STEP 4: Final Assessment ---');
    
    if (isTrackingPixel) {
      console.log('🚨 CRITICAL ISSUE: Still getting tracking pixels!');
      console.log('   The system is not properly filtering out tracking pixels.');
    } else if (isApiEndpoint) {
      console.log('🚨 CRITICAL ISSUE: Still getting API endpoints!');
      console.log('   The system is not properly filtering out API endpoints.');
    } else if (validCdn && validExtension) {
      console.log('🎉 OVERALL SUCCESS: System is working correctly!');
      console.log('   The system successfully provided a proper download URL.');
    } else {
      console.log('⚠️  PARTIAL SUCCESS: URL received but format is unexpected');
      console.log('   Manual verification recommended.');
    }
    
    // Show the complete URL breakdown
    console.log('\n--- STEP 5: URL Breakdown ---');
    console.log('Full URL:', downloadLink);
    console.log('URL Length:', downloadLink.length);
    
    // Try to identify what type of URL this is
    if (downloadLink.includes('videocdn.cdnpk.net')) {
      console.log('📝 Type: Video CDN URL');
    } else if (downloadLink.includes('downloadscdn')) {
      console.log('📝 Type: General Download CDN URL');
    } else if (downloadLink.includes('cdn-icons.flaticon.com')) {
      console.log('📝 Type: Icon CDN URL');
    } else if (downloadLink.includes('audiocdn.cdnpk.net')) {
      console.log('📝 Type: Audio CDN URL');
    } else if (downloadLink.includes('3d.cdnpk.net')) {
      console.log('📝 Type: 3D Model CDN URL');
    } else {
      console.log('📝 Type: Unknown/Other URL');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    
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

debugFullWorkflow();