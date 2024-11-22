const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Initialize Express app
const app = express();

// Enable CORS for all routes (if you need to handle CORS at the proxy level)
app.use(cors());

// Create a proxy middleware to forward requests to the target server
app.use('/proxy', createProxyMiddleware({
    target: 'https://google.com',  // External API you want to access
    changeOrigin: true,                 // Needed for virtual hosted sites
    pathRewrite: {
        '^/proxy': '',  // Strip the `/proxy` path from the URL
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${req.url}`);
    },
}));

// Start the server
const PORT = 3001;  // Choose any available port
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
