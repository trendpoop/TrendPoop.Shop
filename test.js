const ProductDataService = require('./lib/product-data-service');
const config = require('./config/product-data');

async function testProductData() {
    const productService = new ProductDataService(config);
    
    // Test URLs
    const testUrls = [
        'https://www.amazon.com/dp/B0C8PSMPTH',
        'https://www.guitarcenter.com/Pioneer/DJM-V10-1500000319439.gc'
    ];
    
    console.log('Starting product data test...\n');
    
    for (const url of testUrls) {
        console.log(`Testing URL: ${url}`);
        console.log('-'.repeat(50));
        
        try {
            const productData = await productService.getProductData(url);
            console.log('Product Data:');
            console.log(JSON.stringify(productData, null, 2));
        } catch (error) {
            console.error('Error:', error.message);
        }
        
        console.log('-'.repeat(50), '\n');
    }
}

// Run the test
testProductData().catch(console.error);
