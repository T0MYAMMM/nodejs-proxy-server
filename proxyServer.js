// Importing the HTTP & HTTPS module for HTTP server functionality
const http = require('http'); 
const https = require('https'); 

// Importing the Net module for TCP networking, URL module to parse request URLs, and File System module to read SSL/TLS files
const net = require('net');  
const url = require('url'); 
const fs = require('fs'); 

// SSL/TLS options for the interception server
const options = {
    key: fs.readFileSync('rootCA-key.pem'), 
    cert: fs.readFileSync('rootCA-cert.pem') 
};

// Creating an HTTPS server for intercepting and modifying HTTPS requests
const sslServer = https.createServer(options, (req, res) => {
    // Setting up options to forward the incoming HTTPS request to the actual destination
    const requestOptions = {
        hostname: req.headers['host'],
        port: 443, 
        path: req.url, 
        method: req.method, 
        headers: req.headers, 
    };

    // Making a request to the actual server
    const proxyReq = https.request(requestOptions, (proxyRes) => {
        let chunks = []; 

        // Collecting data chunks from the response
        proxyRes.on('data', (chunk) => {
            chunks.push(chunk);
        });

        // Once all data is received
        proxyRes.on('end', () => {
            let body = Buffer.concat(chunks); // Concatenating all chunks
            let bodyString = body.toString(); // Converting Buffer to string

            // Modifying the response if it contains 'html'
            if (bodyString.toLowerCase().includes('html')) {
                bodyString += 'NODEJS'; // Appending 'NODEJS' to the response
                console.log('HTML substring found and modified');
            } else {
                console.log('HTML substring is missing!');
            }

            // Updating the content-length header
            const updatedHeaders = {
                ...proxyRes.headers, // Copying existing headers
                'content-length' : Buffer.byteLength(bodyString), // Setting new content length
            };

            // Sending the modified response
            res.writeHead(proxyRes.statusCode, updatedHeaders);
            res.end(bodyString);
        });
    });

    // Handling errors in the proxy request
    proxyReq.on('error', (err) => {
        console.error('HTTPS request error:', err.message);
        res.writeHead(500);
        res.end('Proxy encountered an error');
    });

    // Piping the original request data to the proxy request
    req.pipe(proxyReq);
});

// Starting the HTTPS interception server
sslServer.listen(3457, () => {
    console.log('SSL interception server is running on https://localhost:3457');
});

// Creating an HTTP server to handle HTTP requests
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    console.log('Received request for:', req.url);

    // Handling HTTP requests
    if (parsedUrl.protocol === 'http:'){
        const options = {
            hostname: parsedUrl.hostname, 
            port: parsedUrl.port || 80, 
            path: parsedUrl.path, 
            method: req.method, 
            headers: req.headers 
        };

        // Making a proxy request for HTTP
        const proxyReq = http.request(options, (proxyRes) => {
            let chunks = []; 

            // Collecting data chunks from the response
            proxyRes.on('data', (chunk) => {
                chunks.push(chunk);
            });

            // Once all data is received
            proxyRes.on('end', () => {
                let body = Buffer.concat(chunks); // Concatenating all chunks
                let bodyString = body.toString(); // Converting Buffer to string

                // Modifying the response if it contains 'html'
                if (bodyString.toLowerCase().includes('html')) {
                    bodyString += 'NODEJS'; // Appending 'NODEJS' to the response
                    console.log('HTML substring found and modified');
                } else {
                    console.log('HTML substring is missing!');
                }

                // Updating the content-length header
                const updatedHeaders = {
                    ...proxyRes.headers, // Copying existing headers
                    'content-length': Buffer.byteLength(bodyString) // Setting new content length
                };

                // Sending the modified response
                res.writeHead(proxyRes.statusCode, updatedHeaders);
                res.end(bodyString);
            });
        });

        // Handling errors in the proxy request
        proxyReq.on('error', (err) => {
            console.error('HTTP request error:', err.message);
            res.writeHead(500);
            res.end('Proxy encountered an error');
        });

        // Piping the original request data to the proxy request
        req.pipe(proxyReq);
    }
});

// Handling CONNECT method for HTTPS requests
server.on('connect', (req, cltSocket, head) => {
    console.log('Received CONNECT request for:', req.url);

    // Creating a TCP connection to the SSL interception server
    const proxySocket = net.connect(3457, 'localhost', () => {
        // Writing the HTTP 200 Connection Established response to the client
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');

        // Piping data between the client and the SSL interception server
        proxySocket.write(head);
        proxySocket.pipe(cltSocket);
        cltSocket.pipe(proxySocket);
    });

    // Handling errors in the TCP connection
    proxySocket.on('error', (err) => {
        console.error('TCP connection error:', err.message);
    });

    // Handling closure of the TCP connection
    proxySocket.on('close', () => {
        console.log('TCP connection closed');
    });

    // Handling errors in the client socket
    cltSocket.on('error', (err) => {
        console.error('Client socket error:', err.message);
    });
});

// Starting the HTTP server
server.listen(3456, () => {
    console.log('Proxy server is running on http://localhost:3456');
});
