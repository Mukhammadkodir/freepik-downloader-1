import { join, resolve } from 'path'
import { createWriteStream, readdirSync } from "fs";
import { pipeline } from 'stream/promises';
import axios from 'axios';
import * as http from 'http';
import * as https from 'https';
import { getSavedCookie, saveCookie } from "../cookie/cookie";
import puppeteer, { Browser, CDPSession, CookieParam, Page, Protocol } from 'puppeteer'
import { PUPPETEER_ARGS, PUPPETEER_EXECUTABLE_PATH, PUPPETEER_HEADLESS } from '../config';
import { Downloaded } from '../type';

const DOWNLOAD_PATH = resolve('./download')
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

// selector
const DOWNLOAD_COUNTER_SELECTOR = '[data-cy="download-counter"], [class*="download-counter"], [class*="download"][class*="count"], div#__next>div:nth-child(2)>div:nth-child(3)>div:nth-child(3)>div:nth-child(1)>div:nth-child(2), [class*="downloads"], [class*="usage"], [class*="quota"], [class*="limit"]'
const NATIVE_DOWNLOAD_BUTTON_SELECTOR = 'button[data-cy="download-button"], a[data-cy="download-button"], [data-cy="download-button"], button[class*="download"]'
const SUBSCRIPTION_STATUS_SELECTOR = '*[data-cy="popover-user-my-subscription"]>button>*:nth-child(2), [class*="subscription"]'
const THUMBNAIL_SELECTOR = '*[data-cy="resource-detail-preview"]>img, [class*="preview"] img'
const PRE_DOWNLOAD_BUTTON_SELECTOR = 'button[data-cy="wrapper-download-free"]>button, [data-cy="download-free"], button[class*="download"]'
const SIGN_IN_BUTTON_SELECTOR = '*[data-cy="signin-button"], [class*="signin"], [class*="login"]'

let browser: Browser
let page: Page
let client: CDPSession

const bootUrl = 'https://freepik.com'

const boot = async () => {
    /* Launch new instance */
    browser = await puppeteer.launch({
        executablePath: PUPPETEER_EXECUTABLE_PATH || undefined,
        headless: PUPPETEER_HEADLESS,
        args: PUPPETEER_ARGS
    })

    page = await browser.newPage()
    await page.goto(bootUrl)

    /* Set download behaviour */
    client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: DOWNLOAD_PATH,
    })
    
    // Enable network interception to capture download URLs
    await client.send('Network.enable');
}

const setCookie = async (cookiesObject?: object) => {
    const excludeCookie = ['OptanonConsent']
    if (!cookiesObject) {
        cookiesObject = getSavedCookie()
    }
    
    // Convert cookies to Puppeteer format
    const cookies: CookieParam[] = []
    
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
}

const sleep = async (duration: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, duration)
    })
}

const getCounter = async () => {
    // Try multiple approaches to find the download counter
    const selectors = [
        DOWNLOAD_COUNTER_SELECTOR,
        '[data-cy="download-counter"]',
        '[class*="download-counter"]',
        '[class*="download"][class*="count"]',
        'div#__next>div:nth-child(2)>div:nth-child(3)>div:nth-child(3)>div:nth-child(1)>div:nth-child(2)',
        '[class*="downloads"]',
        '[class*="usage"]',
        '[class*="quota"]',
        '[class*="limit"]'
    ];

    let elementFound = false;
    let counterRaw = null;

    // First try to find any element that might contain download info
    for (const selector of selectors) {
        try {
            await page.waitForSelector(selector, { timeout: 3000 });
            counterRaw = await page.evaluate((sel) => {
                const element = document.querySelector(sel) as HTMLElement;
                return element ? element.innerText : null;
            }, selector);

            if (counterRaw && (counterRaw.includes('/') || counterRaw.includes('of') || counterRaw.match(/\d+/))) {
                elementFound = true;
                break;
            }
        } catch (e) {
            // Continue to next selector
            continue;
        }
    }

    // If not found, try a more general approach
    if (!elementFound) {
        // Look for text that might contain download information
        const downloadText = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            const lines = bodyText.split('\n');
            
            // Look for lines containing download-related keywords
            const downloadLines = lines.filter(line => 
                (line.toLowerCase().includes('download') || line.toLowerCase().includes('usage') || line.toLowerCase().includes('quota')) && 
                (line.includes('/') || line.match(/\d+\s*\/\s*\d+/))
            );
            
            return downloadLines.length > 0 ? downloadLines[0] : null;
        });
        
        if (downloadText) {
            counterRaw = downloadText;
            elementFound = true;
        }
    }

    if (!elementFound) {
        // Check if we're logged in
        const signInButton = await page.$(SIGN_IN_BUTTON_SELECTOR);
        if (signInButton) {
            throw new Error('Not logged in - Token may be expired or invalid');
        }
        
        // If we can't find the counter but we're logged in, return default values
        console.warn('Download counter not found - returning default values');
        return [0, 100] as [number, number]; // Default: 0 used out of 100
    }

    // Parse the counter values
    let counter: number[] = [];
    
    if (counterRaw.includes('/')) {
        counter = counterRaw.split('/').map(str => parseInt(str.trim())).filter(num => !isNaN(num));
    } else if (counterRaw.includes('of')) {
        counter = counterRaw.split('of').map(str => parseInt(str.trim())).filter(num => !isNaN(num));
    } else {
        // Try to extract numbers from the text
        const numbers = counterRaw.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
            counter = numbers.slice(0, 2).map(num => parseInt(num));
        }
    }

    if (counter.length < 2) {
        console.warn('Download counter format error - returning default values');
        return [0, 100] as [number, number]; // Default: 0 used out of 100
    }

    return counter as [number, number];
}

export const downloadByUrl = async (url: string, cookiesObject?: object): Promise<Downloaded> => {
    if (!browser) {
        await boot()
    }

    await setCookie(cookiesObject)

    try {
        // Check subscription status first
        await page.goto('https://www.freepik.com/user/my-subscriptions')
        await sleep(3000)

        await page.goto('https://www.freepik.com/user/downloads')
        await sleep(5000)

        const sign_in_button = await page.evaluate((SIGN_IN_BUTTON_SELECTOR) => {
            return document.querySelector(SIGN_IN_BUTTON_SELECTOR) as HTMLAnchorElement
        }, SIGN_IN_BUTTON_SELECTOR)

        if (sign_in_button) {
            throw new Error('Token expired')
        }

        refreshCookie(await client.send('Network.getAllCookies'))

        // Try to get download counter, but don't fail if not found
        let count = 0;
        let maxCount = 100; // Default values
        try {
            const counterResult = await getCounter();
            count = counterResult[0];
            maxCount = counterResult[1];
        } catch (counterError) {
            console.warn('Could not find download counter, using defaults:', counterError.message);
        }

        if (count >= maxCount) {
            throw new Error('Download limit reached')
        }

        // Navigate to the asset page
        await page.goto(url)
        await sleep(5000)

        // Get thumbnail
        const thumbnail = await page.evaluate((THUMBNAIL_SELECTOR) => {
            const thumb = document.querySelector(THUMBNAIL_SELECTOR)
            return thumb?.getAttribute('src')
        }, THUMBNAIL_SELECTOR)

        // Set up network interception to capture the download URL
        let interceptedUrl = null;
        let interceptedHeaders = {};
        let interceptedCookies = '';
        
        const requestHandler = (request) => {
            const reqUrl = request.request.url;
            // Log ALL network requests to see what's happening
            console.log('Network request:', reqUrl.substring(0, 100)); // Limit URL length for cleaner logs
            
            // Check if this is a download URL from freepik's CDN
            if (reqUrl.includes('downloadscdn')) {
                console.log('*** INTERCEPTED DOWNLOAD CDN URL:', reqUrl);
                console.log('Request headers:', JSON.stringify(request.request.headers, null, 2));
                interceptedUrl = reqUrl;
                // Capture headers for the direct download
                interceptedHeaders = request.request.headers;
                // Capture cookies
                if (request.request.headers && request.request.headers['cookie']) {
                    interceptedCookies = request.request.headers['cookie'];
                }
            }
            
            // Also check for any URLs that might contain download-related terms
            const downloadTerms = ['download', 'asset', 'file', '.zip', '.rar', '.psd'];
            if (downloadTerms.some(term => reqUrl.toLowerCase().includes(term))) {
                console.log('*** POTENTIAL DOWNLOAD URL:', reqUrl);
            }
        };
        
        client.on('Network.requestWillBeSent', requestHandler);

        // Wait for potential download buttons to appear
        await page.waitForSelector('button[data-cy="download-button"]', { timeout: 10000 }).catch(() => {
            console.log('Download button not found immediately, continuing anyway');
        });
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'debug-page.png', fullPage: true });
        console.log('Saved page screenshot to debug-page.png');
        
        // Log all buttons on the page
        const buttons = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.map((btn, index) => ({
                index,
                text: btn.textContent ? btn.textContent.trim().substring(0, 50) : '',
                className: btn.className.substring(0, 100),
                dataCy: btn.getAttribute('data-cy') || '',
                id: btn.id,
                isVisible: (btn as HTMLElement).offsetParent !== null
            }));
        });
        
        console.log('Found', buttons.length, 'buttons on the page');
        buttons.forEach((btn, index) => {
            if (btn.text.toLowerCase().includes('download') || btn.dataCy.includes('download') || btn.className.includes('download')) {
                console.log('Potential download button:', btn);
            }
        });
        
        // Try clicking with the specific selectors from user's data
        console.log('Attempting to click download button');
        const clickResult = await page.evaluate(() => {
            // Log the entire document structure around potential download buttons
            console.log('Document body innerHTML length:', document.body.innerHTML.length);
            
            // Try the exact selectors from the user's provided CSS
            const selectors = [
                'button[data-cy="download-button"]',
                'button.flex.items-center.gap-2.p-2.text-surface-foreground-3',
                '[data-cy="dropdown-download-type"]',
                'button.text-surface-foreground-3:nth-child(1) > svg:nth-child(1)'
            ];
            
            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    console.log(`Found ${elements.length} elements with selector: ${selector}`);
                    
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i] as HTMLElement;
                        // Check if element is visible
                        const style = window.getComputedStyle(element);
                        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                        
                        console.log(`Element ${i} visibility - display: ${style.display}, visibility: ${style.visibility}, offsetParent: ${element.offsetParent !== null}`);
                        
                        if (isVisible) {
                            console.log('Clicking download button with selector:', selector);
                            console.log('Button text:', element.textContent);
                            console.log('Button HTML:', element.outerHTML.substring(0, 200));
                            element.click();
                            return true;
                        }
                    }
                } catch (e) {
                    console.log('Selector failed:', selector, e.message);
                }
            }
            
            // Last resort: try to find any button with "Download" text
            const allButtons = Array.from(document.querySelectorAll('button'));
            for (const button of allButtons) {
                const text = button.textContent || '';
                const style = window.getComputedStyle(button);
                const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && (button as HTMLElement).offsetParent !== null;
                
                if (text.toLowerCase().includes('download') && isVisible) {
                    console.log('Clicking download button found by text:', text);
                    console.log('Button HTML:', button.outerHTML.substring(0, 200));
                    (button as HTMLElement).click();
                    return true;
                }
            }
            
            return false;
        });
        
        if (!clickResult) {
            console.log('Failed to click download button, but continuing to wait for intercepted URL');
        } else {
            console.log('Successfully clicked download button');
        }

        console.info('Waiting for download URL interception...')

        // Wait for the download URL to be intercepted
        const startTime = Date.now();
        const timeout = 30000; // 30 seconds timeout
        
        while (!interceptedUrl && (Date.now() - startTime) < timeout) {
            await sleep(1000);
            console.log('Still waiting for download URL interception...');
        }
        
        // Remove the event listener
        client.off('Network.requestWillBeSent', requestHandler);
        
        if (!interceptedUrl) {
            throw new Error('Failed to intercept download URL within timeout period');
        }
        
        console.log('Successfully intercepted download URL, now downloading directly...');
        
        // Extract filename from URL
        const urlParts = interceptedUrl.split('/');
        const filename = urlParts[urlParts.length - 1].split('?')[0] || 'download.zip';
        const filepath = join(DOWNLOAD_PATH, filename);
        
        // Prepare headers for direct download
        const downloadHeaders = {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-User': '?1',
            'Referer': url,
            ...interceptedHeaders
        };
        
        // Add intercepted cookies if available
        if (interceptedCookies) {
            downloadHeaders['Cookie'] = interceptedCookies;
        }
        
        // Remove headers that might cause issues
        delete downloadHeaders['Host']; // This will be set automatically
        
        console.log('Starting direct download with headers:', JSON.stringify(downloadHeaders, null, 2));
        
        // Perform direct download
        const response = await axios({
            method: 'GET',
            url: interceptedUrl,
            headers: downloadHeaders,
            responseType: 'stream'
        });
        
        // Save the file
        const writer = createWriteStream(filepath);
        await pipeline(response.data, writer);
        
        console.log('Direct download completed:', filepath);
        
        // Create and return Downloaded object
        return new Downloaded(filepath, filename, thumbnail || '', count, maxCount);
        
    } catch (e) {
        console.error('Download error:', e);
        throw new Error(e.message || 'Download failed');
    }
}

function refreshCookie(cookie: Protocol.Network.GetAllCookiesResponse) {
    const cookiesObject = cookie.cookies.reduce((a, c) => {
        a[c.name] = c.value
        return a
    }, {})

    saveCookie(cookiesObject)

    console.info('cookie refreshed')
}