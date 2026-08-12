import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { setGlobalDispatcher, Agent } from 'undici';

setGlobalDispatcher(new Agent({
  headersTimeout: 120000,
  bodyTimeout: 120000,
  connectTimeout: 30000
}));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Proxy endpoint for Google Apps Script
  app.post('/api/proxy', async (req, res) => {
    const { url, body, method = 'POST' } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    try {
      let targetUrl = url;
      let fetchOptions: RequestInit = {
        redirect: 'follow',
      };

      if (method.toUpperCase() === 'GET') {
        fetchOptions.method = 'GET';
        if (body && typeof body === 'object') {
          const params = new URLSearchParams();
          Object.keys(body).forEach(k => {
            if (body[k] !== undefined && body[k] !== null) {
              params.append(k, String(body[k]));
            }
          });
          targetUrl = url.includes('?') ? `${url}&${params.toString()}` : `${url}?${params.toString()}`;
        }
      } else {
        fetchOptions.method = 'POST';
        fetchOptions.headers = {
          'Content-Type': 'text/plain;charset=utf-8',
        };
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      let response: Response | undefined;
      let lastError: any;
      let parsedData: any = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetch(targetUrl, fetchOptions);
          
          if (response.ok) {
            const rawText = await response.text();
            // Google Apps Script can return HTML on rate limits or internal script errors
            const isHtml = rawText.includes('<!DOCTYPE html>') || rawText.includes('<html') || rawText.includes('Google Docs');
            if (!isHtml) {
              try {
                parsedData = JSON.parse(rawText);
              } catch (e) {
                parsedData = rawText;
              }
              break; // Success!
            }
          } else {
            // Stop retrying immediately on 404 or other 4xx client errors (except 429 Rate Limit)
            if (response.status !== 429 && response.status >= 400 && response.status < 500) {
              break;
            }
          }
        } catch (err) {
          lastError = err;
        }

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }

      if (parsedData !== null) {
        return res.status(200).json({
          success: true,
          data: parsedData,
          status: response ? response.status : 200
        });
      }

      if (response) {
        const rawText = await response.text().catch(() => '');
        let fallbackData: any = rawText;
        try { fallbackData = JSON.parse(rawText); } catch (e) {}

        return res.status(200).json({
          success: response.ok,
          data: fallbackData,
          status: response.status
        });
      }

      throw lastError || new Error('Network request failed after 3 attempts');
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(200).json({ 
        success: false, 
        data: null,
        error: error instanceof Error ? error.message : 'Internal Server Error',
        details: String(error)
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files both at the root and at the subdirectory path
    app.use('/ogmhavay-netim', express.static(distPath));
    app.use(express.static(distPath));
    app.get(['/ogmhavay-netim/*all', '*all'], (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
