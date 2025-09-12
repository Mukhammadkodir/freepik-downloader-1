import express from 'express';
import { getDownloadLink, close } from '../downloader/link-extractor';
import { getSavedCookie } from '../cookie/cookie';

const app = express();
app.use(express.json());

// Endpoint to extract download link
app.post('/extract-link', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Extract the direct download link
    const downloadLink = await getDownloadLink(url);
    
    res.json({ 
      success: true,
      downloadLink: downloadLink
    });
  } catch (error) {
    console.error('Link extraction error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to extract download link'
    });
  }
});

// Endpoint to check if cookies are set
app.get('/health', (req, res) => {
  try {
    const cookies = getSavedCookie();
    const hasCookies = Object.keys(cookies).length > 0;
    
    res.json({ 
      success: true,
      hasCookies: hasCookies,
      cookieCount: Object.keys(cookies).length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to check cookies'
    });
  }
});

const port = process.env.API_PORT || 3000;

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await close();
  process.exit(0);
});

export { app };

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Freepik Link Extractor API listening on port ${port}`);
  });
}