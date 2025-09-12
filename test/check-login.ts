import freepik from '../src'
import * as dotenv from 'dotenv'
import puppeteer from 'puppeteer'
import { PUPPETEER_ARGS, PUPPETEER_EXECUTABLE_PATH, PUPPETEER_HEADLESS } from '../src/config';

dotenv.config()

async function checkLoginStatus() {
  console.log('Setting cookie...');
  freepik.setCookie(process.env.TEST_COOKIE!);
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: PUPPETEER_EXECUTABLE_PATH || undefined,
    headless: PUPPETEER_HEADLESS,
    args: PUPPETEER_ARGS
  });

  const page = await browser.newPage();
  
  // Set a more realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  // Set viewport to a realistic size
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Enable stealth mode to avoid detection
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  });
  
  // Set the cookie
  const { getSavedCookie } = await import('../src/cookie/cookie');
  const cookiesObject = getSavedCookie();
  
  const cookies = Object.entries(cookiesObject).map(([name, value]) => ({
    name,
    value: String(value),
    domain: '.freepik.com',
    path: '/',
    httpOnly: false,
    secure: true
  }));
  
  await page.setCookie(...cookies);
  
  console.log('Navigating to main page first...');
  await page.goto('https://www.freepik.com/');
  
  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Navigating to downloads page...');
  await page.goto('https://www.freepik.com/user/downloads');
  
  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Get page title and URL
  const title = await page.title();
  const url = page.url();
  console.log('Page title:', title);
  console.log('Page URL:', url);
  
  // Check if we're on the login page
  if (url.includes('/login')) {
    console.log('❌ REDIRECTED TO LOGIN PAGE - COOKIES NOT WORKING');
  } else {
    console.log('✅ NOT REDIRECTED TO LOGIN PAGE');
  }
  
  // Check if we're logged in by looking for account-specific elements
  const signInButton = await page.$('button[data-cy="signin-button"], [class*="signin"], [class*="login"]');
  if (signInButton) {
    console.log('❌ Sign in button found - NOT LOGGED IN');
    const signInText = await page.evaluate(el => el.textContent, signInButton);
    console.log('Sign in button text:', signInText);
  } else {
    console.log('✅ Sign in button NOT found - likely logged in');
  }
  
  // Check for user profile or account elements
  const profileElements = await page.$$('.text-surface-foreground-0, [class*="user"], [class*="account"]');
  console.log('Found', profileElements.length, 'profile/account elements');
  
  // Check for download counter or usage information
  const usageElements = await page.$$('.download, .usage, .quota, .limit, [class*="download"]');
  console.log('Found', usageElements.length, 'usage-related elements');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'login-check.png', fullPage: true });
  console.log('Screenshot saved as login-check.png');
  
  // Get and log some of the page content for analysis
  const content = await page.content();
  console.log('Page content length:', content.length);
  
  // Look for specific text that might indicate account status
  if (content.includes('device') || content.includes('Device')) {
    console.log('Found "device" text in page content');
  }
  if (content.includes('limit') || content.includes('Limit')) {
    console.log('Found "limit" text in page content');
  }
  if (content.includes('subscription') || content.includes('Subscription')) {
    console.log('Found "subscription" text in page content');
  }
  
  await browser.close();
  console.log('Browser closed');
}

checkLoginStatus().catch(console.error);