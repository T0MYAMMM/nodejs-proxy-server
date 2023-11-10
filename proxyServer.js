const http = require('http');
const https = require('https');
const { URL } = require('url');

const server = http.createServer((req, res) => {
  const url = new URL(req.url);

  // Tentukan apakah ini HTTP atau HTTPS
  const client = url.protocol === 'https:' ? https : http;

  const proxyReq = client.request(url.href, (proxyRes) => {
    let body = '';

    proxyRes.on('data', (chunk) => {
      body += chunk;
    });

    proxyRes.on('end', () => {
      // Mengecek adanya 'HTML' dalam body
      if (body.toLowerCase().includes('html')) {
        body += 'NODEJS';
      }

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(body);
    });
  });

  proxyReq.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    res.writeHead(500);
    res.end();
  });

  req.pipe(proxyReq);
});

server.listen(3456, () => {
  console.log('Proxy server is running on http://localhost:3456');
});
