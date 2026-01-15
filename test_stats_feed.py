import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'python_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoe_backend.settings')
django.setup()

from analytics.models import Match
from analytics.services.grid_service import GridService
from analytics.services.analytics import AnalyticsService

def test_stats_feed():
    print("Testing Stats Feed Usage & Core Analytics...")
    
    grid_service = GridService()
    analytics_service = AnalyticsService()
    
    match_id = "stats-feed-test-match"
    
    # 1. Ingest match (which uses GridAPIClient internally)
    match = grid_service.ingest_match(match_id)
    if not match:
        print("Failed to ingest match")
        return

    # 2. Run analytics (which now includes Team Performance Analysis)
    analytics_service.analyze_match(match)
    
    # 3. Verify Insights
    insights = match.insights.filter(category="Assistant Coach")
    print(f"Generated {insights.count()} Assistant Coach insights.")
    
    for insight in insights:
        print(f"- {insight.explanation}")
        if "Aggression Index" in insight.explanation and "Consistency Score" in insight.explanation:
            print("  ✓ Insight contains expected metrics.")
        else:
            print("  ✗ Insight missing expected metrics.")

    # 4. Verify Extracted Features
    from analytics.models import ExtractedFeature
    features = ExtractedFeature.objects.filter(entity_type="Team")
    print(f"Extracted {features.count()} team features.")
    for feat in features:
        print(f"- {feat.entity_id}: {feat.feature_name} = {feat.value}")

if __name__ == "__main__":
    test_stats_feed()
