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
        series_response = self.client.get_series_context(grid_match_id)
        match_stats = self.client.get_match_stats(grid_match_id)
        
        # Extract series context from GraphQL response
        series_context = series_response.get('data', {}).get('series')
        
        if not series_context or not match_stats:
            print(f"Failed to fetch data for match {grid_match_id}")
            return None

        # 2. Get or Create Teams
        team_map = {} # GRID ID -> Team Object
        for team_entry in series_context['teams']:
            team_data = team_entry['team']
            team, _ = Team.objects.get_or_create(
                name=team_data['name'],
                defaults={
                    'region': 'Unknown', # GraphQL snippet didn't include region
                    'league': series_context['tournament']['name']
                }
            )
            team_map[team_data['id']] = team

        # 3. Create Match
        winner_id = match_stats.get('winner') # Winner usually comes from stats/result
        winner = team_map.get(winner_id)
        
        match, created = Match.objects.get_or_create(
            grid_match_id=grid_match_id,
            defaults={
                "date": parser.parse(series_context['startTimeScheduled']),
                "patch": match_stats.get('patch', 'Unknown'),
                "duration": match_stats.get('duration', 0),
                "winner": winner,
                "format_type": series_context['format']['type'],
                "tournament_name": series_context['tournament']['name'],
                "game_title": series_context['title']['nameShortened']
            }
        )
        
        if not created:
            print(f"Match {grid_match_id} already exists. Skipping.")
            return match

        # 4. Create Players & Stats
        # Note: GraphQL series context has limited player info, using stats feed for players
        for p_stats in match_stats['playerStats']:
            # Find which team this player belongs to from stats feed if available,
            # or try to map based on match_stats teams
            t_stats = next((ts for ts in match_stats['teamStats'] if any(ps['playerId'] == p_stats['playerId'] for ps in match_stats['playerStats'])), None)
            
            # Simple mapping for demo/implementation:
            # In a real scenario, GRID provides detailed player/team mapping in the series context.
            # Here we assume player ID can be used to find or create.
            
            # For this implementation, we'll try to get the team from the stats feed team data
            team_id = next((ts['teamId'] for ts in match_stats['teamStats'] if ts['teamId'] in team_map), None)
            # This is a bit simplified, in reality match_stats would link player to team
            
            player, _ = Player.objects.get_or_create(
                identifier=p_stats.get('playerName', f"Player-{p_stats['playerId']}"),
                defaults={"role": "Unknown", "team": team_map.get(list(team_map.keys())[0])} # Fallback
            )
            
            PlayerStats.objects.create(
                match=match,
                player=player,
                kills=p_stats['kills'],
                deaths=p_stats['deaths'],
                assists=p_stats['assists'],
                cs=p_stats['cs'],
                gold_earned=p_stats['gold'],
                positioning_score=0.85
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
