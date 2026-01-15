import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'python_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoe_backend.settings')
django.setup()

from analytics.services.grid_service import GridService
from analytics.models import Match, PlayerStats, TeamStats, Team

def test_static_data_alignment():
    print("Testing Static Data Alignment with GRID GraphQL...")
    
    service = GridService()
    match_id = "test-graphql-match-1"
    
    # Trigger ingestion
    match = service.ingest_match(match_id)
    
    if not match:
        print("Failed to ingest match")
        return

    print(f"Match Ingested: {match.grid_match_id}")
    print(f"Tournament: {match.tournament_name}")
    print(f"Format: {match.format_type}")
    print(f"Game Title: {match.game_title}")
    
    # Verify alignment
    assert match.tournament_name == "LCK Spring 2024"
    assert match.format_type == "Bo3"
    assert match.game_title == "LoL"
    
    print("Static Data Alignment Test Passed!")

if __name__ == "__main__":
    test_static_data_alignment()
