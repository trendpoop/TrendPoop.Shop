require('dotenv').config();

module.exports = {
    sovrn: {
        apiKey: process.env.SOVRN_API_KEY || '753c07d9e4ac6b208ae7e1bb7569d5d6',
        secretKey: process.env.SOVRN_SECRET_KEY || 'your_secret_key_here',
        market: process.env.SOVRN_MARKET || 'usd_en',
        rateLimit: 20
    },
    scraping: {
        enabled: true,
        timeout: 10000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
};
