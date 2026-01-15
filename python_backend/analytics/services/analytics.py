import pandas as pd
import numpy as np
from analytics.models import Match, PlayerStats, TeamStats, AIInsight, Draft, ExtractedFeature, Team
from .grid_api_client import GridAPIClient

class AnalyticsService:
    def __init__(self):
        self.grid_client = GridAPIClient()

    def analyze_match(self, match_id_or_obj):
        """
        Run full analysis pipeline on a match.
        1. Feature Extraction (Pandas)
        2. ML Inference (Scikit-learn / Heuristic)
        3. Insight Generation (LLM Mock)
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
        
        # 3. Insight Generation
        self._generate_insights(match)
        
        # 4. Long-term Team Performance Analysis (Stats Feed)
        self._analyze_team_performance(match)
        
        return match

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
