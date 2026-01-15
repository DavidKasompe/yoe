import os
import django
import sys

# Add the project directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'python_backend')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoe_backend.settings')
django.setup()

from analytics.services.grid_service import GridService
from analytics.services.analytics import AnalyticsService
from analytics.models import Match

def test_grid_ingestion():
    grid_match_id = "test-grid-match-123"
    
    # Clean up existing test match if any
    Match.objects.filter(grid_match_id=grid_match_id).delete()
    
    gs = GridService()
    print(f"Starting ingestion for {grid_match_id}...")
    match = gs.ingest_match(grid_match_id)
    
    if match:
        print(f"Ingestion successful: {match.grid_match_id}")
        print(f"Date: {match.date}, Patch: {match.patch}, Winner: {match.winner}")
        
        # Verify stats
        print(f"Player stats count: {match.player_stats.count()}")
        print(f"Team stats count: {match.team_stats.count()}")
        print(f"Draft count: {match.drafts.count()}")
        
        # Run analytics
        print("Running analytics pipeline...")
        asvc = AnalyticsService()
        asvc.analyze_match(match)
        
        # Verify insights
        print(f"Insights count: {match.insights.count()}")
        for insight in match.insights.all():
            print(f"- [{insight.category}] {insight.explanation[:100]}...")
    else:
        print("Ingestion failed.")

if __name__ == "__main__":
    test_grid_ingestion()
