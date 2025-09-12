#!/usr/bin/env node

/**
 * Debug Script for Freepik Downloader
 * This script helps diagnose issues with the Freepik downloader by examining the page content
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function debugPage() {
    console.log('🚀 Starting Freepik page debug...');
    
    // Launch browser
    const browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set cookies from environment
    const cookiesString = process.env.TEST_COOKIE;
    if (cookiesString) {
        const cookies = cookiesString.split('; ').map(cookie => {
            const [name, value] = cookie.split('=');
            return {
                name,
                value,
                domain: '.freepik.com',
                path: '/'
            };
        });
        
        await page.setCookie(...cookies);
        console.log('✅ Cookies set');
    }
    
    try {
        // Navigate to Freepik
        console.log('🌐 Navigating to Freepik...');
        await page.goto('https://www.freepik.com', { waitUntil: 'networkidle2' });
        
        // Wait a bit for page to load
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Take a screenshot
        await page.screenshot({ path: 'freepik-homepage.png', fullPage: true });
        console.log('📸 Homepage screenshot saved as freepik-homepage.png');
        
        // Check if logged in
        const signInButton = await page.$('[data-cy="signin-button"], .signin, .login');
        if (signInButton) {
            console.log('❌ Not logged in - Sign in button found');
        } else {
            console.log('✅ Appears to be logged in - No sign in button found');
        }
        
        // Navigate to a premium asset page
        console.log('🌐 Navigating to premium asset...');
        const testUrl = process.env.TEST_DOWNLOAD_URL || 'https://www.freepik.com/premium-vector/continuous-one-line-drawing-thank-you-text_11439558.htm';
        await page.goto(testUrl, { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Take screenshot of asset page
        await page.screenshot({ path: 'freepik-asset.png', fullPage: true });
        console.log('📸 Asset page screenshot saved as freepik-asset.png');
        
        // Try to find download elements
        console.log('🔍 Searching for download elements...');
        
        const selectorsToTry = [
            '[data-cy="download-button"]',
            '[data-cy="download-counter"]',
            '[class*="download"]',
            '[class*="counter"]',
            'button',
            'a'
        ];
        
        for (const selector of selectorsToTry) {
            try {
                const elements = await page.$$(selector);
                console.log(`  Found ${elements.length} elements matching: ${selector}`);
                
                // Get text content of first few elements
                for (let i = 0; i < Math.min(3, elements.length); i++) {
                    const text = await page.evaluate(el => el.textContent, elements[i]);
                    const className = await page.evaluate(el => el.className, elements[i]);
                    console.log(`    Element ${i+1}: "${text.trim()}" (class: ${className})`);
                }
            } catch (e) {
                console.log(`  Error checking selector ${selector}: ${e.message}`);
            }
        }
        
        // Get page title and URL
        const title = await page.title();
        const url = page.url();
        console.log(`\n📄 Page Info:`);
        console.log(`  Title: ${title}`);
        console.log(`  URL: ${url}`);
        
        // Save HTML for inspection
        const html = await page.content();
        fs.writeFileSync('freepik-page.html', html);
        console.log(`\n💾 Page HTML saved as freepik-page.html (${html.length} characters)`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
        console.log('\n🏁 Debug complete. Check the generated files for analysis.');
    }
}

debugPage().catch(console.error);