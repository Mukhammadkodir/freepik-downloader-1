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
        headless: PUPPETEER_HEADLESS,
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

async function comprehensiveIconDebug() {
  console.log('Comprehensive icon debug test...');
  
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
    await page.screenshot({ path: 'comprehensive-icon-before-click.png', fullPage: true });
    console.log('Saved initial screenshot to comprehensive-icon-before-click.png');
    
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
      await sleep(5000);
      
      // Take screenshot after clicking arrow button
      await page.screenshot({ path: 'comprehensive-icon-after-arrow-click.png', fullPage: true });
      console.log('Saved screenshot after arrow click to comprehensive-icon-after-arrow-click.png');
      
      // Comprehensive inspection of the page content
      const pageContent = await page.evaluate(() => {
        // Get all elements with data-cy attributes
        const dataCyElements = Array.from(document.querySelectorAll('[data-cy]'));
        const dataCyInfo = dataCyElements.map((el, index) => ({
          index,
          tagName: el.tagName,
          dataCy: el.getAttribute('data-cy') || '',
          text: el.textContent ? el.textContent.trim().substring(0, 100) : '',
          className: (el.className && typeof el.className === 'string') ? el.className.substring(0, 100) : '',
          id: el.id
        }));
        
        // Get all buttons
        const buttons = Array.from(document.querySelectorAll('button'));
        const buttonInfo = buttons.map((btn, index) => ({
          index,
          text: btn.textContent ? btn.textContent.trim() : '',
          dataCy: btn.getAttribute('data-cy') || '',
          className: (btn.className && typeof btn.className === 'string') ? btn.className.substring(0, 100) : '',
          id: btn.id
        }));
        
        // Check specifically for dropdown elements
        const dropdowns = Array.from(document.querySelectorAll('[data-cy*="dropdown"], [role="menu"], [data-radix-menu-content], [data-state="open"]'));
        const dropdownInfo = dropdowns.map((el, index) => ({
          index,
          tagName: el.tagName,
          dataCy: el.getAttribute('data-cy') || '',
          role: el.getAttribute('role') || '',
          className: (el.className && typeof el.className === 'string') ? el.className.substring(0, 100) : '',
          id: el.id,
          innerHTML: el.innerHTML ? el.innerHTML.substring(0, 200) : '',
          state: el.getAttribute('data-state') || ''
        }));
        
        // Also check for any element that might be the dropdown
        const potentialDropdowns = Array.from(document.querySelectorAll('div[class*="dropdown"], div[class*="menu"], div[role="menu"]'));
        const potentialDropdownInfo = potentialDropdowns.map((el, index) => ({
          index,
          tagName: el.tagName,
          dataCy: el.getAttribute('data-cy') || '',
          role: el.getAttribute('role') || '',
          className: (el.className && typeof el.className === 'string') ? el.className.substring(0, 100) : '',
          id: el.id,
          innerHTML: el.innerHTML ? el.innerHTML.substring(0, 200) : '',
          state: el.getAttribute('data-state') || ''
        }));
        
        return {
          dataCyCount: dataCyElements.length,
          dataCyElements: dataCyInfo,
          buttonCount: buttons.length,
          buttons: buttonInfo,
          dropdownCount: dropdowns.length,
          dropdowns: dropdownInfo,
          potentialDropdownCount: potentialDropdowns.length,
          potentialDropdowns: potentialDropdownInfo
        };
      });
      
      console.log('Page content analysis:');
      console.log(`Found ${pageContent.dataCyCount} elements with data-cy attributes`);
      console.log(`Found ${pageContent.buttonCount} buttons`);
      console.log(`Found ${pageContent.dropdownCount} dropdown/menu elements`);
      console.log(`Found ${pageContent.potentialDropdownCount} potential dropdown elements`);
      
      // Look for specific elements
      console.log('\nLooking for download-related elements:');
      pageContent.dataCyElements.forEach((el, index) => {
        if (el.dataCy.includes('download') || el.dataCy.includes('svg')) {
          console.log('Data-cy element:', el);
        }
      });
      
      console.log('\nLooking for dropdown elements:');
      pageContent.dropdowns.forEach((dropdown, index) => {
        console.log('Dropdown element:', dropdown);
      });
      
      console.log('\nLooking for potential dropdown elements:');
      pageContent.potentialDropdowns.forEach((dropdown, index) => {
        console.log('Potential dropdown element:', dropdown);
      });
      
      // Try to find and click SVG option with multiple approaches
      console.log('\nAttempting to find and click SVG button...');
      const svgClickResult = await page.evaluate(() => {
        console.log('Approach 1: Looking for specific dropdown and SVG button');
        // Approach 1: Look for the specific dropdown structure
        const dropdown = document.querySelector('[data-cy="download-dropdown"]');
        if (dropdown) {
          console.log('Found download-dropdown');
          const svgButton = dropdown.querySelector('button[data-cy="download-svg-button"]');
          if (svgButton) {
            console.log('Found download-svg-button within dropdown');
            const element = svgButton as HTMLElement;
            const style = window.getComputedStyle(element);
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
            
            if (isVisible) {
              console.log('SVG button is visible, clicking...');
              element.click();
              return true;
            } else {
              console.log('SVG button found but not visible');
            }
          } else {
            console.log('SVG button not found within dropdown');
            // Log all buttons within dropdown
            const buttons = dropdown.querySelectorAll('button');
            console.log(`Found ${buttons.length} buttons within dropdown:`);
            buttons.forEach((btn, i) => {
              console.log(`  Button ${i}:`, {
                text: btn.textContent,
                dataCy: btn.getAttribute('data-cy'),
                className: btn.className
              });
            });
          }
        } else {
          console.log('download-dropdown not found');
        }
        
        console.log('Approach 2: Looking for any element with SVG text');
        // Approach 2: Look for any button with SVG text
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
        
        console.log('Approach 3: Trying common selectors');
        // Approach 3: Try common selectors
        const commonSelectors = [
          '[data-cy="download-svg-button"]',
          'button[data-cy*="svg"]',
          '[data-cy*="svg"]'
        ];
        
        for (const selector of commonSelectors) {
          const elements = document.querySelectorAll(selector);
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            const style = window.getComputedStyle(element);
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
            
            if (isVisible) {
              console.log(`Clicking element ${i} with selector: ${selector}`);
              element.click();
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (svgClickResult) {
        console.log('Successfully clicked SVG button');
        await sleep(2000);
        await page.screenshot({ path: 'comprehensive-icon-after-svg.png', fullPage: true });
        console.log('Saved screenshot after SVG click to comprehensive-icon-after-svg.png');
      } else {
        console.log('Could not find or click SVG button');
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

comprehensiveIconDebug();