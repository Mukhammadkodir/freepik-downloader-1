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

async function detailedIconDebug() {
  console.log('Detailed icon debug test...');
  
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
    await page.screenshot({ path: 'icon-before-click.png', fullPage: true });
    console.log('Saved initial screenshot to icon-before-click.png');
    
    // Click the download arrow button
    console.log('Clicking download arrow button...');
    const arrowClickResult = await page.evaluate(() => {
      // Try to click the download arrow button
      const arrowButton = document.querySelector('button[data-cy="download-arrow-button"]');
      if (arrowButton) {
        const element = arrowButton as HTMLElement;
        const style = window.getComputedStyle(element);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
        
        if (isVisible) {
          console.log('Clicking download arrow button');
          element.click();
          return true;
        }
      }
      return false;
    });
    
    if (arrowClickResult) {
      console.log('Successfully clicked download arrow button');
      // Wait for menu to appear
      await sleep(3000);
      
      // Take screenshot after clicking arrow button
      await page.screenshot({ path: 'icon-after-arrow-click.png', fullPage: true });
      console.log('Saved screenshot after arrow click to icon-after-arrow-click.png');
      
      // Inspect the page content to see what elements are available
      const pageContent = await page.evaluate(() => {
        // Get all buttons
        const buttons = Array.from(document.querySelectorAll('button'));
        const buttonInfo = buttons.map((btn, index) => ({
          index,
          text: btn.textContent ? btn.textContent.trim() : '',
          dataCy: btn.getAttribute('data-cy') || '',
          className: btn.className,
          id: btn.id
        }));
        
        // Get all elements with data-cy attributes
        const dataCyElements = Array.from(document.querySelectorAll('[data-cy]'));
        const dataCyInfo = dataCyElements.map((el, index) => ({
          index,
          tagName: el.tagName,
          dataCy: el.getAttribute('data-cy') || '',
          text: el.textContent ? el.textContent.trim().substring(0, 100) : ''
        }));
        
        return {
          buttonCount: buttons.length,
          buttons: buttonInfo,
          dataCyCount: dataCyElements.length,
          dataCyElements: dataCyInfo
        };
      });
      
      console.log('Page content after arrow click:');
      console.log(`Found ${pageContent.buttonCount} buttons`);
      console.log(`Found ${pageContent.dataCyCount} elements with data-cy attributes`);
      
      // Look for download-related buttons
      console.log('Looking for download-related buttons:');
      pageContent.buttons.forEach((btn, index) => {
        if (btn.text.toLowerCase().includes('download') || 
            btn.dataCy.includes('download') || 
            btn.text.trim().toUpperCase() === 'SVG') {
          console.log('Potential download button:', btn);
        }
      });
      
      // Look for data-cy elements
      console.log('Looking for data-cy elements:');
      pageContent.dataCyElements.forEach((el, index) => {
        if (el.dataCy.includes('download') || el.text.toLowerCase().includes('svg')) {
          console.log('Potential data-cy element:', el);
        }
      });
      
      // Try to find and click SVG option
      console.log('Looking for SVG format option...');
      const svgClickResult = await page.evaluate(() => {
        // Look for the SVG button with the specific data-cy attribute
        const svgButton = document.querySelector('button[data-cy="download-svg-button"]');
        if (svgButton) {
          const element = svgButton as HTMLElement;
          const style = window.getComputedStyle(element);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
          
          if (isVisible) {
            console.log('Found and clicking SVG format option with data-cy');
            element.click();
            return true;
          }
        }
        
        // Fallback: look for any button with SVG text
        const allButtons = Array.from(document.querySelectorAll('button'));
        for (const button of allButtons) {
          const text = button.textContent || '';
          const style = window.getComputedStyle(button);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && (button as HTMLElement).offsetParent !== null;
          
          if (isVisible && text.trim().toUpperCase() === 'SVG') {
            console.log('Found SVG button by text content');
            (button as HTMLElement).click();
            return true;
          }
        }
        
        // Look for any element with SVG in data-cy
        const svgElements = Array.from(document.querySelectorAll('[data-cy*="svg"]'));
        if (svgElements.length > 0) {
          const element = svgElements[0] as HTMLElement;
          const style = window.getComputedStyle(element);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
          
          if (isVisible) {
            console.log('Found SVG element by data-cy attribute');
            element.click();
            return true;
          }
        }
        
        return false;
      });
      
      if (svgClickResult) {
        console.log('Successfully clicked SVG format option');
        await sleep(2000);
        await page.screenshot({ path: 'icon-after-svg.png', fullPage: true });
        console.log('Saved screenshot after SVG click to icon-after-svg.png');
      } else {
        console.log('Could not find SVG option');
      }
    } else {
      console.log('Failed to click download arrow button');
    }
    
  } catch (error) {
    console.error('Icon debug test failed:', error.message);
  } finally {
    await close();
  }
}

detailedIconDebug();