const http = require('http');
const net = require('net'); 
const url = require('url');

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
            let modified = false;
            proxyRes.on('data', (chunk) => {
                if (chunk.toString().toUpperCase().includes('HTML')) {
                    modified = true;
                }
                res.write(chunk);
            });

            proxyRes.on('end', () => {
                if (modified) {
                    res.write('NODEJS');
                    console.log('HTML substring found and modified.');
                } else {
                    console.log('HTML substring is missing!');
                }
                res.end();
            });
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            console.log('Proxying HTTP request to:', parsedUrl.hostname);
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

    // Parsing hostname dan port dari request
    const [hostname, port] = req.url.split(':');

    // Menangani request HTTPS
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
