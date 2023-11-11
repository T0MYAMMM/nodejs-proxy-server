const http = require('http');
const https = require('https');
const net = require('net'); 
const url = require('url');
const fs = require('fs');
//const { createCertificate } = require('pem'); // Menggunakan pem untuk pembuatan sertifikat dinamis

// SSL/TLS options untuk server intersepsi
const options = {
    key: fs.readFileSync('rootCA-key.pem'), // Private Key SSL/TLS
    cert: fs.readFileSync('rootCA-cert.pem') // Public Certificate SSL/TLS
};

// Membuat server HTTPS untuk intersepsi
const sslServer = https.createServer(options, (req, res) => {
    // Logika untuk memodifikasi isi bisa ditempatkan di sini
    const requestOptions = {
        hostname: req.headers['host'],
        port: 443,
        path: req.url,
        method: req.method,
        headers: req.headers,
    };

    // Membuat request ke server 
    const proxyReq = https.request(requestOptions, (proxyRes) => {
        let chunks = [];

        proxyRes.on('data', (chunk) => {
            chunks.push(chunk);
        });

        proxyRes.on('end', () => {
            let body = Buffer.concat(chunks);
            let bodyString = body.toString();

            if (bodyString.toLowerCase().includes('html')) {
                bodyString += 'NODEJS'
                console.log('HTML substring found and modified');
            } else {
                console.log('HTML substring is missing!');
            }

            // Update the content-length
            const updatedHeaders = {
                ...proxyRes.headers,
                'content-length' : Buffer.byteLength(bodyString),
            };

            res.writeHead(proxyRes.statusCode, updatedHeaders);
            res.end(bodyString);
        });
    });
    proxyReq.on('error', (err) => {
        console.error('HTTPS request error:', err.message);
        res.writeHead(500);
        res.end('Proxy encountered an error');
    });
    req.pipe(proxyReq);
});

sslServer.listen(3457, () => {
    console.log('SSL interception server is running on https://localhost:3457');
});

const server = http.createServer((req, res) => {
    // HTTP
    const parsedUrl = url.parse(req.url);
    
    console.log('Received request for:', req.url);

    // Forward HTTP requests
    if (parsedUrl.protocol === 'http:'){
        const options = {
            hostname : parsedUrl.hostname,
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
                    console.log('HTML substring found and modified');
                } else {
                    console.log('HTML substring is missing!');
                }

                // Update the content-length
                const updateHeaders = {
                    ...proxyRes.headers,
                    'content-length' : Buffer.byteLength(bodyString)
                };
                res.writeHead(proxyRes.statusCode, updateHeaders);
                res.end(bodyString)
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
    console.log('Received CONNECT request for:', req.url)
  
    // Logika untuk HTTPS

    const proxySocket = net.connect(3457, 'localhost', () => {
        // Meneruskan ke server intersepsi SSL/TLS
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
