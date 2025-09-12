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
    await page.screenshot({ path: 'icon-debug-initial.png', fullPage: true });
    console.log('Saved initial screenshot to icon-debug-initial.png');
    
    // Log all elements with data-cy attributes
    const dataCyElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[data-cy]'));
      return elements.map((el, index) => ({
        index,
        tagName: el.tagName,
        dataCy: el.getAttribute('data-cy') || '',
        text: el.textContent ? el.textContent.trim().substring(0, 100) : '',
        className: el.className.substring(0, 100)
      }));
    });
    
    console.log('All data-cy elements:');
    dataCyElements.forEach(el => {
      if (el.dataCy.includes('download')) {
        console.log(`  ${el.tagName}[data-cy="${el.dataCy}"] - "${el.text}"`);
      }
    });
    
    // Click the download arrow button
    console.log('Clicking download arrow button...');
    const arrowClickResult = await page.evaluate(() => {
      // Try to click the download arrow button
      const arrowButton = document.querySelector('button[data-cy="download-arrow-button"]');
      if (arrowButton) {
        const element = arrowButton as HTMLElement;
        const style = window.getComputedStyle(element);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
        
        console.log('Arrow button visibility:', {
          display: style.display,
          visibility: style.visibility,
          offsetParent: element.offsetParent !== null
        });
        
        if (isVisible) {
          console.log('Clicking download arrow button');
          element.click();
          return true;
        } else {
          console.log('Arrow button found but not visible');
        }
      } else {
        console.log('Arrow button not found');
      }
      return false;
    });
    
    if (arrowClickResult) {
      console.log('Successfully clicked download arrow button');
      // Wait for menu to appear
      await sleep(5000);
      
      // Take screenshot after clicking arrow button
      await page.screenshot({ path: 'icon-debug-after-arrow.png', fullPage: true });
      console.log('Saved screenshot after arrow click to icon-debug-after-arrow.png');
      
      // Check if dropdown exists and is visible
      const dropdownInfo = await page.evaluate(() => {
        const dropdown = document.querySelector('[data-cy="download-dropdown"]');
        if (dropdown) {
          const element = dropdown as HTMLElement;
          const style = window.getComputedStyle(element);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
          
          console.log('Dropdown visibility info:', {
            display: style.display,
            visibility: style.visibility,
            offsetParent: element.offsetParent !== null,
            position: style.position,
            zIndex: style.zIndex
          });
          
          // Try to make it visible if it's not
          if (!isVisible) {
            console.log('Making dropdown visible');
            element.style.position = 'relative';
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.zIndex = '9999';
          }
          
          return {
            found: true,
            visible: isVisible,
            style: {
              display: style.display,
              visibility: style.visibility,
              position: style.position,
              zIndex: style.zIndex
            }
          };
        }
        return { found: false, visible: false };
      });
      
      console.log('Dropdown info:', dropdownInfo);
      
      // Look for SVG button
      const svgButtonInfo = await page.evaluate(() => {
        const dropdown = document.querySelector('[data-cy="download-dropdown"]');
        if (dropdown) {
          const svgButton = dropdown.querySelector('button[data-cy="download-svg-button"]');
          if (svgButton) {
            const element = svgButton as HTMLElement;
            const style = window.getComputedStyle(element);
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
            
            console.log('SVG button visibility info:', {
              display: style.display,
              visibility: style.visibility,
              offsetParent: element.offsetParent !== null
            });
            
            return {
              found: true,
              visible: isVisible,
              text: element.textContent ? element.textContent.trim() : ''
            };
          }
          return { found: true, visible: false, text: 'SVG button not found in dropdown' };
        }
        return { found: false, visible: false, text: 'Dropdown not found' };
      });
      
      console.log('SVG button info:', svgButtonInfo);
      
      if (svgButtonInfo.found && svgButtonInfo.visible) {
        console.log('Clicking SVG button...');
        const svgClickResult = await page.evaluate(() => {
          const dropdown = document.querySelector('[data-cy="download-dropdown"]');
          if (dropdown) {
            const svgButton = dropdown.querySelector('button[data-cy="download-svg-button"]');
            if (svgButton) {
              const element = svgButton as HTMLElement;
              element.click();
              return true;
            }
          }
          return false;
        });
        
        if (svgClickResult) {
          console.log('Successfully clicked SVG button');
          await sleep(2000);
          await page.screenshot({ path: 'icon-debug-after-svg.png', fullPage: true });
          console.log('Saved screenshot after SVG click to icon-debug-after-svg.png');
        } else {
          console.log('Failed to click SVG button');
        }
      } else {
        console.log('SVG button not found or not visible');
      }
    } else {
      console.log('Failed to click download arrow button');
    }
    
  } catch (error) {
    console.error('Icon debug test failed:', error.message);
  } finally {
    // Don't close the browser immediately so we can see what happened
    console.log('Test completed. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to close the browser.');
    // Keep the process running
    await new Promise(() => {});
  }
}

comprehensiveIconDebug();