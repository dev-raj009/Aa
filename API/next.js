const fetch = require('node-fetch');

// Base URL of the original site
const BASE_URL = 'https://nt.rarestudy.site';

// Helper function to make requests to original API
async function proxyRequest(endpoint, req, res) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        
        // Forward the request with original headers
        const response = await fetch(url, {
            method: req.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://nt.rarestudy.site/',
                'Origin': 'https://nt.rarestudy.site'
            }
        });

        const data = await response.json();
        
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`Proxy error for ${endpoint}:`, error);
        res.status(500).json({
            success: false,
            message: 'Proxy error: ' + error.message
        });
    }
}

// Main handler function for Vercel
module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    const url = req.url;
    
    // Route handling
    if (url === '/' || url === '/api') {
        return res.status(200).json({
            success: true,
            message: 'Proxy API is running',
            endpoints: {
                batches: '/api/batches',
                course: '/api/course/:token',
                content: '/api/content/:token',
                media: '/api/media/:token'
            }
        });
    }
    
    // Batches endpoint
    if (url === '/api/batches') {
        return await proxyRequest('/api/batches', req, res);
    }
    
    // Course endpoint
    if (url.startsWith('/api/course/')) {
        const token = url.split('/api/course/')[1];
        return await proxyRequest(`/api/course/${token}`, req, res);
    }
    
    // Content endpoint
    if (url.startsWith('/api/content/')) {
        const token = url.split('/api/content/')[1];
        return await proxyRequest(`/api/content/${token}`, req, res);
    }
    
    // Media endpoint
    if (url.startsWith('/api/media/')) {
        const token = url.split('/api/media/')[1];
        return await proxyRequest(`/api/media/${token}`, req, res);
    }
    
    // 404 for unknown routes
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
};
