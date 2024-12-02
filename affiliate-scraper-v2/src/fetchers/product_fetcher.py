from typing import Dict, Optional, Any
from ..utils.api_client import APIClient
from .scraper_fallback import ScraperFallback

class ProductFetcher:
    """Fetches product information from various sources with fallback options."""
    
    def __init__(self, api_client: Optional[APIClient] = None):
        """
        Initialize the product fetcher.
        
        Args:
            api_client: Optional API client for making requests
        """
        self.api_client = api_client or APIClient()
        self.fallback = ScraperFallback()
        
    async def fetch_product(self, url: str) -> Dict[str, Any]:
        """
        Fetch product information from a given URL.
        
        Args:
            url: The product URL to fetch information from
            
        Returns:
            Dict containing product information
            
        Raises:
            ValueError: If URL is invalid
            ConnectionError: If unable to fetch product data
        """
        try:
            # First try API-based fetching
            product_data = await self.api_client.fetch_product(url)
            if product_data:
                return product_data
                
            # Fallback to scraping if API fails
            return await self.fallback.scrape_product(url)
            
        except Exception as e:
            raise ConnectionError(f"Failed to fetch product data: {str(e)}")
    
    async def fetch_multiple_products(self, urls: list[str]) -> list[Dict[str, Any]]:
        """
        Fetch multiple products in parallel.
        
        Args:
            urls: List of product URLs to fetch
            
        Returns:
            List of product information dictionaries
        """
        results = []
        for url in urls:
            try:
                product = await self.fetch_product(url)
                results.append(product)
            except Exception as e:
                # Log error but continue with other products
                print(f"Error fetching {url}: {str(e)}")
                continue
        return results 