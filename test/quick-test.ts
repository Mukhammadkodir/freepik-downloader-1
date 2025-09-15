import { getDownloadLink, close } from '../src/downloader/link-extractor';
import * as dotenv from 'dotenv';

dotenv.config();

async function quickTest() {
  console.log('Quick test of download link extraction...');
  
  // Test a video URL (non-icon)
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
    
    // Verify it's a valid download link (not an API endpoint)
    if (downloadLink.includes('/api/') || downloadLink.includes('walletId=')) {
      console.log('❌ ERROR: Extracted link is an API endpoint, not a direct download URL');
      console.log('This indicates the fix is not working properly.');
    } else if (downloadLink.includes('downloadscdn') || 
        downloadLink.includes('videocdn.cdnpk.net') || 
        downloadLink.includes('cdn-icons.flaticon.com')) {
      console.log('✅ SUCCESS: Link verification passed - URL is from Freepik CDN');
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

quickTest();