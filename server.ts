import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Proxy endpoint for Google Apps Script
  app.post('/api/proxy', async (req, res) => {
    const { url, body } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        redirect: 'follow', // Important for Apps Script
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
        try {
          data = JSON.parse(data);
        } catch (e) {
          // Keep as text if not JSON
        }
      }

      res.status(response.status).json({
        success: response.ok,
        data: data,
        status: response.status
      });
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal Server Error',
        details: String(error)
      });
    }
  });

  // Redirect root path to the subpath base to ensure correct asset resolution
  app.get('/', (req, res) => {
    res.redirect('/ogmhavay-netim/');
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
