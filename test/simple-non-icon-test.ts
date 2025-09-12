import { getDownloadLink, close } from '../src/downloader/link-extractor';
import * as dotenv from 'dotenv';

dotenv.config();

async function testNonIconAssets() {
  console.log('Testing non-icon asset download link extraction...');
  
  // Test a video URL (non-icon)
  const testUrl = 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome';
  
  try {
    console.log(`Testing asset: ${testUrl}`);
    // Pass the TEST_COOKIE from environment variables
    const downloadLink = await getDownloadLink(testUrl, process.env.TEST_COOKIE as any);
    console.log('✅ Download link extracted successfully!');
    console.log('🔗 Download Link:', downloadLink);
    
    // Verify it's a valid download link
    if (downloadLink.includes('downloadscdn') || 
        downloadLink.includes('videocdn.cdnpk.net') || 
        downloadLink.includes('download.gif')) {
      console.log('✅ Link verification passed - URL is from Freepik CDN or related service');
    } else {
      console.log('⚠️ Link verification warning - URL may not be from Freepik CDN');
    }
    
  } catch (error) {
    console.error('❌ Failed to extract download link:', error.message);
  } finally {
    await close();
  }
}

testNonIconAssets();