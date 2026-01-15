
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'python_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoe_backend.settings')
django.setup()

from analytics.models import Match, Team, Player, PlayerStats, TeamStats, Draft, ChampionPool, ExtractedFeature
from analytics.services.analytics import AnalyticsService
from django.utils import timezone

def setup_test_data():
    # Clean up
    ExtractedFeature.objects.all().delete()
    
    # Create Team
    team, _ = Team.objects.get_or_create(name="T1", region="KR", league="LCK")
    
    # Create Match
    match, _ = Match.objects.get_or_create(
        grid_match_id="feature-test-match",
        defaults={
            "date": timezone.now(),
            "patch": "14.1",
            "duration": 1800,
            "winner": team,
            "tournament_name": "LCK Spring 2024",
            "game_title": "LoL"
        }
    )
    
    # Create TeamStats (for Early-game dominance)
    TeamStats.objects.get_or_create(
        match=match,
        team=team,
        defaults={"gold_diff_15": 2500, "barons": 1, "dragons": 3, "towers": 9}
    )
    
    # Create Players & Stats (for Team discipline - deaths variance)
    players_data = [
        {"identifier": "Zeus", "role": "Top", "deaths": [0, 1, 0, 2]},
        {"identifier": "Oner", "role": "Jungle", "deaths": [1, 1, 1, 1]},
        {"identifier": "Faker", "role": "Mid", "deaths": [0, 0, 1, 0]},
        {"identifier": "Gumayusi", "role": "Bot", "deaths": [0, 0, 0, 1]},
        {"identifier": "Keria", "role": "Support", "deaths": [2, 3, 1, 2]},
    ]
    
    for p_data in players_data:
        player, _ = Player.objects.get_or_create(
            identifier=p_data["identifier"],
            defaults={"team": team, "role": p_data["role"]}
        )
        
        # Current match stats
        PlayerStats.objects.get_or_create(
            match=match,
            player=player,
            defaults={"kills": 5, "deaths": p_data["deaths"][0], "assists": 10, "cs": 200, "gold_earned": 12000}
        )
        
        # Create ChampionPool (for Draft comfort)
        ChampionPool.objects.get_or_create(
            player=player,
            champion="Azir" if p_data["identifier"] == "Faker" else "Orianna",
            defaults={"frequency": 15, "win_rate": 0.8}
        )

    # Create Draft (for Draft comfort check)
    Draft.objects.get_or_create(
        match=match,
        team=team,
        defaults={"picks": ["Azir", "Orianna", "Aatrox", "Varus", "Rell"], "bans": []}
    )

    return match, team

def test_feature_extraction():
    match, team = setup_test_data()
    service = AnalyticsService()
    
    print("Running feature extraction...")
    service.analyze_match(match)
    
    # Verify features
    features = ExtractedFeature.objects.filter(entity_id=team.name)
    print(f"\nExtracted Features for Team {team.name}:")
    for f in features:
        print(f"- {f.feature_name}: {f.value}")

    # Specific checks
    expected_features = [
        'early_game_dominance',
        'team_discipline',
        'clutch_factor',
        'draft_comfort'
    ]
    
    found_features = [f.feature_name for f in features]
    for ef in expected_features:
        if ef in found_features:
            print(f"✅ Found {ef}")
        else:
            print(f"❌ Missing {ef}")

if __name__ == "__main__":
    test_feature_extraction()
