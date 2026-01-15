import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'python_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yoe_backend.settings')
django.setup()

from analytics.models import Match, Team, Player, PlayerStats, TeamStats, Draft, ChampionPool, AIInsight
from analytics.services.analytics import AnalyticsService
from django.utils import timezone

def test_llm_explanation_layer():
    print("Testing LLM Explanation Layer (Judge Favorite)...")
    
    # Cleanup
    AIInsight.objects.filter(match__grid_match_id__startswith="llm-test").delete()
    AIInsight.objects.filter(match__grid_match_id__startswith="h-match").delete()
    Match.objects.filter(grid_match_id__startswith="llm-test").delete()
    Match.objects.filter(grid_match_id__startswith="h-match").delete()
    
    # 1. Setup Test Data
    team_a = Team.objects.get_or_create(name="T1", region="LCK", league="LCK")[0]
    team_b = Team.objects.get_or_create(name="Gen.G", region="LCK", league="LCK")[0]
    
    match = Match.objects.create(
        grid_match_id="llm-test-match",
        date=timezone.now(),
        patch="14.1",
        duration=1800,
        winner=team_b,
        format_type="Bo3",
        tournament_name="LCK Spring 2024",
        game_title="LoL"
    )
    
    # Stats for Assistant Coach (Faker had high deaths in this loss)
    player = Player.objects.get_or_create(identifier="Faker", team=team_a, role="Mid")[0]
    
    # Create some historical losses for Faker
    for i in range(5):
        h_match = Match.objects.create(
            grid_match_id=f"h-match-{i}", 
            winner=team_b,
            duration=1800,
            patch="14.1"
        )
        PlayerStats.objects.create(match=h_match, player=player, deaths=2)
    
    # Current match stats (High deaths)
    PlayerStats.objects.create(match=match, player=player, deaths=6, kills=1, assists=2, cs=250, gold_earned=12000)
    
    # Stats for Scouting Reports
    TeamStats.objects.create(match=match, team=team_a, dragons=1, barons=0)
    TeamStats.objects.create(match=match, team=team_b, dragons=4, barons=1)
    
    # Draft for Draft Assistant
    Draft.objects.create(match=match, team=team_a, picks=["Azir", "Lee Sin", "Orianna"], win_probability=0.45)
    
    # 2. Run Analytics
    service = AnalyticsService()
    service.analyze_match(match)
    
    # 3. Verify Insights
    insights = AIInsight.objects.filter(match=match)
    print(f"\nGenerated {insights.count()} insights:")
    
    for insight in insights:
        print(f"\n[{insight.category}]")
        print(f"Explanation: {insight.explanation}")
        
    # Check if they follow the coaching terms pattern
    assistant_insight = insights.filter(category="Assistant Coach").first()
    if assistant_insight and "coaching attention" in assistant_insight.explanation:
        print("\n✅ Assistant Coach insight follows coaching terms pattern.")
        
    scouting_insight = insights.filter(category="Scouting Reports").first()
    if scouting_insight and "disrupt their bot-side setup" in scouting_insight.explanation:
        print("✅ Scouting Report insight follows coaching terms pattern.")
        
    draft_insight = insights.filter(category="Draft Assistant").first()
    if draft_insight and "lacks reliable hard engage" in draft_insight.explanation:
        print("✅ Draft Assistant insight follows coaching terms pattern.")

if __name__ == "__main__":
    test_llm_explanation_layer()
