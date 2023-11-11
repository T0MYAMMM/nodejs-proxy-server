# NodeJS Forward Proxy Server

This repository contains a NodeJS-based forward proxy server that handles both HTTP and HTTPS requests. It is capable of modifying responses by appending 'NODEJS' to any payload containing 'HTML' (case-insensitive). 

## Installation

To set up the proxy server, follow these steps:

1. Clone the repository to your local machine.
2. Ensure Node.js (v14 or later) is installed on your system.
3. Navigate to the cloned directory.

## Running the Proxy Server

To run the server, execute the following command in the root directory of the project:

'''bash
node proxyServer.js

This will start the proxy server on http://localhost:3456 and the SSL interception server on https://localhost:3457.

Testing the Proxy
To test the HTTP and HTTPS forwarding capabilities of the proxy, use the curl command as follows:

For HTTP:

curl -x http://localhost:3456 http://example.com

for HTTPS(note : '-k' is used to bypass SSL certificate validation):

curl -x http://localhost:3456 -k https://example.com

Note on HTTPS Interception
- The HTTPS interception involves creating a local SSL interception server.
- The -k option in curl is used to bypass SSL certificate validation for testing purposes.
- Ensure that you have the rootCA-key.pem and rootCA-cert.pem files in the root directory for SSL interception to work correctly.

Implementation Details
- The proxy server listens on port 3456 for incoming HTTP and HTTPS requests.
- For HTTP requests, it forwards the request and modifies the response if it contains 'HTML'.
- For HTTPS requests, it uses a separate SSL interception server running on port 3457.
- The response modification logic appends 'NODEJS' to any response containing 'HTML'.

Constraints and Assumptions
- This implementation assumes the availability of valid SSL certificate files for HTTPS interception.
- The -k flag in curl is necessary for testing HTTPS due to self-signed certificates used in local testing.

Repository Structure
- proxyServer.js: The main server script.
- rootCA-key.pem: The private key for SSL/TLS (not included in the repository for security reasons).
- rootCA-cert.pem: The public certificate for SSL/TLS (not included in the repository for security reasons).

Security Note
Do not push your private keys (rootCA-key.pem) or certificates (rootCA-cert.pem) to public repositories for security reasons.
Ensure to include these files in .gitignore to prevent accidental uploads.