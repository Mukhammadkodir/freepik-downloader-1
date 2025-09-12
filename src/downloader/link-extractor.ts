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
const bootUrl = 'https://freepik.com'

let browser: Browser
let page: Page
let client: CDPSession

const boot = async () => {
    /* Launch new instance */
    browser = await puppeteer.launch({
        executablePath: PUPPETEER_EXECUTABLE_PATH || undefined,
        headless: PUPPETEER_HEADLESS,
        args: PUPPETEER_ARGS
    })

    page = await browser.newPage()
    await page.goto(bootUrl)

    /* Enable network interception */
    client = await page.target().createCDPSession()
    await client.send('Network.enable');
}

const setCookie = async (cookiesObject?: object | string) => {
    const excludeCookie = ['OptanonConsent']
    if (!cookiesObject) {
        cookiesObject = getSavedCookie()
    }
    
    // Convert cookies to Puppeteer format
    const cookies: CookieParam[] = []
    
    // Handle both string and object formats
    if (typeof cookiesObject === 'string') {
        // Parse cookie string format
        const cookiePairs = cookiesObject.split('; ');
        for (const pair of cookiePairs) {
            const [name, value] = pair.split('=');
            if (name && value !== undefined && !excludeCookie.includes(name)) {
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
    } else if (typeof cookiesObject === 'object' && cookiesObject !== null) {
        // Handle object format
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
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true)
        }, duration)
    })
}

const close = async () => {
    if (browser) {
        await browser.close()
    }
}

/**
 * Extracts the direct download link for a Freepik asset without downloading the file
 * @param url The Freepik asset URL
 * @param cookiesObject Optional cookies object or cookie string
 * @returns The direct download URL
 */
export const getDownloadLink = async (url: string, cookiesObject?: object | string): Promise<string> => {
    if (!browser) {
        await boot()
    }

    await setCookie(cookiesObject)

    try {
        console.log(`Navigating to Freepik URL: ${url}`);
        // Remove URL fragments/parameters that might cause navigation issues
        const cleanUrl = url.split('#')[0].split('?')[0];
        console.log(`Cleaned URL: ${cleanUrl}`);
        // Navigate to the asset page
        await page.goto(cleanUrl, { waitUntil: 'networkidle2' });
        await sleep(5000);

        // Take a screenshot for debugging
        await page.screenshot({ path: 'debug-link-extractor.png', fullPage: true });
        console.log('Saved debug screenshot to debug-link-extractor.png');

        // Log page title and URL for debugging
        const title = await page.title();
        const currentUrl = page.url();
        console.log(`Page title: ${title}`);
        console.log(`Current URL: ${currentUrl}`);

        // Check if we're on the login page (redirected)
        if (currentUrl.includes('/login')) {
            throw new Error('Redirected to login page - cookies may be invalid or expired');
        }

        // Ensure client is properly initialized
        if (!client) {
            client = await page.target().createCDPSession();
            await client.send('Network.enable');
        }

        // Set up network interception to capture the download URL
        let interceptedUrl = null;
        
        const requestHandler = (request) => {
            const reqUrl = request.request.url;
            // Log ALL network requests to see what's happening
            console.log('Network request:', reqUrl.substring(0, 150)); // Increase URL length for cleaner logs
            
            // FIRST: Check for direct file downloads from Freepik's CDNs - this is the most reliable
            const freepikCdnDomains = ['downloadscdn', 'videocdn.cdnpk.net', 'cdn-icons.flaticon.com'];
            const fileExtensions = ['.zip', '.rar', '.psd', '.jpg', '.png', '.mov', '.mp4', '.svg'];
            
            if (freepikCdnDomains.some(domain => reqUrl.includes(domain)) &&
                fileExtensions.some(ext => reqUrl.includes(ext))) {
                console.log('*** CAPTURED DIRECT FILE DOWNLOAD FROM FREEPIK CDN:', reqUrl);
                // Always set this as our intercepted URL since it's the most reliable
                interceptedUrl = reqUrl;
                return; // Exit early since we found the best possible URL
            }
            
            // SECOND: Check for specific known download patterns
            if ((reqUrl.includes('downloadscdn') || reqUrl.includes('videocdn.cdnpk.net') || reqUrl.includes('cdn-icons.flaticon.com')) &&
                (reqUrl.includes('.zip') || reqUrl.includes('.rar') || reqUrl.includes('.psd') || reqUrl.includes('.jpg') || 
                 reqUrl.includes('.png') || reqUrl.includes('.mov') || reqUrl.includes('.mp4') || reqUrl.includes('.svg') ||
                 reqUrl.includes('/download/') || reqUrl.includes('/asset/'))) {
                console.log('*** INTERCEPTED DOWNLOAD CDN URL:', reqUrl);
                // For icons, we want the SVG URL from cdn-icons.flaticon.com
                if (url.includes('/icon/') && reqUrl.includes('cdn-icons.flaticon.com') && reqUrl.includes('.svg')) {
                    interceptedUrl = reqUrl;
                    console.log('*** CAPTURED ICON SVG DOWNLOAD URL:', reqUrl);
                } 
                // For other assets, we want the downloadscdn or videocdn URLs
                else if (!url.includes('/icon/') && (reqUrl.includes('downloadscdn') || reqUrl.includes('videocdn.cdnpk.net'))) {
                    interceptedUrl = reqUrl;
                    console.log('*** CAPTURED ASSET DOWNLOAD URL:', reqUrl);
                }
                return; // Exit early
            }
            
            // THIRD: Check for API download calls - be very specific
            if (reqUrl.includes('/api/icon/download') && reqUrl.includes('format=svg')) {
                console.log('*** INTERCEPTED ICON API DOWNLOAD CALL:', reqUrl);
                interceptedUrl = reqUrl;
                return; // Exit early
            }
            
            // FOURTH: Look for any requests to download endpoints - but be very specific to avoid API endpoints
            // Only capture URLs that are likely to be actual download URLs, not API endpoints
            // EXCLUDE known API endpoints that are NOT actual download URLs
            const excludedEndpoints = [
                '/api/user/downloads/limit',
                '/api/user/downloads',
                '/api/pricing-plans',
                '/download.gif', // This is a tracking pixel, not an actual download
                '/api/wallet',
                '/api/user',
                '/api/auth'
            ];
            
            const isExcluded = excludedEndpoints.some(endpoint => reqUrl.includes(endpoint));
            
            // More specific filtering to avoid capturing API endpoints
            if ((reqUrl.includes('/download') || reqUrl.includes('/asset')) && 
                !isExcluded &&
                !reqUrl.includes('limit') &&
                !reqUrl.includes('/user/downloads/') &&
                !reqUrl.includes('/api/user/downloads/') &&
                !reqUrl.includes('/api/') && // Exclude all API endpoints
                (reqUrl.includes('freepik.com') || 
                 reqUrl.includes('downloadscdn') || 
                 reqUrl.includes('videocdn.cdnpk.net') || 
                 reqUrl.includes('cdn-icons.flaticon.com'))) {
                console.log('*** POTENTIAL DOWNLOAD ENDPOINT:', reqUrl);
                // Only set interceptedUrl if we haven't already captured a more specific URL
                // and only if it's not one of our excluded endpoints
                if (!interceptedUrl) {
                    interceptedUrl = reqUrl;
                }
            }
            
            // FIFTH: Special case for walletId parameter which indicates an API endpoint, not a download
            if (reqUrl.includes('walletId=')) {
                console.log('*** EXCLUDED API ENDPOINT WITH WALLET ID:', reqUrl);
                return; // Don't capture this as it's an API endpoint
            }
        };
        
        // Also listen for response received events to capture download URLs from responses
        const responseHandler = (response) => {
            const responseUrl = response.response.url;
            // Log response URLs that might contain download information - but only from Freepik domains
            if ((responseUrl.includes('freepik.com') || responseUrl.includes('flaticon.com')) && 
                (responseUrl.includes('api') || responseUrl.includes('flaticon') || responseUrl.includes('download'))) {
                console.log('*** FREEPIK API RESPONSE:', responseUrl);
                
                // Check if this is a redirect to a download URL
                if (response.response.status >= 300 && response.response.status < 400) {
                    const location = response.response.headers.location || response.response.headers.Location;
                    if (location) {
                        console.log('*** REDIRECT TO:', location);
                        // Only capture redirects to Freepik download domains
                        if ((location.includes('downloadscdn') || location.includes('videocdn.cdnpk.net') || location.includes('flaticon')) &&
                            (location.includes('.zip') || location.includes('.rar') || location.includes('.psd') || 
                             location.includes('.jpg') || location.includes('.png') || location.includes('.mov') || 
                             location.includes('.mp4') || location.includes('.svg'))) {
                            interceptedUrl = location;
                            console.log('*** CAPTURED REDIRECT DOWNLOAD URL:', location);
                        }
                    }
                }
            }
        };
        
        client.on('Network.requestWillBeSent', requestHandler);
        client.on('Network.responseReceived', responseHandler);

        // Wait for potential download buttons to appear
        await page.waitForSelector('button[data-cy="download-button"]', { timeout: 10000 }).catch(() => {
            console.log('Download button not found immediately, continuing anyway');
        });
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'debug-page.png', fullPage: true });
        console.log('Saved page screenshot to debug-page.png');
        
        // For icons, we have a specific workflow
        if (url.includes('/icon/')) {
            console.log('Handling icon download workflow...');
            
            // Extract icon ID from URL (handle URL parameters correctly)
            const urlParts = cleanUrl.split('/');
            const iconIdentifier = urlParts[urlParts.length - 1]; // e.g., "location_4249665"
            // Extract just the ID part, removing any URL parameters
            const iconId = iconIdentifier.split('_')[1]?.split('#')[0]?.split('?')[0]; // e.g., "4249665"
            
            if (iconId) {
                console.log('Icon ID extracted:', iconId);
                
                // Try multiple flaticon URL patterns
                const flaticonUrls = [
                    `https://cdn-icons.flaticon.com/free-icon/${iconId}.svg`,
                    `https://cdn-icons.flaticon.com/svg/${iconId}.svg`,
                    `https://cdn-icons.flaticon.com/free-svg/${iconId}.svg`
                ];
                
                // Try to trigger downloads for each URL
                for (const flaticonUrl of flaticonUrls) {
                    console.log('Attempting flaticon download with URL:', flaticonUrl);
                    
                    try {
                        // Create an image element to trigger the download
                        await page.evaluate((url) => {
                            const img = new Image();
                            img.src = url;
                            img.onload = function() {
                                console.log('Image loaded successfully from:', url);
                                // Create a link to download the image
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'icon.svg';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            };
                            img.onerror = function() {
                                console.log('Failed to load image from:', url);
                            };
                        }, flaticonUrl);
                        
                        console.log('Triggered flaticon download attempt with URL:', flaticonUrl);
                        
                        // Wait to see if this triggers a network request
                        await sleep(3000);
                        
                        // Check if we intercepted a URL
                        if (interceptedUrl) {
                            console.log('Successfully intercepted download URL:', interceptedUrl);
                            return interceptedUrl;
                        }
                    } catch (e) {
                        console.log('Error triggering flaticon download with URL:', flaticonUrl, e.message);
                    }
                }
                
                console.log('None of the flaticon URLs worked, trying direct fetch...');
                
                // If we still haven't intercepted a URL, try a different approach
                // Let's try to make an XMLHttpRequest to see if we can get the content
                for (const flaticonUrl of flaticonUrls) {
                    try {
                        const result = await page.evaluate((url) => {
                            return new Promise((resolve) => {
                                const xhr = new XMLHttpRequest();
                                xhr.open('GET', url, true);
                                xhr.onreadystatechange = function() {
                                    if (xhr.readyState === 4) {
                                        if (xhr.status === 200) {
                                            console.log('XHR success for:', url);
                                            resolve({
                                                success: true,
                                                status: xhr.status,
                                                contentType: xhr.getResponseHeader('content-type')
                                            });
                                        } else {
                                            console.log('XHR failed for:', url, 'Status:', xhr.status);
                                            resolve({
                                                success: false,
                                                status: xhr.status
                                            });
                                        }
                                    }
                                };
                                xhr.onerror = function() {
                                    console.log('XHR error for:', url);
                                    resolve({
                                        success: false,
                                        error: 'Network error'
                                    });
                                };
                                xhr.send();
                            });
                        }, flaticonUrl);
                        
                        console.log('XHR result for', flaticonUrl, ':', result);
                        
                        if (result && (result as any).success) {
                            // If the XHR worked, try to trigger a download
                            try {
                                await page.evaluate((url) => {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = 'icon.svg';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }, flaticonUrl);
                                
                                console.log('Triggered download after successful XHR');
                                await sleep(2000);
                                
                                if (interceptedUrl) {
                                    console.log('Successfully intercepted download URL after XHR:', interceptedUrl);
                                    return interceptedUrl;
                                }
                            } catch (e) {
                                console.log('Failed to trigger download after XHR:', e.message);
                            }
                        }
                    } catch (e) {
                        console.log('Error during XHR attempt:', e.message);
                    }
                }
            }
            
            console.log('Falling back to UI-based approach...');
            
            // Try multiple approaches to click the SVG button
            let svgClickResult = false;
            
            // Approach 1: Try clicking the download arrow button first, then SVG button
            console.log('Approach 1: Clicking download arrow button first...');
            const arrowClickResult = await page.evaluate(() => {
                // Try multiple selectors for the download arrow button
                const selectors = [
                    'button[data-cy="download-arrow-button"]',
                    '[data-cy="download-arrow-button"]',
                    'button[aria-label*="download" i]',
                    'button[title*="download" i]'
                ];
                
                for (const selector of selectors) {
                    const arrowButton = document.querySelector(selector);
                    if (arrowButton) {
                        const element = arrowButton as HTMLElement;
                        const style = window.getComputedStyle(element);
                        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetHeight > 0;
                        
                        if (isVisible) {
                            console.log('Clicking download arrow button with selector:', selector);
                            element.click();
                            return true;
                        } else {
                            console.log('Arrow button found but not visible with selector:', selector);
                        }
                    }
                }
                
                return false;
            });
            
            if (arrowClickResult) {
                console.log('Successfully clicked download arrow button');
                // Wait for menu to appear
                await sleep(3000);
                
                // Modify CSS styles to make dropdown visible
                await page.evaluate(() => {
                    // Try to find the dropdown element
                    const dropdownSelectors = [
                        '[data-cy="download-dropdown"]',
                        '[role="menu"]',
                        '.dropdown-menu',
                        '.popup-menu',
                        '[data-radix-menu-content]',
                        '[data-state="open"]'
                    ];
                    
                    for (const selector of dropdownSelectors) {
                        const dropdowns = document.querySelectorAll(selector);
                        dropdowns.forEach((dropdown) => {
                            const element = dropdown as HTMLElement;
                            console.log('Found dropdown with selector:', selector);
                            
                            // Modify CSS to make it visible
                            element.style.position = 'fixed';
                            element.style.left = '0px';
                            element.style.top = '0px';
                            element.style.zIndex = '9999';
                            element.style.display = 'block';
                            element.style.visibility = 'visible';
                            
                            console.log('Modified dropdown CSS styles to make it visible');
                        });
                    }
                });
                
                // Try to click SVG button in dropdown
                svgClickResult = await page.evaluate(() => {
                    // Look for SVG button with specific selectors
                    const svgSelectors = [
                        'button[data-cy="download-svg-button"]',
                        '[data-cy="download-svg-button"]',
                        'button[data-format="svg"]',
                        '[data-format="svg"]',
                        'button:contains("SVG")'
                    ];
                    
                    for (const selector of svgSelectors) {
                        const svgButtons = document.querySelectorAll(selector);
                        svgButtons.forEach((svgButton) => {
                            const element = svgButton as HTMLElement;
                            const style = window.getComputedStyle(element);
                            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetHeight > 0;
                            
                            if (isVisible) {
                                console.log('Found and clicking SVG button with selector:', selector);
                                element.click();
                                return true; // Return from the evaluate function
                            }
                        });
                        
                        // If we found buttons but none were visible, try to make them visible
                        if (svgButtons.length > 0) {
                            svgButtons.forEach((svgButton) => {
                                const element = svgButton as HTMLElement;
                                element.style.position = 'relative';
                                element.style.display = 'block';
                                element.style.visibility = 'visible';
                                element.style.zIndex = '9999';
                                console.log('Made SVG button visible with selector:', selector);
                            });
                            
                            // Try clicking again
                            const firstButton = svgButtons[0] as HTMLElement;
                            if (firstButton) {
                                console.log('Clicking first SVG button after making it visible');
                                firstButton.click();
                                return true;
                            }
                        }
                    }
                    
                    // Fallback: Look for any button with SVG text
                    const allButtons = Array.from(document.querySelectorAll('button'));
                    for (const button of allButtons) {
                        const text = button.textContent ? button.textContent.trim() : '';
                        const style = window.getComputedStyle(button);
                        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && (button as HTMLElement).offsetHeight > 0;
                        
                        if (isVisible && text.toUpperCase() === 'SVG') {
                            console.log('Found and clicking SVG button by text content');
                            (button as HTMLElement).click();
                            return true;
                        }
                    }
                    
                    return false;
                });
            }
            
            // Approach 2: If arrow button approach failed, try clicking SVG button directly
            if (!svgClickResult) {
                console.log('Approach 2: Trying to click SVG button directly...');
                svgClickResult = await page.evaluate(() => {
                    // Look for any button with SVG text
                    const allButtons = Array.from(document.querySelectorAll('button'));
                    for (const button of allButtons) {
                        const text = button.textContent ? button.textContent.trim() : '';
                        const style = window.getComputedStyle(button);
                        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && (button as HTMLElement).offsetHeight > 0;
                        
                        if (isVisible && text.toUpperCase() === 'SVG') {
                            console.log('Found and clicking SVG button by text content');
                            (button as HTMLElement).click();
                            return true;
                        }
                    }
                    
                    return false;
                });
            }
            
            if (svgClickResult) {
                console.log('Successfully clicked SVG button for icon download');
            } else {
                console.log('Failed to click SVG button with all approaches');
            }
        } else {
            // For non-icon assets, use the original approach
            console.log('Handling regular asset download workflow...');
            
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
                
                // First, try to find the main download button by looking for buttons with download-related attributes
                // BUT exclude buttons that are clearly not download buttons
                const downloadButtonSelectors = [
                    'button[data-cy="download-button"]',
                    'button[data-cy="premium-download-button"]',
                    'button[data-testid="download-button"]',
                    '[data-cy="download-button"]',
                    '[data-cy="premium-download-button"]'
                ];
                
                for (const selector of downloadButtonSelectors) {
                    const elements = document.querySelectorAll(selector);
                    console.log(`Found ${elements.length} elements with selector: ${selector}`);
                    
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i] as HTMLElement;
                        // Check if element is visible
                        const style = window.getComputedStyle(element);
                        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                        
                        // Get the text content to check if it's a download button
                        const text = element.textContent || '';
                        const dataCy = element.getAttribute('data-cy') || '';
                        
                        // Skip buttons that are clearly not download buttons
                        if (text.toLowerCase().includes('premium') && !text.toLowerCase().includes('download')) {
                            console.log(`Skipping premium button with selector: ${selector}`);
                            continue;
                        }
                        
                        console.log(`Element ${i} visibility - display: ${style.display}, visibility: ${style.visibility}, offsetParent: ${element.offsetParent !== null}`);
                        console.log(`Element text: "${text}", data-cy: "${dataCy}"`);
                        
                        if (isVisible) {
                            console.log('Clicking download button with selector:', selector);
                            console.log('Button text:', element.textContent);
                            console.log('Button HTML:', element.outerHTML.substring(0, 200));
                            element.click();
                            return true;
                        }
                    }
                }
                
                // Try to find any button with "Download" text in the main content area
                const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
                const allButtons = Array.from(mainContent.querySelectorAll('button, a'));
                for (const button of allButtons) {
                    const text = (button.textContent || '').toLowerCase();
                    const style = window.getComputedStyle(button);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && (button as HTMLElement).offsetParent !== null;
                    
                    // Look for actual download buttons, not premium upgrade buttons
                    if (text.includes('download') && !text.includes('premium') && isVisible) {
                        console.log('Clicking download button found by text:', text);
                        console.log('Button HTML:', button.outerHTML.substring(0, 200));
                        (button as HTMLElement).click();
                        return true;
                    }
                }
                
                // Try to find any element with download-related text (excluding premium)
                const allElements = Array.from(document.querySelectorAll('button, a, div, span'));
                for (const element of allElements) {
                    const text = (element.textContent || '').toLowerCase();
                    const style = window.getComputedStyle(element);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && (element as HTMLElement).offsetParent !== null;
                    
                    if ((text.includes('download') || text.includes('free download')) && 
                        !text.includes('premium') && 
                        !text.includes('upgrade') && 
                        isVisible) {
                        console.log('Clicking element found by text:', text);
                        console.log('Element HTML:', element.outerHTML.substring(0, 200));
                        (element as HTMLElement).click();
                        return true;
                    }
                }
                
                // Try a more direct approach - look for the download button by its structure
                const downloadButtons = document.querySelectorAll('button');
                for (const button of downloadButtons) {
                    const element = button as HTMLElement;
                    const style = window.getComputedStyle(element);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                    
                    // Check if it has the download icon (svg with path)
                    const svg = element.querySelector('svg');
                    if (svg && isVisible) {
                        const path = svg.querySelector('path');
                        if (path) {
                            const dAttr = path.getAttribute('d') || '';
                            // Look for common download icon patterns
                            if (dAttr.includes('M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20') || 
                                dAttr.includes('M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z') ||
                                element.textContent?.toLowerCase().includes('download')) {
                                // Make sure it's not a premium button
                                const text = (element.textContent || '').toLowerCase();
                                if (!text.includes('premium') && !text.includes('upgrade')) {
                                    console.log('Found download button by icon pattern');
                                    console.log('Button HTML:', element.outerHTML.substring(0, 200));
                                    element.click();
                                    return true;
                                }
                            }
                        }
                    }
                }
                
                // Try a more specific approach for Freepik - look for buttons with specific aria labels or titles
                const potentialDownloadButtons = document.querySelectorAll('button[aria-label*="download" i]:not([aria-label*="premium" i]), button[title*="download" i]:not([title*="premium" i])');
                for (const button of potentialDownloadButtons) {
                    const element = button as HTMLElement;
                    const style = window.getComputedStyle(element);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                    
                    if (isVisible) {
                        console.log('Found download button by aria-label or title');
                        console.log('Button HTML:', element.outerHTML.substring(0, 200));
                        element.click();
                        return true;
                    }
                }
                
                // Try another approach - look for buttons near the main content area
                const buttonsInMain = mainContent.querySelectorAll('button');
                for (const button of buttonsInMain) {
                    const element = button as HTMLElement;
                    const style = window.getComputedStyle(element);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                    
                    if (isVisible) {
                        const text = (element.textContent || '').toLowerCase();
                        // Look for buttons that might be download buttons based on their text or classes
                        if ((text.includes('download') && !text.includes('premium')) || 
                            element.className.toLowerCase().includes('download') ||
                            (element.getAttribute('data-cy') || '').toLowerCase().includes('download')) {
                            // Skip premium-related buttons
                            if (!text.includes('premium') && !text.includes('upgrade')) {
                                console.log('Found potential download button in main content');
                                console.log('Button HTML:', element.outerHTML.substring(0, 200));
                                element.click();
                                return true;
                            }
                        }
                        
                        // Check for SVG icons inside the button
                        const svgIcon = element.querySelector('svg');
                        if (svgIcon) {
                            console.log('Found button with SVG icon in main content');
                            console.log('Button HTML:', element.outerHTML.substring(0, 200));
                            element.click();
                            return true;
                        }
                    }
                }
                
                // Last resort - try to click on any button that looks like it might be a primary action button
                // But exclude premium/upgrade buttons
                const primaryButtons = document.querySelectorAll('button[class*="primary"], button[class*="main"], button[class*="action"]');
                for (const button of primaryButtons) {
                    const element = button as HTMLElement;
                    const style = window.getComputedStyle(element);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                    const text = (element.textContent || '').toLowerCase();
                    
                    // Skip premium-related buttons
                    if (text.includes('premium') || text.includes('upgrade')) {
                        continue;
                    }
                    
                    if (isVisible) {
                        console.log('Found primary action button');
                        console.log('Button HTML:', element.outerHTML.substring(0, 200));
                        element.click();
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
        }

        console.info('Waiting for download URL interception...')

        // Wait for the download URL to be intercepted
        const startTime = Date.now();
        const timeout = 60000; // Increase timeout to 60 seconds for problematic assets
        
        while (!interceptedUrl && (Date.now() - startTime) < timeout) {
            await sleep(1000);
            console.log('Still waiting for download URL interception...');
        }
        
        // Remove the event listener
        client.off('Network.requestWillBeSent', requestHandler);
        client.off('Network.responseReceived', responseHandler);
        
        if (!interceptedUrl) {
            // Try one more approach - scroll to bottom and wait a bit more
            console.log('Trying final approach - scrolling to bottom and waiting...');
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await sleep(5000);
            
            // Check if we got a URL now
            if (interceptedUrl) {
                console.log('Successfully intercepted download URL after final approach:', interceptedUrl);
                return interceptedUrl;
            }
            
            // Log all network requests we've seen so far
            console.log('Failed to intercept download URL. Total wait time:', (Date.now() - startTime) / 1000, 'seconds');
            throw new Error('Failed to intercept download URL within timeout period');
        }
        
        console.log('Successfully intercepted download URL:', interceptedUrl);
        return interceptedUrl;
        
    } catch (e) {
        console.error('Download link extraction error:', e);
        throw new Error(e.message || 'Failed to extract download link');
    }
}

export { close }