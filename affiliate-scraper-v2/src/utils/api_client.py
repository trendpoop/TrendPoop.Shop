import aiohttp
from typing import Dict, Optional, Any
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

load_dotenv()

class APIClient:
    """Client for making API requests to product information services."""
    
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize the API client.
        
        Args:
            base_url: Optional base URL for the API service
            api_key: Optional API key for authentication
        """
        self.base_url = base_url or os.getenv('API_BASE_URL', 'https://api.productservice.com/v1')
        self.api_key = api_key or os.getenv('API_KEY')
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create an aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            })
        return self.session
        
    async def fetch_product(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Fetch product information from the API.
        
        Args:
            url: Product URL to fetch information for
            
        Returns:
            Dictionary containing product information or None if not found
            
        Raises:
            ConnectionError: If API request fails
            ValueError: If URL is invalid
        """
        if not url:
            raise ValueError("URL cannot be empty")
            
        try:
            parsed_url = urlparse(url)
            if not all([parsed_url.scheme, parsed_url.netloc]):
                raise ValueError("Invalid URL format")
                
            session = await self._get_session()
            async with session.get(
                f"{self.base_url}/products",
                params={'url': url}
            ) as response:
                if response.status == 404:
                    return None
                    
                if response.status != 200:
                    raise ConnectionError(
                        f"API request failed with status {response.status}"
                    )
                    
                return await response.json()
                
        except aiohttp.ClientError as e:
            raise ConnectionError(f"Failed to connect to API: {str(e)}")
            
    async def close(self):
        """Close the API client session."""
        if self.session and not self.session.closed:
            await self.session.close()
            
    async def __aenter__(self):
        """Async context manager entry."""
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close() 