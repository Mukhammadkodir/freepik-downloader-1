import puppeteer, { CookieParam } from 'puppeteer';
import { PUPPETEER_ARGS, PUPPETEER_EXECUTABLE_PATH, PUPPETEER_HEADLESS } from '../src/config';
import * as dotenv from 'dotenv';

dotenv.config();

async function browserTest() {
  console.log('=== BROWSER TEST ===');
  
  let browser;
  
  try {
    console.log('Launching browser...');
    
    // Launch new instance
    browser = await puppeteer.launch({
      executablePath: PUPPETEER_EXECUTABLE_PATH || undefined,
      headless: PUPPETEER_HEADLESS,
      args: PUPPETEER_ARGS
    });
    
    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    // Set user agent to appear more like a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set cookies if available
    const testCookie = process.env.TEST_COOKIE;
    if (testCookie) {
      console.log('Setting cookies...');
      
      // Parse cookie string format
      const cookiePairs = testCookie.split('; ');
      const cookies: CookieParam[] = [];
      
      for (const pair of cookiePairs) {
        const [name, value] = pair.split('=');
        if (name && value !== undefined) {
          cookies.push({
            name: name.trim(),
            value: decodeURIComponent(value),
            domain: '.freepik.com',
            path: '/',
            httpOnly: false,
            secure: true
          });
        }
      }
      
      await page.setCookie(...cookies);
      console.log('Cookies set successfully');
    }
    
    console.log('Navigating to Freepik...');
    await page.goto('https://www.freepik.com', { waitUntil: 'networkidle2' });
    console.log('Successfully navigated to Freepik');
    
    const title = await page.title();
    console.log('Page title:', title);
    
    const url = page.url();
    console.log('Current URL:', url);
    
    // Take a screenshot
    await page.screenshot({ path: 'browser-test.png', fullPage: true });
    console.log('Screenshot saved to browser-test.png');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

browserTest().catch(console.error);