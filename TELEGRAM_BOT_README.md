# Freepik Telegram Bot

A Telegram bot that extracts direct download links from Freepik URLs without triggering browser download popups.

## Features

- Sends direct download links to Telegram users
- No browser download popups
- Works with Freepik premium accounts
- Simple to use - just send a Freepik URL to the bot

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file with your Freepik cookies:
   ```env
   TEST_COOKIE=your_freepik_cookies_here
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

## Running the Bot

Start the Telegram bot:
```bash
npm run telegram-bot
```

For development (with auto-reload):
```bash
npm run dev:telegram-bot
```

## Usage

1. Start a chat with your bot on Telegram
2. Send a Freepik URL (e.g., `https://www.freepik.com/premium-psd/your-design_1234567.htm`)
3. The bot will respond with a direct download link
4. Click the link to download the file directly

## How It Works

1. User sends a Freepik URL to the bot
2. Bot uses Puppeteer to navigate to the Freepik page
3. Bot clicks the download button and intercepts the direct download URL
4. Bot sends the direct download link to the user
5. User can click the link to download directly from Freepik's servers

## Example Interaction

**User**: `https://www.freepik.com/premium-psd/psd-6-september-defiance-day-pakistan_67042227.htm`

**Bot**: 
```
🔍 Processing your Freepik link...

✅ Here's your direct download link:

https://downloadscdn5.freepik.com/d/67042227/824582/1/14/psd-6-september-defiance-day-pakistan.zip?token=exp=1756987628~hmac=8527fe9b3830c08a7c7dab74dffe840b&filename=psd-6-september-defiance-day-pakistan.zip

Click the link to download the file directly!
```

## Commands

- `/start` - Welcome message and instructions
- `/help` - Help information

## Notes

- The bot requires a valid Freepik premium account cookie to access premium content
- Direct download links are time-limited and include authentication tokens
- The first request may take a few seconds while the browser starts up