import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoe_backend.settings')
django.setup()

from rest_framework.test import APIClient
from analytics.models import Match

def verify_api():
    client = APIClient()
    
    print("1. Testing Ingestion Endpoint...")
    ingest_res = client.post('/api/v1/ingest/', {'match_id': 'TEST_MATCH_001'}, format='json')
    
    if ingest_res.status_code == 200:
        print(f"SUCCESS: Ingested Match {ingest_res.data.get('match_id')}")
    else:
        print(f"FAILURE: Ingestion failed. {ingest_res.data}")
        return

    print("\n2. Testing Match List Endpoint...")
    list_res = client.get('/api/v1/matches/')
    
    if list_res.status_code == 200:
        count = len(list_res.data)
        print(f"SUCCESS: Retrieved {count} matches.")
        if count > 0:
            match_data = list_res.data[0]
            print(f"Sample Match: {match_data['grid_match_id']} - Winner: {match_data['winner']['name']}")
            print(f"Insights Count: {len(match_data['insights'])}")
    else:
        print(f"FAILURE: List matches failed. {list_res.data}")

if __name__ == "__main__":
    verify_api()
