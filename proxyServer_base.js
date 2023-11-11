const http = require('http');
const net = require('net'); 
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    console.log('Received request for:', req.url);
    if (parsedUrl.protocol === 'http:') {
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 80,
            path: parsedUrl.path, 
            method: req.method,
            headers: req.headers
        };
        const proxyReq = http.request(options, (proxyRes) => {
            let chunks = [];
            proxyRes.on('data', (chunk) => {
                chunks.push(chunk);
            });
            proxyRes.on('end', () => {
                let body = Buffer.concat(chunks);
                let bodyString = body.toString();
                if (bodyString.toLowerCase().includes('html')) {
                    bodyString += 'NODEJS';
                    console.log('HTML substring found and modified.');
                } else {
                    console.log('HTML substring is missing!');
                }
                const updatedHeaders = {
                    ...proxyRes.headers,
                    'content-length': Buffer.byteLength(bodyString)
                };        
                res.writeHead(proxyRes.statusCode, updatedHeaders);
                res.end(bodyString);
            });
        });
        proxyReq.on('error', (err) => {
            console.error('HTTP request error:', err.message);
            res.writeHead(500);
            res.end('Proxy encountered an error');
        });
        req.pipe(proxyReq);
    }
});

server.on('connect', (req, cltSocket, head) => {
    console.log('Received CONNECT request for:', req.url);
    const [hostname, port] = req.url.split(':');
    const proxySocket = net.connect(port || 443, hostname, () => {
        console.log('TCP connection established with', hostname);
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');        
        proxySocket.write(head);
        proxySocket.pipe(cltSocket);
        cltSocket.pipe(proxySocket);
    });
    proxySocket.on('error', (err) => {
        console.error('TCP connection error:', err.message);
    });
    proxySocket.on('close', () => {
        console.log('TCP connection closed');
    });
    cltSocket.on('error', (err) => {
        console.error('Client socket error:', err.message);
    });
});

server.listen(3456, () => {
    console.log('Proxy server is running on http://localhost:3456');
});
