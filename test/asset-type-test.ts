import { extractFreepikDownloadLink, cleanup } from '../src/telegram-bot-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function assetTypeTest() {
  console.log('=== ASSET TYPE TEST ===');
  console.log('Testing different asset types to identify potential issues...');
  
  // Test different asset types
  const testUrls = [
    {
      type: 'Video',
      url: 'https://www.freepik.com/premium-video/person-analyzes-financial-charts-smartphone_6153704#fromView=subhome'
    },
    {
      type: 'Photo',
      url: 'https://www.freepik.com/premium-photo/businessman-analyzing-financial-charts_1234567.htm'
    },
    {
      type: 'PSD',
      url: 'https://www.freepik.com/premium-psd/financial-report-template_7654321.htm'
    },
    {
      type: 'Vector',
      url: 'https://www.freepik.com/premium-vector/financial-charts-vector_1122334.htm'
    }
  ];
  
  for (const { type, url } of testUrls) {
    try {
      console.log(`\n--- Testing ${type} Asset ---`);
      console.log(`URL: ${url}`);
      
      const downloadLink = await extractFreepikDownloadLink(url);
      
      console.log('✅ SUCCESS: Download link extracted');
      console.log('🔗 Link:', downloadLink.substring(0, 100) + '...');
      
      // Analyze the link
      const analysis = analyzeDownloadLink(downloadLink);
      console.log('📊 Analysis:', analysis);
      
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      
      // Check if this is an expected validation error
      if (error.message.includes('tracking pixel') || 
          error.message.includes('API endpoint') || 
          error.message.includes('valid download URL')) {
        console.log('   (This is expected validation working correctly)');
      }
    }
  }
  
  await cleanup();
}

function analyzeDownloadLink(url: string): string {
  // Check for problematic patterns
  if (url.includes('/download.gif')) {
    return 'TRACKING PIXEL - Should be excluded';
  }
  
  if (url.includes('/api/') || url.includes('walletId=')) {
    return 'API ENDPOINT - Should be excluded';
  }
  
  // Check for valid CDN domains
  const validCdns = ['videocdn.cdnpk.net', 'downloadscdn', 'audiocdn.cdnpk.net', 'cdn-icons.flaticon.com'];
  const cdn = validCdns.find(domain => url.includes(domain));
  
  if (cdn) {
    // Check for valid extensions
    const validExtensions = ['.mov', '.mp4', '.zip', '.psd', '.jpg', '.png', '.svg', '.mp3', '.wav', '.obj', '.fbx'];
    const ext = validExtensions.find(extension => url.includes(extension));
    
    if (ext) {
      return `VALID DOWNLOAD - CDN: ${cdn}, Extension: ${ext}`;
    } else {
      return `PARTIAL VALID - CDN: ${cdn} (extension check failed)`;
    }
  }
  
  return 'UNKNOWN FORMAT - Manual verification needed';
}

assetTypeTest();