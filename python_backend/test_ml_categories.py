import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'python_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoe_backend.settings')
django.setup()

from analytics.models import Match, Team, Player, PlayerStats, TeamStats, Draft, ChampionPool, AIInsight
from analytics.services.analytics import AnalyticsService
from analytics.services.grid_service import GridService
from django.utils import timezone

def test_ml_categories():
    print("Testing ML Categories...")
    
    # 1. Setup Mock Data
    Team.objects.all().delete()
    Player.objects.all().delete()
    Match.objects.all().delete()
    AIInsight.objects.all().delete()
    
    team_a, _ = Team.objects.get_or_create(name="T1", region="KR", league="LCK")
    team_b, _ = Team.objects.get_or_create(name="Gen.G", region="KR", league="LCK")
    
    player_a, _ = Player.objects.get_or_create(identifier="Faker", team=team_a, role="Mid")
    player_b, _ = Player.objects.get_or_create(identifier="Chovy", team=team_b, role="Mid")
    
    # Create historical matches to trigger patterns
    for i in range(5):
        m = Match.objects.create(
            grid_match_id=f"hist-{i}",
            winner=team_b, # T1 loses
            duration=1800,
            patch="14.1"
        )
        PlayerStats.objects.create(match=m, player=player_a, kills=1, deaths=5, assists=2, cs=250, gold_earned=10000)
        TeamStats.objects.create(match=m, team=team_a, dragons=1)
        TeamStats.objects.create(match=m, team=team_b, dragons=3)

    # Champion Pool for Draft Assistant
    ChampionPool.objects.get_or_create(player=player_a, champion="Azir", defaults={"frequency": 10, "win_rate": 0.7})
    
    # 2. Ingest a "new" match
    grid_service = GridService()
    match = grid_service.ingest_match("ml-test-match")
    if not match:
        # If ingestion fails (due to mock 404 or something), manually create it for this test
        match, _ = Match.objects.get_or_create(
            grid_match_id="ml-test-match",
            defaults={
                "winner": team_b,
                "duration": 2000,
                "patch": "14.1",
                "format_type": "Bo3",
                "tournament_name": "LCK Spring",
                "game_title": "LoL"
            }
        )
        PlayerStats.objects.get_or_create(match=match, player=player_a, defaults={"kills": 2, "deaths": 8, "assists": 1, "cs": 280, "gold_earned": 12000})
        TeamStats.objects.get_or_create(match=match, team=team_a, defaults={"dragons": 2})
        Draft.objects.get_or_create(match=match, team=team_a, defaults={"picks": ["Azir", "Lee Sin"], "win_probability": 0.45})

    # 3. Run Analytics
    service = AnalyticsService()
    service.analyze_match(match)
    
    # 4. Verify Insights
    insights = AIInsight.objects.filter(match=match)
    print(f"Total insights generated: {insights.count()}")
    
    categories = insights.values_list('category', flat=True).distinct()
    print(f"Categories found: {list(categories)}")
    
    # Verification
    expected_categories = ["Assistant Coach", "Scouting Reports", "Draft Assistant"]
    for cat in expected_categories:
        if cat in categories:
            print(f"✅ {cat} insights generated.")
            # Print one example
            example = insights.filter(category=cat).first()
            print(f"   Example: {example.explanation[:100]}...")
        else:
            print(f"❌ {cat} insights MISSING.")

if __name__ == "__main__":
    test_ml_categories()
