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

  // In-memory cache and request deduplication for read-heavy Google Apps Script endpoints
  interface CacheEntry {
    data: any;
    status: number;
    timestamp: number;
  }
  const proxyCache = new Map<string, CacheEntry>();
  const inFlightRequests = new Map<string, Promise<{ success: boolean; data: any; status: number }>>();

  const READ_ACTIONS = new Set([
    'getAircraftData',
    'getAircraftSpecificData',
    'get_init_data',
    'get_attendance',
    'onGetAdminPanelData',
    'getEnvanterLogs',
    'fetchHistory',
    'get_data'
  ]);

  // Proxy endpoint for Google Apps Script
  app.post('/api/proxy', async (req, res) => {
    const { url, body, method = 'POST' } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const action = body && typeof body === 'object' ? body.action : undefined;
    const isReadAction = action && READ_ACTIONS.has(action);
    const serializedBody = typeof body === 'string' ? body : JSON.stringify(body || {});
    const cacheKey = `${method.toUpperCase()}:${url}:${serializedBody}`;

    // 1. Invalidate cache on mutations
    if (action && !isReadAction) {
      // Clear relevant cached entries on writes/updates
      for (const key of proxyCache.keys()) {
        if (key.includes(url)) {
          proxyCache.delete(key);
        }
      }
    }

    // 2. Check read cache
    if (isReadAction) {
      const cached = proxyCache.get(cacheKey);
      const ttl = action === 'get_attendance' ? 60000 : 25000; // 60s for attendance, 25s for other reads
      if (cached && (Date.now() - cached.timestamp < ttl)) {
        return res.status(200).json({
          success: true,
          data: cached.data,
          status: cached.status,
          cached: true
        });
      }
    }

    // 3. Deduplicate in-flight requests
    if (isReadAction && inFlightRequests.has(cacheKey)) {
      try {
        const result = await inFlightRequests.get(cacheKey)!;
        return res.status(200).json(result);
      } catch (err) {
        // If in-flight fails, continue to execute fresh attempt
      }
    }

    const executeFetch = async (): Promise<{ success: boolean; data: any; status: number }> => {
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
        fetchOptions.body = serializedBody;
      }

      let response: Response | undefined;
      let lastError: any;
      let parsedData: any = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetch(targetUrl, fetchOptions);
          
          if (response.ok) {
            const rawText = await response.text();
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
        const status = response ? response.status : 200;
        if (isReadAction) {
          proxyCache.set(cacheKey, { data: parsedData, status, timestamp: Date.now() });
        }
        return {
          success: true,
          data: parsedData,
          status
        };
      }

      if (response) {
        const rawText = await response.text().catch(() => '');
        let fallbackData: any = rawText;
        try { fallbackData = JSON.parse(rawText); } catch (e) {}

        const status = response.status;
        if (response.ok && isReadAction) {
          proxyCache.set(cacheKey, { data: fallbackData, status, timestamp: Date.now() });
        }
        return {
          success: response.ok,
          data: fallbackData,
          status
        };
      }

      throw lastError || new Error('Network request failed after 3 attempts');
    };

    try {
      if (isReadAction) {
        const reqPromise = executeFetch();
        inFlightRequests.set(cacheKey, reqPromise);
        try {
          const result = await reqPromise;
          return res.status(200).json(result);
        } finally {
          inFlightRequests.delete(cacheKey);
        }
      } else {
        const result = await executeFetch();
        return res.status(200).json(result);
      }
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
