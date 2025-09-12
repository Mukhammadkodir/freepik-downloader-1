import * as dotenv from 'dotenv'
import { getSavedCookie, setCookie } from '../src/cookie/cookie';

dotenv.config()

async function checkCookies() {
  console.log('Checking saved cookies...');
  
  try {
    // Set the cookie from environment
    console.log('Setting cookie from environment...');
    await setCookie(process.env.TEST_COOKIE!);
    
    // Get the saved cookies
    const cookies = getSavedCookie();
    console.log('Saved cookies keys:', Object.keys(cookies));
    
    // Check for important cookie keys
    const importantKeys = ['FP_MBL', 'GRID', 'GR_TOKEN', 'FP_TE'];
    for (const key of importantKeys) {
      if (cookies[key]) {
        console.log(`Found ${key}:`, typeof cookies[key] === 'string' ? cookies[key].substring(0, 50) + '...' : cookies[key]);
      } else {
        console.log(`Missing ${key}`);
      }
    }
    
    // Check if cookies look valid
    const cookieString = process.env.TEST_COOKIE!;
    console.log('Cookie string length:', cookieString.length);
    
    if (cookieString.length < 100) {
      console.log('Warning: Cookie string seems too short to be valid');
    }
    
    // Check if it's a JSON object or a cookie string
    if (cookieString.startsWith('{') && cookieString.endsWith('}')) {
      console.log('Cookie appears to be a JSON object');
      try {
        const cookieObj = JSON.parse(cookieString);
        console.log('Parsed cookie object keys:', Object.keys(cookieObj));
      } catch (e) {
        console.log('Failed to parse as JSON:', e.message);
      }
    } else if (cookieString.includes('=')) {
      console.log('Cookie appears to be a cookie string');
      const pairs = cookieString.split(';');
      console.log('Found', pairs.length, 'cookie pairs');
      for (let i = 0; i < Math.min(pairs.length, 5); i++) {
        console.log('Cookie pair', i, ':', pairs[i].trim().substring(0, 50));
      }
    } else {
      console.log('Cookie format is unclear');
    }
    
  } catch (error) {
    console.error('Error checking cookies:', error.message);
  }
}

checkCookies().catch(console.error);