# NodeJS Forward Proxy Server

This repository contains a NodeJS-based forward proxy server that handles both HTTP and HTTPS requests. It is capable of modifying responses by appending 'NODEJS' to any payload containing 'HTML' (case-insensitive). 

## Installation

To set up the proxy server, follow these steps:

1. Clone the repository to your local machine.
2. Ensure Node.js (v14 or later) is installed on your system.
3. Navigate to the cloned directory.

## Running the Proxy Server

To run the server, execute the following command in the root directory of the project:


``` 
node proxyServer.js
```

This will start the proxy server on http://localhost:3456 and the SSL interception server on https://localhost:3457.

## Testing the Proxy
To test the HTTP and HTTPS forwarding capabilities of the proxy, use the curl command as follows:

For HTTP:

```
curl -x http://localhost:3456 http://example.com
```

example response on www.example.com : 


![image](https://github.com/T0MYAMMM/nodejs-proxy-server/assets/96872292/0210ec86-e46d-49ed-a85e-da6983dbf401)






for HTTPS :

```
curl -x http://localhost:3456 https://example.com
```

[Note] If you have an issue while verify the SSL certificate like the picture below, add '-k' or '--insecure' before the url target to continue operation, it is used to bypass SSL certificate validation.


![image](https://github.com/T0MYAMMM/nodejs-proxy-server/assets/96872292/8d795f0e-19c8-41a4-8751-20bb5bb1d804)




## SSL Keys and Certificates for HTTPS Interception
To handle HTTPS interception in point 4, you need an SSL key (rootCA-key.pem) and certificate (rootCA-cert.pem). Here are some alternatives to obtain or create them:

1. Local Certificate Creation: You can create your SSL key and certificate locally using OpenSSL. This is suitable for local testing and development.

2. Free Certificate Services: There are services offering free SSL certificates, like Let's Encrypt. However, these are typically used for websites hosted on public servers.

3. Purchasing Paid Certificates: If necessary, you can buy SSL certificates from trusted certificate service providers.

4. Self-Signed Certificate: You can use a self-signed certificate for testing purposes. However, this will trigger security warnings in browsers or applications accessing it.

[Note] Remember that for local testing using curl, you may need to add the -k or --insecure option to bypass SSL certificate validation.

## Steps to Create a Local SSL Certificate Using OpenSSL
1. Install [OpenSSL](https://www.openssl.org/)

2. Generate Private Key: Run the command below to create a private key
```
openssl genrsa -out rootCA-key.pem 2048
```

3. Generate Root Certificate: Use this private key to create a root certificate with the command
```
openssl req -x509 -new -nodes -key rootCA-key.pem -sha256 -days 1024 -out rootCA-cert.pem.
```

4. Install Root Certificate: Install the root certificate on your system or browser to avoid security warnings.

5. Use on HTTPS Interception Server: Ensure that the rootCA-key.pem and rootCA-cert.pem files are in the same directory as your server script and run the HTTPS interception server.

Note: These steps are only for local testing and development purposes. For production or public use, it's recommended to use certificates from a trusted Certificate Authority.

## Note on HTTPS Interception
- The HTTPS interception involves creating a local SSL interception server.
- The -k option in curl is used to bypass SSL certificate validation for **testing purposes**.
- Ensure that you have the rootCA-key.pem and rootCA-cert.pem files in the root directory for SSL interception to work correctly.

## Implementation Details
- The proxy server listens on port 3456 for incoming HTTP and HTTPS requests.
- For HTTP requests, it forwards the request and modifies the response if it contains 'HTML'.
- For HTTPS requests, it uses a separate SSL interception server running on port 3457.
- The response modification logic appends 'NODEJS' to any response containing 'HTML'.

## Constraints and Assumptions
- This implementation assumes the availability of valid SSL certificate files for HTTPS interception.
- The -k flag in curl is necessary for testing HTTPS due to self-signed certificates used in local testing.

## Repository Structure
- proxyServer.js: The main server script.
- proxyServer_base.js: The main server for only Task 3. 
- rootCA-key.pem: The private key for SSL/TLS (not included in the repository for security reasons).
- rootCA-cert.pem: The public certificate for SSL/TLS (not included in the repository for security reasons).

## Security Note
- Do not push your private keys (rootCA-key.pem) or certificates (rootCA-cert.pem) to public repositories for security reasons.
- Ensure to include these files in .gitignore to prevent accidental uploads.
