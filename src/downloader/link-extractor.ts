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

    // Set user agent to appear more like a real browser
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
        browser = null
        page = null
        client = null
    }
}

/**
 * Detects the asset type from the URL
 */
const detectAssetType = (url: string): string => {
    if (url.includes('/icon/')) return 'icon';
    if (url.includes('/video/') || url.includes('premium-video') || url.includes('free-video')) return 'video';
    if (url.includes('/3d-model/') || url.includes('3d-models')) return '3d';
    if (url.includes('/audio/') || url.includes('premium-audio') || url.includes('free-audio')) return 'audio';
    if (url.includes('/font/')) return 'font';
    if (url.includes('/psd/') || url.includes('premium-psd') || url.includes('free-psd')) return 'psd';
    if (url.includes('/vector/') || url.includes('premium-vector') || url.includes('free-vector')) return 'vector';
    if (url.includes('/photo/') || url.includes('premium-photo') || url.includes('free-photo')) return 'photo';
    if (url.includes('/template/') || url.includes('premium-template') || url.includes('free-template')) return 'template';
    if (url.includes('/mockup/') || url.includes('premium-mockup') || url.includes('free-mockup')) return 'mockup';
    return 'unknown';
}

/**
 * Gets the appropriate download selectors based on asset type
 */
const getDownloadSelectors = (assetType: string) => {
    const commonSelectors = [
        'button[data-cy="download-button"]',
        '[data-cy="download-button"]',
        'button[data-cy="premium-download-button"]',
        '[data-cy="premium-download-button"]',
        'button[data-testid="download-button"]',
        '[data-testid="download-button"]'
    ];

    const typeSpecificSelectors = {
        icon: [
            'button[data-cy="download-arrow-button"]',
            '[data-cy="download-arrow-button"]',
            'button[data-cy="download-svg-button"]',
            '[data-cy="download-svg-button"]',
            ...commonSelectors
        ],
        video: [
            'button[data-cy="video-download-button"]',
            '[data-cy="video-download-button"]',
            ...commonSelectors
        ],
        '3d': [
            'button[data-cy="3d-download-button"]',
            '[data-cy="3d-download-button"]',
            ...commonSelectors
        ],
        audio: [
            'button[data-cy="audio-download-button"]',
            '[data-cy="audio-download-button"]',
            ...commonSelectors
        ],
        default: commonSelectors
    };

    return typeSpecificSelectors[assetType] || typeSpecificSelectors.default;
}

/**
 * Clicks the appropriate download button based on asset type
 */
const clickDownloadButton = async (assetType: string, targetPage: Page) => {
    const selectors = getDownloadSelectors(assetType);
    
    console.log(`Attempting to click download button for ${assetType} asset...`);
    
    const clickResult = await targetPage.evaluate((selectors, assetType) => {
        console.log(`Looking for download buttons with ${selectors.length} selectors for ${assetType}`);
        
        // Try each selector
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`Found ${elements.length} elements with selector: ${selector}`);
            
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLElement;
                const style = window.getComputedStyle(element);
                const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                
                if (isVisible) {
                    const text = element.textContent || '';
                    console.log(`Clicking element with selector: ${selector}, text: "${text}"`);
                    element.click();
                    return true;
                }
            }
        }
        
        // Fallback: Look for any button with download-related text
        const allButtons = Array.from(document.querySelectorAll('button, a'));
        for (const button of allButtons) {
            const element = button as HTMLElement;
            const style = window.getComputedStyle(element);
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
            const text = (element.textContent || '').toLowerCase();
            
            // Look for download buttons, but exclude premium/upgrade buttons
            if (isVisible && text.includes('download') && !text.includes('premium') && !text.includes('upgrade')) {
                console.log(`Clicking download button found by text: "${text}"`);
                element.click();
                return true;
            }
        }
        
        // Special handling for icons - try to click SVG format
        if (assetType === 'icon') {
            // Look for format selection buttons
            const formatButtons = Array.from(document.querySelectorAll('button'));
            for (const button of formatButtons) {
                const element = button as HTMLElement;
                const style = window.getComputedStyle(element);
                const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                const text = (element.textContent || '').trim().toUpperCase();
                
                if (isVisible && text === 'SVG') {
                    console.log('Clicking SVG format button for icon');
                    element.click();
                    return true;
                }
            }
        }
        
        return false;
    }, selectors, assetType);
    
    return clickResult;
};

/**
 * Improved network request handler that captures download URLs for all asset types
 */
const createNetworkHandler = (assetType: string) => {
    let interceptedUrl = null;
    
    const requestHandler = (request) => {
        const reqUrl = request.request.url;
        
        // Skip if we already found a good URL
        if (interceptedUrl) return;
        
        // Log network requests for debugging
        if (reqUrl.includes('freepik') || reqUrl.includes('flaticon') || reqUrl.includes('cdn')) {
            console.log('Network request:', reqUrl.substring(0, 150));
        }
        
        // Define CDN patterns for different asset types
        const cdnPatterns = {
            icon: [
                'cdn-icons.flaticon.com',
                'flaticon.com/svg',
                'flaticon.com/free-icon'
            ],
            video: [
                'videocdn.cdnpk.net',
                'downloadscdn',
                'freepik.com/download'
            ],
            '3d': [
                'downloadscdn',
                '3d.cdnpk.net',
                'freepik.com/download'
            ],
            audio: [
                'audiocdn.cdnpk.net',
                'downloadscdn',
                'freepik.com/download'
            ],
            default: [
                'downloadscdn',
                'videocdn.cdnpk.net',
                'audiocdn.cdnpk.net',
                'cdn-icons.flaticon.com',
                'freepik.com/download'
            ]
        };
        
        const patterns = cdnPatterns[assetType] || cdnPatterns.default;
        
        // Check if this is a download URL from any of the CDN patterns
        const isFromCDN = patterns.some(pattern => reqUrl.includes(pattern));
        
        if (isFromCDN) {
            // Define file extensions for different asset types
            const fileExtensions = {
                icon: ['.svg', '.png', '.ico'],
                video: ['.mp4', '.mov', '.avi', '.webm', '.zip'],
                '3d': ['.zip', '.obj', '.fbx', '.blend'],
                audio: ['.mp3', '.wav', '.aac', '.zip'],
                photo: ['.jpg', '.jpeg', '.png', '.webp', '.zip'],
                vector: ['.svg', '.ai', '.eps', '.zip'],
                psd: ['.psd', '.zip'],
                template: ['.zip', '.psd', '.ai'],
                mockup: ['.psd', '.zip'],
                font: ['.ttf', '.otf', '.woff', '.zip'],
                default: ['.zip', '.rar', '.psd', '.jpg', '.png', '.svg', '.mp4', '.mov', '.mp3', '.wav']
            };
            
            const extensions = fileExtensions[assetType] || fileExtensions.default;
            const hasValidExtension = extensions.some(ext => reqUrl.includes(ext));
            
            // Special handling for different asset types
            if (assetType === 'icon') {
                // For icons, prioritize SVG from flaticon CDN
                if (reqUrl.includes('cdn-icons.flaticon.com') && reqUrl.includes('.svg')) {
                    console.log('*** CAPTURED ICON SVG DOWNLOAD URL:', reqUrl);
                    interceptedUrl = reqUrl;
                    return;
                }
                // Also accept PNG icons
                if (reqUrl.includes('cdn-icons.flaticon.com') && reqUrl.includes('.png')) {
                    console.log('*** CAPTURED ICON PNG DOWNLOAD URL:', reqUrl);
                    interceptedUrl = reqUrl;
                    return;
                }
            } else if (assetType === 'video') {
                // For videos, look for video CDN or download URLs
                if ((reqUrl.includes('videocdn.cdnpk.net') || reqUrl.includes('downloadscdn')) && 
                    (reqUrl.includes('.mp4') || reqUrl.includes('.mov') || reqUrl.includes('.zip'))) {
                    console.log('*** CAPTURED VIDEO DOWNLOAD URL:', reqUrl);
                    interceptedUrl = reqUrl;
                    return;
                }
                // Special case: video download API endpoints that actually lead to real downloads
                if (reqUrl.includes('/api/video/') && reqUrl.includes('/download') && !reqUrl.includes('limit')) {
                    console.log('*** CAPTURED VIDEO API DOWNLOAD ENDPOINT:', reqUrl);
                    // Don't set this immediately, let's see if we get a redirect to a real file
                }
            } else if (assetType === '3d') {
                // For 3D models, look for download URLs with 3D file extensions
                if (reqUrl.includes('downloadscdn') && 
                    (reqUrl.includes('.zip') || reqUrl.includes('.obj') || reqUrl.includes('.fbx'))) {
                    console.log('*** CAPTURED 3D MODEL DOWNLOAD URL:', reqUrl);
                    interceptedUrl = reqUrl;
                    return;
                }
            } else if (assetType === 'audio') {
                // For audio, look for audio CDN or download URLs
                if ((reqUrl.includes('audiocdn.cdnpk.net') || reqUrl.includes('downloadscdn')) && 
                    (reqUrl.includes('.mp3') || reqUrl.includes('.wav') || reqUrl.includes('.zip'))) {
                    console.log('*** CAPTURED AUDIO DOWNLOAD URL:', reqUrl);
                    interceptedUrl = reqUrl;
                    return;
                }
            }
            
            // General case for other asset types
            if (hasValidExtension) {
                console.log(`*** CAPTURED ${assetType.toUpperCase()} DOWNLOAD URL:`, reqUrl);
                interceptedUrl = reqUrl;
                return;
            }
        }
        
        // Fallback: Check for any download-related URLs
        const downloadKeywords = ['/download/', '/asset/', '/file/'];
        const isDownloadUrl = downloadKeywords.some(keyword => reqUrl.includes(keyword));
        
        if (isDownloadUrl && reqUrl.includes('freepik.com')) {
            // Exclude API endpoints and tracking pixels
            const excludedEndpoints = [
                '/api/user/downloads/limit',
                '/api/user/downloads',
                '/api/pricing-plans',
                '/download.gif', // tracking pixel
                '/api/wallet',
                '/api/user',
                '/api/auth'
            ];
            
            const isExcluded = excludedEndpoints.some(endpoint => reqUrl.includes(endpoint));
            
            // Additional check for walletId parameters which indicate API endpoints
            const hasWalletId = reqUrl.includes('walletId=');
            
            // Additional check for tracking pixels
            const isTrackingPixel = reqUrl.includes('/download.gif');
            
            if (!isExcluded && !hasWalletId && !isTrackingPixel) {
                console.log('*** POTENTIAL DOWNLOAD URL:', reqUrl);
                // Only set as intercepted URL if we haven't already captured a better one
                // and only if it looks like a real download URL
                const validExtensions = ['.zip', '.rar', '.psd', '.jpg', '.png', '.svg', '.mp4', '.mov', '.mp3', '.wav', '.obj', '.fbx'];
                const hasValidExtension = validExtensions.some(ext => reqUrl.includes(ext));
                
                // If it has a valid extension or is from a known CDN, it's more likely to be a real download
                const cdnDomains = ['downloadscdn', 'videocdn.cdnpk.net', 'audiocdn.cdnpk.net', 'cdn-icons.flaticon.com', '3d.cdnpk.net'];
                const isFromCdn = cdnDomains.some(domain => reqUrl.includes(domain));
                
                if (hasValidExtension || isFromCdn) {
                    // Prioritize this over previously intercepted URLs
                    console.log('*** PROMOTING TO INTERCEPTED URL (better quality):', reqUrl);
                    interceptedUrl = reqUrl;
                } else if (!interceptedUrl) {
                    // Only set as fallback if we haven't captured anything yet
                    interceptedUrl = reqUrl;
                }
            } else {
                console.log('*** EXCLUDED URL (tracking pixel, API endpoint, or walletId):', reqUrl);
            }
        }
    };
    
    const responseHandler = (response) => {
        const responseUrl = response.response.url;
        
        // Skip if we already found a good URL
        if (interceptedUrl) return;
        
        // Check for redirects to download URLs
        if (response.response.status >= 300 && response.response.status < 400) {
            const location = response.response.headers.location || response.response.headers.Location;
            if (location) {
                console.log('*** REDIRECT TO:', location);
                
                // Check if redirect is to a download URL
                const cdnDomains = ['downloadscdn', 'videocdn.cdnpk.net', 'audiocdn.cdnpk.net', 'cdn-icons.flaticon.com', '3d.cdnpk.net'];
                const isDownloadRedirect = cdnDomains.some(domain => location.includes(domain));
                
                // Also check for valid file extensions
                const validExtensions = ['.zip', '.rar', '.psd', '.jpg', '.png', '.svg', '.mp4', '.mov', '.mp3', '.wav', '.obj', '.fbx'];
                const hasValidExtension = validExtensions.some(ext => location.includes(ext));
                
                if (isDownloadRedirect || hasValidExtension) {
                    console.log('*** CAPTURED REDIRECT DOWNLOAD URL:', location);
                    interceptedUrl = location;
                    return;
                }
            }
        }
        
        // Special handling for video API responses that might contain download URLs
        if (responseUrl.includes('/api/video/') && response.response.status === 200) {
            // Try to parse the response body for download URLs
            // Note: This is more complex and might require additional handling
            console.log('*** VIDEO API RESPONSE:', responseUrl);
        }
    };
    
    // Return a function to reset the interceptedUrl for subsequent requests
    const resetInterceptedUrl = () => {
        interceptedUrl = null;
    };
    
    return { 
        requestHandler, 
        responseHandler, 
        getInterceptedUrl: () => interceptedUrl,
        resetInterceptedUrl
    };
};

/**
 * Extracts the direct download link for a Freepik asset without downloading the file
 * @param url The Freepik asset URL
 * @param cookiesObject Optional cookies object or cookie string
 * @returns The direct download URL
 */
export const getDownloadLink = async (url: string, cookiesObject?: object | string): Promise<string> => {
    // Always completely close and recreate browser for each request
    // This ensures no state leakage between requests
    if (browser) {
        try {
            await browser.close();
        } catch (e) {
            console.log('Error closing browser:', e);
        }
        browser = null;
        page = null;
        client = null;
    }
    
    // Boot fresh browser instance
    await boot();
    await setCookie(cookiesObject);

    try {
        console.log(`Navigating to Freepik URL: ${url}`);
        
        // Detect asset type from URL
        const assetType = detectAssetType(url);
        console.log(`Detected asset type: ${assetType}`);
        
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

        // Set up network interception based on asset type
        const networkHandler = createNetworkHandler(assetType);
        
        // Reset the intercepted URL for each new request
        networkHandler.resetInterceptedUrl();
        
        // Store the listener functions so we can remove them later
        const requestListener = networkHandler.requestHandler;
        const responseListener = networkHandler.responseHandler;
        
        // Add event listeners
        client.on('Network.requestWillBeSent', requestListener);
        client.on('Network.responseReceived', responseListener);

        // Wait for potential download buttons to appear
        await page.waitForSelector('button', { timeout: 10000 }).catch(() => {
            console.log('No buttons found immediately, continuing anyway');
        });
        
        // Special handling for icons
        if (assetType === 'icon') {
            console.log('Handling icon download workflow...');
            
            // First, try to click the download arrow button
            const arrowClickResult = await page.evaluate(() => {
                const arrowButton = document.querySelector('button[data-cy="download-arrow-button"]');
                if (arrowButton) {
                    const element = arrowButton as HTMLElement;
                    const style = window.getComputedStyle(element);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                    
                    if (isVisible) {
                        console.log('Clicking download arrow button for icon');
                        element.click();
                        return true;
                    }
                }
                return false;
            });
            
            if (arrowClickResult) {
                console.log('Successfully clicked download arrow button');
                await sleep(3000);
                
                // Now try to click SVG format button
                const svgClickResult = await page.evaluate(() => {
                    // Look for SVG button in dropdown
                    const svgButton = document.querySelector('button[data-cy="download-svg-button"]');
                    if (svgButton) {
                        const element = svgButton as HTMLElement;
                        const style = window.getComputedStyle(element);
                        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
                        
                        if (isVisible) {
                            console.log('Clicking SVG format button');
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
                            console.log('Clicking SVG button found by text');
                            (button as HTMLElement).click();
                            return true;
                        }
                    }
                    
                    return false;
                });
                
                if (svgClickResult) {
                    console.log('Successfully clicked SVG format button');
                } else {
                    console.log('Could not find SVG format button, trying direct icon URL approach...');
                    
                    // Extract icon ID and try direct flaticon URLs
                    const urlParts = cleanUrl.split('/');
                    const iconIdentifier = urlParts[urlParts.length - 1];
                    const iconId = iconIdentifier.split('_')[1]?.split('#')[0]?.split('?')[0];
                    
                    if (iconId) {
                        const flaticonUrls = [
                            `https://cdn-icons.flaticon.com/free-icon/${iconId}.svg`,
                            `https://cdn-icons.flaticon.com/svg/${iconId}.svg`,
                            `https://cdn-icons.flaticon.com/free-svg/${iconId}.svg`
                        ];
                        
                        // Try to trigger downloads for each URL
                        for (const flaticonUrl of flaticonUrls) {
                            await page.evaluate((url) => {
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'icon.svg';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }, flaticonUrl);
                            
                            await sleep(2000);
                            
                            const currentIntercepted = networkHandler.getInterceptedUrl();
                            if (currentIntercepted) {
                                console.log('Successfully intercepted icon URL via direct approach');
                                break;
                            }
                        }
                    }
                }
            } else {
                console.log('Could not find download arrow button for icon');
            }
        } else {
            // For non-icon assets, use the standard download button approach
            const clickResult = await clickDownloadButton(assetType, page);
            
            if (clickResult) {
                console.log(`Successfully clicked download button for ${assetType}`);
            } else {
                console.log(`Could not find download button for ${assetType}, but continuing to wait for intercepted URL`);
            }
        }

        console.info('Waiting for download URL interception...')

        // Wait for the download URL to be intercepted
        const startTime = Date.now();
        const timeout = 60000; // 60 seconds timeout
        
        while (!networkHandler.getInterceptedUrl() && (Date.now() - startTime) < timeout) {
            await sleep(1000);
            console.log('Still waiting for download URL interception...');
        }
        
        // Remove the event listeners to prevent conflicts in future requests
        client.off('Network.requestWillBeSent', requestListener);
        client.off('Network.responseReceived', responseListener);
        
        const finalInterceptedUrl = networkHandler.getInterceptedUrl();
        
        if (!finalInterceptedUrl) {
            console.log('Failed to intercept download URL. Total wait time:', (Date.now() - startTime) / 1000, 'seconds');
            throw new Error(`Failed to intercept download URL for ${assetType} asset within timeout period`);
        }
        
        console.log('Successfully intercepted download URL:', finalInterceptedUrl);
        return finalInterceptedUrl;
        
    } catch (e) {
        console.error('Download link extraction error:', e);
        throw new Error(e.message || 'Failed to extract download link');
    } finally {
        // Always close browser completely after each request
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.log('Error closing browser in finally block:', closeError);
            }
            browser = null;
            page = null;
            client = null;
        }
    }
}

export { close }