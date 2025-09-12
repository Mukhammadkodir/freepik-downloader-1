# Freepik Premium Downloader
Just an automation script that serves a simple API to download assets from freepik.com. You still need a **premium account** to setup this script.

I made this script because my organization has a premium freepik account. It has limit of 100 downloads per day, but also with a limit of 3 devices. I want to maximize the usage of this premium account. So I made this script. Everyone can use the API to download assets from freepik.com.

Thanks to [INFINITE UNY](https://github.com/InfiniteUny).

## How it works
The downloader uses headless [puppeteer](https://github.com/puppeteer/puppeteer) to open the assets URL given. It will automatically click the download button and save the assets locally. I don't know how to detect completed download, so I just read the directory. If there is a matching file, then it will be sent to the user.

Currently, it only uses 1 browser tab open, so I think it can't be uses to download multiple files at the same time.

## Project Structure


## Before Setup
You need a cookie from a premium freepik account.

## Setup
1. Clone this repository and run ```npm install```
2. Build the project ```npm run build```
3. Run the API ```npm run api```. It will serve an API in ```http://localhost:3000```. You can change it in ```src/api.ts```.
4. Send your cookie. Then restart the API.
```
curl -X POST -H "Content-Type: application/json" \
    -d '{"cookie": "Your cookie here"}' \
    http://localhost:3000/set-cookie
```
5. Start download a premium asset by this URL. ```http://localhost:3000/download?url=FREEPIK_URL```. example ```http://localhost:3000/download?url=https://www.freepik.com/premium-vector/continuous-one-line-drawing-thank-you-text_11439558.htm#query=thankyou&position=6&from_view=search&track=sph```.

## Queue & Webhook
Queue feature now supported. You can send a download request and wait for the download to complete and sent through your webhook url.
```
curl -X POST -H "Content-Type: application/json" \
    -d '{"download_url": "FREEPIK ASSET URL", "webhook_url": "YOUR WEBHOOK URL"}' \
    http://localhost:3000/v2/queue
```

It will returns a unique id to save.
```
{
    "webhook_url": "YOUR WEBHOOK URL",
    "download_url": "FREEPIK ASSET URL",
    "status": "queued",
    "id": "63e75fd1e8e5b664aaa7daf2"
}
```

After the download is completed, you will get notification through your webhook url.
```
{
    "status": "completed", // status can be failed, completed, or token expired
    "id": "63e75fd1e8e5b664aaa7daf2",
    "download_url": "FREEPIK ASSET URL",
    "size": "20391231",
    "filename": "premium-asset.jpg",
    "thumbnail": "THUMBNAIL URL",
    "count": 4, // download limit usage
}
```

Download the completed queue by the url ```/v2/queue/download?id=63e75fd1e8e5b664aaa7daf2```

## Telegram Bot Integration
This project now includes a Telegram bot that allows you to download Freepik assets directly through Telegram without browser popups.

### Setup
1. Create a Telegram bot using BotFather and get your bot token
2. Add your bot token to the `.env` file:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```
3. Run the Telegram bot:
```
npm run telegram-bot
```

### Usage
1. Start a chat with your bot
2. Send any Freepik premium URL to the bot
3. The bot will extract the direct download link and send it to you
4. Click the link to download the file directly

### Supported Asset Types
The Telegram bot works with all Freepik asset types:
- **Design Assets**: PSD, AI, Sketch, Figma, Templates, Mockups, Fonts
- **Images**: Photos, Vectors, Illustrations, Icons
- **Videos**: MP4, AVI, MOV, Video templates, Motion graphics
- **Audio**: MP3, WAV, Sound Effects, Music

The bot automatically detects the asset type and extracts the appropriate download link.

## Integrate with your own system
You can also integrate this downloader with your own script.

Run ```npm install git+https://github.com/nartos9090/freepik-downloader```.

Example
```ts
const {downloadByUrl, setCookie} = require('freepik-premium-downloader')

// set cookie
setCookie('your raw string cookies')

// download an asset
const asset = await downloadByUrl('FREEPIK_ASSET_URL')

// get the filename
const filename = asset.filename

// get the file path
const path = asset.path

// get the file buffer
const file = asset.get()

// delete file
asset.delete()
```

## Note
This downloader is lack off documentation, error handling, bad architecture, etc. Sorry for the inconvenience.