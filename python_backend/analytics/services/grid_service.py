from django.utils import timezone
from dateutil import parser
from analytics.models import Match, Team, Player, PlayerStats, TeamStats, Draft, ChampionPool
from .grid_api_client import GridAPIClient

class GridService:
    def __init__(self):
        self.client = GridAPIClient()

    def ingest_match(self, grid_match_id: str):
        """
        Ingest a match from GRID using official APIs.
        """
        print(f"Ingesting match from GRID: {grid_match_id}...")
        
        # 1. Fetch data from GRID APIs
        series_context = self.client.get_series_context(grid_match_id)
        match_stats = self.client.get_match_stats(grid_match_id)
        
        if not series_context or not match_stats:
            print(f"Failed to fetch data for match {grid_match_id}")
            return None

        # 2. Get or Create Teams
        team_map = {} # GRID ID -> Team Object
        for team_data in series_context['teams']:
            team, _ = Team.objects.get_or_create(
                name=team_data['name'],
                defaults={
                    'region': team_data['region'],
                    'league': series_context.get('league', 'Pro League') # Example
                }
            )
            team_map[team_data['id']] = team

        # 3. Create Match
        winner_id = series_context.get('winner')
        winner = team_map.get(winner_id)
        
        match, created = Match.objects.get_or_create(
            grid_match_id=grid_match_id,
            defaults={
                "date": parser.parse(series_context['startTime']),
                "patch": series_context['patch'],
                "duration": series_context['duration'],
                "winner": winner
            }
        )
        
        if not created:
            print(f"Match {grid_match_id} already exists. Skipping.")
            return match

        # 4. Create Players & Stats
        for team_data in series_context['teams']:
            team = team_map[team_data['id']]
            for player_data in team_data['players']:
                player, _ = Player.objects.get_or_create(
                    identifier=player_data['name'],
                    team=team,
                    defaults={"role": player_data['role']}
                )
                
                # Find stats for this player
                p_stats = next((s for s in match_stats['playerStats'] if s['playerId'] == player_data['id']), None)
                if p_stats:
                    PlayerStats.objects.create(
                        match=match,
                        player=player,
                        kills=p_stats['kills'],
                        deaths=p_stats['deaths'],
                        assists=p_stats['assists'],
                        cs=p_stats['cs'],
                        gold_earned=p_stats['gold'],
                        positioning_score=0.85 # Default or derived from detailed events if available
                    )

        # 5. Create Team Stats
        for t_stats in match_stats['teamStats']:
            team = team_map.get(t_stats['teamId'])
            if team:
                TeamStats.objects.create(
                    match=match,
                    team=team,
                    barons=t_stats['barons'],
                    dragons=t_stats['dragons'],
                    towers=t_stats['towers'],
                    gold_diff_15=t_stats['goldDiffAt15']
                )

        # 6. Create Drafts
        for team_id, draft_data in match_stats['draft'].items():
            team = team_map.get(team_id)
            if team:
                Draft.objects.create(
                    match=match,
                    team=team,
                    bans=draft_data['bans'],
                    picks=draft_data['picks'],
                    win_probability=0.5 # Default, updated by AnalyticsService
                )
            
        print(f"Successfully ingested match {match.grid_match_id}")
        return match
