import { createServer } from 'node:https';
import { parse } from 'node:url';
import next from 'next';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3003;

// Get SSL certificate paths
const HOME = process.env.HOME;
const certFile = path.join(HOME, '.ssl', 'certificate.crt');
const keyFile = path.join(HOME, '.ssl', 'certificate.key');

// Read SSL certificates
const httpsOptions = {
  key: fs.readFileSync(keyFile),
  cert: fs.readFileSync(certFile),
  rejectUnauthorized: false
};

// Create a reusable HTTPS agent for self-signed certificates
const httpsAgent = new https.Agent({
  ...httpsOptions,
  keepAlive: true,
  timeout: 10000
});

// Configure proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'https://localapi.helix.ai:8081',
  changeOrigin: true,
  secure: false,
  agent: httpsAgent,
  pathRewrite: {
    '^/api': '/api',
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('host', 'localapi.helix.ai:8081');
  },
});

// Patch global agent
https.globalAgent = httpsAgent;

// Prepare next.js
const app = next({ 
  dev,
  hostname,
  port,
  httpOptions: httpsOptions
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      // Handle API requests with proxy
      if (req.url?.startsWith('/api/')) {
        apiProxy(req, res);
        return;
      }

      // Parse the URL for non-API requests
      const parsedUrl = parse(req.url || '/', true);
      
      // Let next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
    });
}); 