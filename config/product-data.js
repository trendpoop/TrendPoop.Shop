require('dotenv').config();

module.exports = {
    sovrn: {
        apiKey: process.env.SOVRN_API_KEY || '753c07d9e4ac6b208ae7e1bb7569d5d6',
        secretKey: process.env.SOVRN_SECRET_KEY || '73a073de1f5e017ef622d209b9bbbd77fe476cf3',
        market: process.env.SOVRN_MARKET || 'usd_en',
        rateLimit: 20
    },
    scraping: {
        enabled: true,
        timeout: 10000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
};
