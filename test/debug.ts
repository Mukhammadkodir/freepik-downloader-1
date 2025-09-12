import freepik from '../src'
import * as dotenv from 'dotenv'
dotenv.config()

async function debugDownload() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Starting debug download...');
  try {
    // Import the download function directly to have more control
    const { downloadByUrl } = await import('../src/downloader/auto-downloader');
    
    // First, let's check if we can access the user's subscription page
    console.log('Checking subscription status...');
    
    // Then try to download
    console.log('Attempting download...');
    const file = await downloadByUrl(process.env.TEST_DOWNLOAD_URL!);
    console.log('Download successful:', file);
    file.delete();
  } catch (error) {
    console.error('Download failed:', error.message);
    
    // Let's also try a simpler approach - just checking if we're logged in
    try {
      console.log('Testing login status...');
      // We could add a function to check login status here
    } catch (loginError) {
      console.error('Login check failed:', loginError.message);
    }
  }
}

debugDownload();