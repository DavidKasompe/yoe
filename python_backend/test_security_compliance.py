import sys
import os
from unittest.mock import patch, MagicMock
import requests

# Mock Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yoe_backend.settings")
import django
django.setup()

from analytics.services.grid_api_client import GridAPIClient

def test_rate_limiting():
    print("Testing GRID-Friendly Rate Limiting...")
    client = GridAPIClient()
    
    # Mock response with 429 followed by 200
    mock_429 = MagicMock()
    mock_429.status_code = 429
    
    mock_200 = MagicMock()
    mock_200.status_code = 200
    mock_200.json.return_value = {"success": True}
    
    with patch("requests.get", side_effect=[mock_429, mock_200]):
        # Reduce wait time for test
        client.rate_limit_pause = 0.1
        start_time = MagicMock()
        
        response = client._get("/test-endpoint")
        print(f"Response received: {response}")
        assert response == {"success": True}
        print("Rate limit handling passed (Retry successful).")

def test_security_headers():
    print("\nTesting Security Headers...")
    client = GridAPIClient()
    
    with patch("requests.get") as mock_get:
        mock_res = MagicMock()
        mock_res.status_code = 200
        mock_res.json.return_value = {}
        mock_get.return_value = mock_res
        
        client._get("/test")
        args, kwargs = mock_get.call_args
        headers = kwargs.get('headers', {})
        
        print(f"Headers sent: {headers.keys()}")
        assert 'x-api-key' in headers
        assert headers['x-api-key'] == client.api_key
        print("Security headers verified.")

if __name__ == "__main__":
    try:
        test_rate_limiting()
        test_security_headers()
        print("\nAll Security & Compliance tests passed.")
    except Exception as e:
        print(f"\nTest failed: {e}")
        sys.exit(1)
