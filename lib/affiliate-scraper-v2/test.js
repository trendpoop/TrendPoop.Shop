const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const axios = require('axios');

async function testSovrnLink() {
    const targetUrl = 'https://www.guitarcenter.com/Pioneer/DJM-V10-1500000319439.gc';
    const API_KEY = '753c07d9e4ac6b208ae7e1bb7569d5d6';
    
    // Use the VigLink endpoint with JSON response
    const apiUrl = `https://api.viglink.com/api/link?` +
        `key=${API_KEY}` +
        `&out=${encodeURIComponent(targetUrl)}` +
        `&loc=${encodeURIComponent('http://localhost:3000')}` +
        `&format=json`;
    
    console.log('Testing VigLink API with Guitar Center URL:');
    console.log('Target URL:', targetUrl);
    console.log('API URL:', apiUrl);
    
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        
        if (response.data) {
            console.log('\nResponse Data:', JSON.stringify(response.data, null, 2));
            
            if (response.data.optimized) {
                console.log('\nOptimized URL:', response.data.optimized);
                
                // Follow the redirect
                try {
                    const redirectResponse = await axios.get(response.data.optimized, {
                        maxRedirects: 0,
                        validateStatus: status => status >= 200 && status < 400,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    
                    console.log('\nRedirect Response:');
                    console.log('Status:', redirectResponse.status);
                    if (redirectResponse.headers.location) {
                        console.log('Final URL:', redirectResponse.headers.location);
                        
                        try {
                            const finalUrl = new URL(redirectResponse.headers.location);
                            console.log('\nAffiliate Parameters:', 
                                Object.fromEntries(finalUrl.searchParams.entries()));
                        } catch (e) {
                            console.log('Could not parse final URL');
                        }
                    }
                } catch (redirectError) {
                    if (redirectError.response && redirectError.response.headers.location) {
                        const finalUrl = redirectError.response.headers.location;
                        console.log('\nFinal Redirect URL:', finalUrl);
                        
                        try {
                            const parsedUrl = new URL(finalUrl);
                            console.log('\nAffiliate Parameters:', 
                                Object.fromEntries(parsedUrl.searchParams.entries()));
                        } catch (e) {
                            console.log('Could not parse final URL');
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('\nError occurred:');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            if (error.response.data) {
                console.error('Data:', error.response.data);
            }
        }
    }
}

testSovrnLink();
