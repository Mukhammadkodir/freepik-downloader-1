# 🚀 Quick Test Commands

## Validation
```bash
npm run validate          # Check if project is ready for testing
```

## API Server Testing
```bash
npm run api              # Start API server on http://localhost:3000

# In another terminal:
# 1. Set cookies
curl -X POST -H "Content-Type: application/json" \
  -d '{"cookie": "YOUR_FREEPIK_COOKIES_HERE"}' \
  http://localhost:3000/set-cookie

# 2. Download a file
curl "http://localhost:3000/v2/download?url=FREEPIK_URL_HERE" -o download.zip
```

## Direct Testing
```bash
# Edit .env first:
# TEST_COOKIE=your_freepik_cookies
# TEST_DOWNLOAD_URL=https://www.freepik.com/premium-vector/example

npm run test             # Test direct download
npm run test:queue       # Test queue system
```

## Development
```bash
npm run build            # Compile TypeScript
npm run dev:api          # Run API in development mode
```

## Status Check
- ✅ Dependencies installed
- ✅ TypeScript compiled  
- ✅ API server ready
- ✅ Test scripts available
- ⚠️  Need Freepik premium cookies to test downloads

## Required: Freepik Premium Account
Get cookies from browser after logging into Freepik premium account.