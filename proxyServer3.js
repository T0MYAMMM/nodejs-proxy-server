const http = require('http');
//const url = require('url');
const net = require('net'); 

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  console.log('Received request for:', req.url);

  // Forward HTTP requests
  if (parsedUrl.protocol === 'http:') {
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.path, 
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      console.log('Proxying HTTP request to:', parsedUrl.hostname);
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('HTTP request error:', err.message);
      res.writeHead(500);
      res.end('Proxy encountered an error');
    });

    req.pipe(proxyReq);

  // Forward HTTPS requests    
  } else if (parsedUrl.protocol === 'https:') {
    console.log('Received HTTPS request for:', parsedUrl.hostname);

    // Create TCP connection
    const proxySocket = net.connect(443, parsedUrl.hostname, () => {
      console.log('TCP connection established with', parsedUrl.hostname);
      proxySocket.write([
        'CONNECT ' + parsedUrl.hostname + ':' + 443 + ' HTTP/1.1',
        'Host: ' + parsedUrl.hostname,
        '\r\n\r\n'
      ].join('\r\n'));
      
      proxySocket.pipe(res);
      res.pipe(proxySocket); 
    });

    proxySocket.on('error', (err) => {
      console.error('TCP connection error:', err.message);
      res.writeHead(500);
      res.end('Proxy encountered an error');
    });

    proxySocket.on('close', () => {
      console.log('TCP connection closed');
    });

  } else {
    console.log('Unsupported protocol for:', req.url);
    res.writeHead(400);
    res.end('Unsupported protocol');
  }
});

server.listen(3456, () => {
    console.log('Proxy server is running on http://localhost:3456');
});
