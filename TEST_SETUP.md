# Freepik Downloader - Test Setup Guide

## Project Status ✅
The freepik-downloader project has been successfully prepared for testing. All dependencies are installed and the TypeScript code has been compiled to JavaScript.

## Project Structure
```
freepik-downloader/
├── src/                    # TypeScript source code
├── dist/                   # Compiled JavaScript (ready for execution)
├── download/               # Directory for downloaded files
├── storage/                # Directory for storing cookies and data
├── test/                   # Test files
├── .env                    # Environment configuration
└── package.json            # Project dependencies and scripts
```

## Prerequisites for Testing

### 1. **Freepik Premium Account Required**
- You MUST have a valid Freepik premium account
- The tool uses cookies from your premium session
- Without premium account, downloads will fail

### 2. **Get Your Freepik Cookies**
To obtain cookies from your browser:
1. Log into your Freepik premium account in browser
2. Open Developer Tools (F12)
3. Go to Application/Storage tab → Cookies → https://www.freepik.com
4. Copy all cookie values into a single string format: `name1=value1; name2=value2; ...`

## Configuration

### Environment Variables
The `.env` file has been created with default settings:
```env
API_PORT=3000
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox
PUPPETEER_HEADLESS=true
PUPPETEER_EXECUTABLE_PATH=

# Add your test data here:
TEST_COOKIE=your_freepik_cookies_here
TEST_DOWNLOAD_URL=https://www.freepik.com/premium-vector/example-url
```

## Available Test Methods

### 1. **API Server Testing**
Start the API server:
```bash
npm run api
```
Server will start on http://localhost:3000

#### API Endpoints:
- **POST** `/set-cookie` - Set your Freepik cookies
- **GET** `/v2/download?url=FREEPIK_URL` - Direct download
- **POST** `/v2/queue` - Queue download with webhook
- **GET** `/v2/queue/download?id=QUEUE_ID` - Download completed file

#### Example API Usage:
```bash
# 1. Set cookie
curl -X POST -H "Content-Type: application/json" \
  -d '{"cookie": "your_cookie_string_here"}' \
  http://localhost:3000/set-cookie

# 2. Download file
curl "http://localhost:3000/v2/download?url=https://www.freepik.com/premium-vector/example"
```

### 2. **Direct Library Testing**
Edit the test file to add your credentials:
```bash
# Edit .env file with your credentials
TEST_COOKIE=your_freepik_cookies
TEST_DOWNLOAD_URL=https://www.freepik.com/premium-vector/example-url

# Run the test
npm run test
```

### 3. **Queue System Testing**
```bash
npm run test:queue
```

## Important Notes

### Security Considerations ⚠️
- **Cookie Security**: Your Freepik cookies contain authentication tokens
- **No Sandbox**: Puppeteer runs with `--no-sandbox` for compatibility
- **Public API**: The API has no authentication - use in trusted environments only

### Troubleshooting

#### Common Issues:
1. **"Token expired" error**: Cookies are invalid or expired
   - Solution: Get fresh cookies from browser
   
2. **"Download limit reached"**: Daily download limit exceeded
   - Solution: Wait for limit reset or check subscription status

3. **"Download counter not found"**: Freepik UI changed or cookies invalid
   - Solution: Verify cookies and check Freepik website manually

4. **Puppeteer launch fails**: Missing Chrome/Chromium
   - Solution: Install Chrome or set `PUPPETEER_EXECUTABLE_PATH`

#### Debug Mode:
To run with visible browser (non-headless):
```bash
PUPPETEER_HEADLESS=false npm run api
```

## File Locations
- **Downloads**: Files saved to `./download/` directory
- **Cookies**: Stored in `./storage/cookie.json`  
- **Queue Database**: `./queue.db` (SQLite)
- **Logs**: Console output (consider redirecting to file)

## Next Steps for Testing

1. **Get Freepik premium cookies** from your browser
2. **Update .env file** with your test credentials
3. **Choose testing method**:
   - For API testing: `npm run api` then use curl/Postman
   - For direct testing: `npm run test`
4. **Monitor downloads** in `./download/` directory
5. **Check logs** for any errors or issues

The project is now ready for comprehensive testing with your Freepik premium account credentials.