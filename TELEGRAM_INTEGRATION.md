# Telegram Bot Integration Guide

This guide explains how to integrate the Freepik link extractor into your Telegram bot to send direct download links to users without triggering browser download popups.

## How It Works

1. User sends a Freepik URL to your Telegram bot
2. Your bot uses the link extractor to get the direct download URL
3. Your bot sends the direct download link to the user
4. User can click the link to download directly from Freepik's servers

## Key Benefits

- **No download popups**: Users receive a direct link instead of triggering a browser download
- **Fast response**: No need to download the file on your server
- **Works with premium accounts**: Uses your Freepik premium cookies
- **Simple integration**: Easy to add to existing Telegram bots

## Integration Examples

### TypeScript Example

```typescript
import { extractFreepikDownloadLink, cleanup } from './freepik-downloader/dist/telegram-bot-helper';

async function handleFreepikRequest(userId: string, freepikUrl: string) {
  try {
    // Extract the direct download link
    const downloadLink = await extractFreepikDownloadLink(freepikUrl);
    
    // Send the link to the user (no popup!)
    await bot.sendMessage(userId, `Here's your download link: ${downloadLink}`);
  } catch (error) {
    await bot.sendMessage(userId, 'Sorry, I could not extract the download link.');
  }
}
```

### JavaScript Example

```javascript
const { extractFreepikDownloadLink } = require('./freepik-downloader/dist/telegram-bot-helper');

async function handleFreepikRequest(userId, freepikUrl) {
  try {
    // Extract the direct download link
    const downloadLink = await extractFreepikDownloadLink(freepikUrl);
    
    // Send the link to the user (no popup!)
    await bot.sendMessage(userId, `Here's your download link: ${downloadLink}`);
  } catch (error) {
    await bot.sendMessage(userId, 'Sorry, I could not extract the download link.');
  }
}
```

## Setup Instructions

1. Install the package:
   ```bash
   npm install
   npm run build
   ```

2. Set your Freepik cookies:
   ```bash
   # In your .env file
   TEST_COOKIE="your_freepik_cookies_here"
   ```

3. Import and use the helper functions in your bot:
   ```javascript
   const { extractFreepikDownloadLink } from './freepik-downloader/dist/telegram-bot-helper';
   ```

## Important Notes

- The direct download links are time-limited and include authentication tokens
- Make sure to set your Freepik premium cookies for access to premium content
- Call `cleanup()` when shutting down your bot to close the browser instance
- The first request may take a few seconds while the browser starts up

## Example Direct Download Link

```
https://downloadscdn5.freepik.com/d/67042227/824582/1/14/psd-6-september-defiance-day-pakistan.zip?token=exp=1756987628~hmac=8527fe9b3830c08a7c7dab74dffe840b&filename=psd-6-september-defiance-day-pakistan.zip
```

This link can be sent directly to Telegram users who can click it to download the file without any popups!