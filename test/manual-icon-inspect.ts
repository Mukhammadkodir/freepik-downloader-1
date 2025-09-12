import * as dotenv from 'dotenv';
import puppeteer, { Browser, Page, CDPSession, CookieParam } from 'puppeteer';
import { getSavedCookie } from '../src/cookie/cookie';
import { PUPPETEER_ARGS, PUPPETEER_EXECUTABLE_PATH, PUPPETEER_HEADLESS } from '../src/config';

dotenv.config();

// Copy the necessary functions and variables from link-extractor
const DOWNLOAD_PATH = './download';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const bootUrl = 'https://freepik.com';

let browser: Browser;
let page: Page;
let client: CDPSession;

const boot = async () => {
    browser = await puppeteer.launch({
        executablePath: PUPPETEER_EXECUTABLE_PATH || undefined,
        headless: false, // Run in non-headless mode for debugging
        args: PUPPETEER_ARGS
    });

    page = await browser.newPage();
    await page.goto(bootUrl);

    client = await page.target().createCDPSession();
    await client.send('Network.enable');
};

const setCookie = async () => {
    const excludeCookie = ['OptanonConsent'];
    const cookiesObject = getSavedCookie();
    
    const cookies: CookieParam[] = [];
    
    if (typeof cookiesObject === 'object' && cookiesObject !== null) {
        for (const [name, value] of Object.entries(cookiesObject)) {
            if (!excludeCookie.includes(name)) {
                cookies.push({
                    name: name,
                    value: String(value),
                    domain: '.freepik.com',
                    path: '/',
                    httpOnly: false,
                    secure: true
                });
            }
        }
    }

    await page.setCookie(...cookies);
    await page.cookies(bootUrl);
    await page.setUserAgent(USER_AGENT);
};

const sleep = async (duration: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, duration);
    });
};

const close = async () => {
    if (browser) {
        await browser.close();
    }
};

async function manualIconInspect() {
  console.log('Manual icon inspection test...');
  
  try {
    // Use an icon URL for testing
    const iconUrl = 'https://www.freepik.com/icon/location_4249665';
    
    console.log('Initializing browser...');
    await boot();
    await setCookie();
    
    console.log(`Navigating to Freepik URL: ${iconUrl}`);
    await page.goto(iconUrl, { waitUntil: 'networkidle2' });
    await sleep(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'manual-inspect-initial.png', fullPage: true });
    console.log('Saved initial screenshot to manual-inspect-initial.png');
    
    // Log all elements with data-cy attributes
    const dataCyElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[data-cy]'));
      return elements.map((el, index) => ({
        index,
        tagName: el.tagName,
        dataCy: el.getAttribute('data-cy') || '',
        text: el.textContent ? el.textContent.trim().substring(0, 100) : '',
        className: typeof el.className === 'string' ? el.className.substring(0, 100) : ''
      }));
    });
    
    console.log('All data-cy elements:');
    dataCyElements.forEach(el => {
      console.log(`  ${el.tagName}[data-cy="${el.dataCy}"] - "${el.text}"`);
    });
    
    // Try to find all buttons on the page
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map((btn, index) => ({
        index,
        text: btn.textContent ? btn.textContent.trim().substring(0, 100) : '',
        dataCy: btn.getAttribute('data-cy') || '',
        className: typeof btn.className === 'string' ? btn.className.substring(0, 100) : '',
        id: btn.id
      }));
    });
    
    console.log('All buttons on page:');
    allButtons.forEach(btn => {
      if (btn.text || btn.dataCy) {
        console.log(`  Button: "${btn.text}" [data-cy="${btn.dataCy}"] [class="${btn.className}"] [id="${btn.id}"]`);
      }
    });
    
    console.log('Test completed. Browser will remain open for manual inspection.');
    console.log('Please manually click the download arrow button and observe what happens.');
    console.log('Press Ctrl+C to close the browser when done.');
    
    // Keep the process running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Manual inspection test failed:', error.message);
  } finally {
    await close();
  }
}

manualIconInspect();