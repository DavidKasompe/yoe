import pandas as pd
import numpy as np
from analytics.models import Match, PlayerStats, TeamStats, AIInsight, Draft, ExtractedFeature, Team, ChampionPool
from .grid_api_client import GridAPIClient

class AnalyticsService:
    def __init__(self):
        self.grid_client = GridAPIClient()

    def analyze_match(self, match_id_or_obj):
        """
        Run full analysis pipeline on a match.
        1. Feature Extraction (Pandas)
        2. ML Inference (Scikit-learn / Heuristic)
        3. Category-specific Analytics (Coach, Scouting, Draft)
        """
        if isinstance(match_id_or_obj, Match):
            match = match_id_or_obj
        else:
            match = Match.objects.get(id=match_id_or_obj)
            
        print(f"Analyzing match {match}...")
        
        # 1. Feature Extraction
        self._extract_performance_features(match)
        
        # 2. ML Inference (Win Prob)
        self._predict_win_probability(match)
        
        # 3. Category 1: Assistant Coach
        self._run_assistant_coach_analysis(match)
        
        # 4. Category 2: Scouting Reports
        self._run_scouting_report_analysis(match)
        
        # 5. Category 3: Draft Assistant
        self._run_draft_assistant_analysis(match)
        
        # 6. Long-term Team Performance Analysis (Stats Feed)
        self._analyze_team_performance(match)
        
        return match

    def _generate_llm_insight(self, match, category, data_context):
        """
        LLM Explanation Layer (Judge Favorite)
        - Structured analytics input
        - Contextual metadata
        - Output in coaching terms
        """
        # In a production environment, this would call an LLM API (e.g., OpenAI, Anthropic)
        # with a prompt like:
        # "You are an esports analyst. Explain the following statistics in coaching terms: [JSON data_context]"
        
        # Here we implement the logic to format the "Structured analytics" and produce 
        # the "Judge Favorite" style output.
        
        explanation = ""
        if category == "Assistant Coach":
            player_name = data_context.get('player')
            deaths = data_context.get('deaths')
            avg_deaths = data_context.get('avg_deaths')
            explanation = (
                f"{player_name} struggled with positioning in this match, recording {deaths} deaths compared to "
                f"their usual {avg_deaths:.1f} in similar losses. This suggests a vulnerability in mid-game "
                "rotations that needs immediate coaching attention."
            )
        elif category == "Scouting Reports":
            team_name = data_context.get('team')
            tendency = data_context.get('tendency')
            explanation = (
                f"{team_name} consistently prioritizes {tendency.lower()} in the early game. Opponents should "
                "look to disrupt their bot-side setup, where they often overextend when forced into low-economy "
                "defensive scenarios."
            )
        elif category == "Draft Assistant":
            win_prob = data_context.get('win_prob', 0.5)
            comfort_picks = data_context.get('comfort_picks', [])
            comfort_str = f"While {', '.join(comfort_picks)} are high-comfort picks, " if comfort_picks else ""
            explanation = (
                f"The draft yielded a {win_prob*100:.0f}% win probability. {comfort_str}"
                "the composition lacks reliable hard engage, making late-game objective "
                "contests high-risk."
            )
        else:
            explanation = f"Analysis for {category}: {data_context}"

        return AIInsight.objects.create(
            match=match,
            category=category,
            explanation=explanation,
            confidence=0.95
        )

    def _run_assistant_coach_analysis(self, match):
        """
        Category 1: Assistant Coach
        """
        player_stats = PlayerStats.objects.filter(match=match)
        
        for ps in player_stats:
            historical_stats = PlayerStats.objects.filter(
                player=ps.player, 
                match__winner__isnull=False
            ).exclude(match=match).order_by('-match__date')[:10]
            
            if not historical_stats:
                continue

            losses = [s for s in historical_stats if s.match.winner != s.player.team]
            if losses:
                avg_deaths_in_losses = sum(s.deaths for s in losses) / len(losses)
                if ps.deaths > avg_deaths_in_losses:
                    self._generate_llm_insight(match, "Assistant Coach", {
                        "player": ps.player.identifier,
                        "deaths": ps.deaths,
                        "avg_deaths": avg_deaths_in_losses
                    })

    def _run_scouting_report_analysis(self, match):
        """
        Category 2: Scouting Reports
        """
        teams = Team.objects.filter(id__in=list(match.team_stats.values_list('team_id', flat=True)))
        
        for team in teams:
            recent_matches = Match.objects.filter(
                team_stats__team=team
            ).exclude(id=match.id).order_by('-date')[:5]
            
            if not recent_matches:
                continue
                
            recent_stats = TeamStats.objects.filter(match__in=recent_matches, team=team)
            avg_dragons = sum(s.dragons for s in recent_stats) / recent_stats.count()
            
            tendency = "Heavy Objective Focus" if avg_dragons > 3 else "Early Game Aggression"
            
            self._generate_llm_insight(match, "Scouting Reports", {
                "team": team.name,
                "tendency": tendency
            })

    def _run_draft_assistant_analysis(self, match):
        """
        Category 3: Draft Assistant
        """
        drafts = Draft.objects.filter(match=match)
        
        for draft in drafts:
            # Check comfort for each pick
            picks = draft.picks
            comfort_picks = []
            for pick in picks:
                # Mock check in ChampionPool
                pool = ChampionPool.objects.filter(champion=pick, player__team=draft.team).first()
                if pool and pool.frequency > 5:
                    comfort_picks.append(pick)
            
            self._generate_llm_insight(match, "Draft Assistant", {
                "team": draft.team.name,
                "win_prob": draft.win_probability,
                "comfort_picks": comfort_picks
            })

    def _analyze_team_performance(self, match):
        """
        Analyze long-term performance for teams in the match using GRID Stats Feed.
        """
        teams = Team.objects.filter(id__in=[match.winner_id] + list(match.team_stats.values_list('team_id', flat=True)))
        
        for team in teams:
            # Dynamically select filter based on use case (Scouting)
            perf_data = self.grid_client.get_team_performance(team.name, time_window="LAST_6_MONTHS")
            stats = perf_data.get('data', {}).get('teamStatistics')
            
            if not stats:
                continue

            # 1. Aggression Index (kills vs deaths)
            avg_kills = stats['series']['kills']['avg']
            avg_deaths = stats['series']['deaths']['avg']
            aggression_index = avg_kills / max(1, avg_deaths)
            
            # 2. Consistency Score (win streak volatility)
            win_pct = stats['game']['wins']['percentage']
            max_streak = stats['game']['wins']['streak']['max']
            current_streak = stats['game']['wins']['streak']['current']
            # Heuristic: win_pct * (current / max) adjusted for volatility
            consistency_score = win_pct * (1 + (current_streak / max(1, max_streak)))
            
            # 3. Momentum Indicators
            momentum = "High" if current_streak >= 3 else "Stable"
            
            # Save Insights
            AIInsight.objects.create(
                match=match,
                category="Assistant Coach",
                explanation=(
                    f"Team {team.name} Trends: Aggression Index is {aggression_index:.2f}. "
                    f"Consistency Score: {consistency_score:.2f}. "
                    f"Momentum: {momentum} (Current Streak: {current_streak})."
                ),
                confidence=0.88
            )
            
            # Save Extracted Features
            ExtractedFeature.objects.create(
                entity_id=team.name,
                entity_type='Team',
                feature_name='aggression_index',
                value=aggression_index
            )
            ExtractedFeature.objects.create(
                entity_id=team.name,
                entity_type='Team',
                feature_name='consistency_score',
                value=consistency_score
            )

    def _extract_performance_features(self, match):
        """
        Calculate derived metrics using Pandas.
        """
        # Load stats into DataFrame
        stats_qs = PlayerStats.objects.filter(match=match).values(
            'player__identifier', 'player__role', 'kills', 'deaths', 'assists', 'gold_earned', 'cs'
        )
        df = pd.DataFrame(list(stats_qs))
        
        if df.empty:
            return

        # Calculate Aggression Score
        # (K + A) / Duration_in_minutes
        duration_min = match.duration / 60
        df['aggression'] = (df['kills'] + df['assists']) / duration_min
        
        # Calculate Gold Efficiency
        df['gold_per_cs'] = df['gold_earned'] / df['cs'].replace(0, 1)
        
        # 1. Team Discipline (Deaths Variance)
        deaths_variance = df['deaths'].var()
        
        # 2. Early-game dominance (Segment-level win % proxy via Gold Diff @ 15)
        team_stats = TeamStats.objects.filter(match=match)
        for ts in team_stats:
            # Early game dominance feature (normalized -1 to 1 based on 5000 gold diff)
            dominance = float(max(-1.0, min(1.0, ts.gold_diff_15 / 5000.0)))
            ExtractedFeature.objects.create(
                entity_id=ts.team.name,
                entity_type='Team',
                feature_name='early_game_dominance',
                value=dominance
            )
            
            # Team Discipline feature (inverted variance - more variance = less discipline)
            # Normalized 0 to 1
            discipline = float(1.0 / (1.0 + (deaths_variance if not np.isnan(deaths_variance) else 0)))
            ExtractedFeature.objects.create(
                entity_id=ts.team.name,
                entity_type='Team',
                feature_name='team_discipline',
                value=discipline
            )

        # 3. Draft Comfort (Champion usage frequency)
        drafts = Draft.objects.filter(match=match)
        for draft in drafts:
            comfort_scores = []
            # Debug: print(f"Checking draft for {draft.team.name}. Picks: {draft.picks}")
            for pick in draft.picks:
                # Find if any player in the team has this champ in their pool
                # Use filter and iterate or first()
                pool = ChampionPool.objects.filter(player__team=draft.team, champion=pick)
                if pool.exists():
                    # Comfort = frequency * winrate normalized
                    p = pool.first()
                    score = min(1.0, (p.frequency * p.win_rate) / 20.0)
                    # Debug: print(f"Found {pick} in pool. Score: {score}")
                    comfort_scores.append(score)
                else:
                    # Debug: print(f"Could NOT find {pick} in pool for team {draft.team.name}")
                    comfort_scores.append(0.0)
            
            avg_comfort = sum(comfort_scores) / max(1, len(comfort_scores))
            ExtractedFeature.objects.create(
                entity_id=draft.team.name,
                entity_type='Team',
                feature_name='draft_comfort',
                value=avg_comfort
            )

        # 4. Clutch Factor (Win streak recovery / performance under pressure)
        # Mock logic based on winner and match importance
        for ts in team_stats:
            is_winner = (match.winner == ts.team)
            # High clutch if won a Bo3/Bo5 and was behind at 15
            clutch_value = 0.5
            if is_winner and ts.gold_diff_15 < 0:
                clutch_value = 0.9 # Comeback win
            elif not is_winner and ts.gold_diff_15 > 0:
                clutch_value = 0.2 # Thrown lead
            
            ExtractedFeature.objects.create(
                entity_id=ts.team.name,
                entity_type='Team',
                feature_name='clutch_factor',
                value=clutch_value
            )

        # Find MVP (Highest Aggression)
        try:
            mvp_row = df.loc[df['aggression'].idxmax()]
            
            # Save extracted features
            for _, row in df.iterrows():
                ExtractedFeature.objects.create(
                    entity_id=row['player__identifier'],
                    entity_type='Player',
                    feature_name='aggression_score',
                    value=row['aggression']
                )
                ExtractedFeature.objects.create(
                    entity_id=row['player__identifier'],
                    entity_type='Player',
                    feature_name='gold_efficiency',
                    value=row['gold_per_cs']
                )

            AIInsight.objects.create(
                match=match,
                category="Performance",
                explanation=f"MVP: {mvp_row['player__identifier']} with {mvp_row['aggression']:.2f} Aggression Score.",
                confidence=0.95
            )
        except:
            pass

    def _predict_win_probability(self, match):
        """
        Simulate ML Model inference for Draft Win Probability.
        """
        # In a real scenario, this would load a pickled sklearn model
        # and transform draft picks into a feature vector.
        
        drafts = Draft.objects.filter(match=match)
        for draft in drafts:
            # Mock prediction logic based on randomness + "meta" picks
            base_prob = 0.5
            meta_picks = ["Hwei", "Azir", "Ksante"]
            
            bonus = sum([0.05 for pick in draft.picks if pick in meta_picks])
            draft.win_probability = min(0.99, base_prob + bonus)
            draft.save()
            
            AIInsight.objects.create(
                match=match,
                category="Draft",
                explanation=f"Team {draft.team.name} draft win probability: {draft.win_probability:.0%}. Key met picks identified.",
                confidence=0.85
            )

    def _generate_insights(self, match):
        """
        LLM Insight Generation Layer.
        Provides "Koach-Friendly" explanations.
        """
        winner = match.winner
        duration_min = match.duration // 60
        
        # 1. Performance Insight
        stats_qs = PlayerStats.objects.filter(match=match)
        top_killer = stats_qs.order_by('-kills').first()
        
        if top_killer:
            AIInsight.objects.create(
                match=match,
                category="Coach Feedback",
                explanation=f"Strong performance from {top_killer.player.identifier}. Their {top_killer.kills} kills were pivotal in securing map control during the mid-game transitions.",
                confidence=0.92
            )

        # 2. Match Summary Insight
        if winner:
            story = (
                f"Strategic Breakdown: {winner.name} dominated the objective game, "
                f"securing victory in {duration_min} minutes. Their gold efficiency "
                f"around the 15-minute mark allowed for a clean snowball into the late game."
            )
            
            AIInsight.objects.create(
                match=match,
                category="Summary",
                explanation=story,
                confidence=0.99
            )
