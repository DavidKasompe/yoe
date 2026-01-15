import pandas as pd
import numpy as np
from analytics.models import Match, PlayerStats, TeamStats, AIInsight, Draft, ExtractedFeature

class AnalyticsService:
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
        
        return match

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
        Mock LLM Insight Generation.
        """
        # Mocking "Story of the Match"
        winner = match.winner
        duration_min = match.duration // 60
        
        story = (
            f"{winner.name} secured a victory in {duration_min} minutes. "
            f"The team utilized a strong early game composition to snowball their lead. "
            f"Key objective controls around the Dragon pit were decisive."
        )
        
        AIInsight.objects.create(
            match=match,
            category="Summary",
            explanation=story,
            confidence=0.99
        )
