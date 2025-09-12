import freepik from '../src'
import * as dotenv from 'dotenv'
import { getDownloadLink, close } from '../src/downloader/link-extractor';

dotenv.config()

async function testLinkExtraction() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Starting link extraction test...');
  try {
    // Extract the download link
    console.log('Extracting download link...');
    const downloadLink = await getDownloadLink(process.env.TEST_DOWNLOAD_URL!);
    console.log('Download link extracted successfully:');
    console.log(downloadLink);
    
    // Close the browser
    await close();
  } catch (error) {
    console.error('Link extraction failed:', error.message);
    
    // Close the browser even if there was an error
    await close();
  }
}

testLinkExtraction();