const axios = require('axios');
const cheerio = require('cheerio');

class ProductDataService {
    constructor(config) {
        this.apiKey = config.sovrn.apiKey;
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }

    async getProductData(url) {
        console.log('\nProcessing URL:', url);
        
        try {
            // 1. Get the monetized URL
            const monetizedUrl = await this.getMonetizedUrl(url);
            console.log('Generated monetized URL:', monetizedUrl);
            
            // 2. Scrape basic product data
            const productData = await this.scrapeProductData(url);
            console.log('Scraped product data:', productData);

            // 3. Combine the data
            const result = {
                name: productData.name,
                imageUrl: productData.imageUrl,
                monetizedUrl: monetizedUrl,
                originalUrl: url
            };

            // Only return fields that have values
            return Object.fromEntries(
                Object.entries(result).filter(([_, v]) => v != null && v !== '')
            );
        } catch (error) {
            console.error('Error processing URL:', error.message);
            throw error;
        }
    }

    async getMonetizedUrl(url) {
        const apiUrl = `https://api.viglink.com/api/link?key=${this.apiKey}&out=${encodeURIComponent(url)}&format=json`;
        const response = await axios.get(apiUrl);
        return response.data.optimized || url;
    }

    async scrapeProductData(url) {
        const domain = new URL(url).hostname;
        console.log('Scraping domain:', domain);

        const response = await axios({
            method: 'get',
            url: url,
            headers: {
                'User-Agent': this.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.google.com'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        
        // Debug the HTML content
        console.log('\nHTML Debug:');
        console.log('Title tag content:', $('title').text());
        console.log('Meta description:', $('meta[name="description"]').attr('content'));
        
        if (domain.includes('amazon.com')) {
            const data = {
                name: $('#productTitle').text().trim(),
                imageUrl: $('#landingImage').attr('src')
            };
            console.log('Amazon data found:', data);
            return data;
            
        } else if (domain.includes('guitarcenter.com')) {
            // Try multiple selector combinations
            const titleSelectors = [
                'h1.productName',
                '.product-title',
                '.product-detail__title',
                '[data-testid="product-title"]',
                '#product-title',
                '.pdp-title'
            ];

            const imageSelectors = [
                '.product-main-image img',
                '.gc-product-image img',
                '.pdp-image img',
                '[data-testid="product-image"] img',
                '#main-product-image',
                '.product-gallery__image'
            ];

            // Debug all potential title elements
            console.log('\nPotential title elements:');
            titleSelectors.forEach(selector => {
                const el = $(selector);
                console.log(`${selector}:`, el.length ? el.text().trim() : 'not found');
            });

            // Debug all potential image elements
            console.log('\nPotential image elements:');
            imageSelectors.forEach(selector => {
                const el = $(selector);
                console.log(`${selector}:`, el.length ? el.attr('src') : 'not found');
            });

            const data = {
                name: titleSelectors.reduce((acc, selector) => acc || $(selector).text().trim(), ''),
                imageUrl: imageSelectors.reduce((acc, selector) => acc || $(selector).attr('src'), '')
            };
            
            console.log('Guitar Center data found:', data);
            return data;
        }

        // Generic fallback
        return {
            name: $('h1').first().text().trim(),
            imageUrl: $('[itemprop="image"]').attr('src')
        };
    }
}

module.exports = ProductDataService;
