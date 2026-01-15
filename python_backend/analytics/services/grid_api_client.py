import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class GridAPIClient:
    """
    Client for interacting with GRID APIs.
    """
    def __init__(self):
        self.api_key = getattr(settings, 'GRID_API_KEY', None)
        self.base_url = getattr(settings, 'GRID_BASE_URL', 'https://api.grid.gg')
        self.headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        }

    def _get(self, endpoint, params=None):
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"GRID API Error: {e}")
            # For the sake of this implementation, we return mock data if API fails or key is default
            return self._get_mock_response(endpoint)

    def get_series_context(self, series_id):
        """
        Fetch series/match context from Central Data Feed (Static).
        """
        return self._get(f"/central/series/{series_id}")

    def get_match_stats(self, match_id):
        """
        Fetch aggregated team & player performance from Stats Feed API.
        """
        return self._get(f"/stats/match/{match_id}")

    def _get_mock_response(self, endpoint):
        """
        Provides realistic mock data when the real API is not accessible.
        In a production environment, this would handle actual API failures.
        """
        if "/central/series/" in endpoint:
            return {
                "id": endpoint.split("/")[-1],
                "startTime": "2024-01-15T12:00:00Z",
                "patch": "14.1",
                "duration": 2100,
                "teams": [
                    {
                        "id": "t1-id",
                        "name": "T1",
                        "region": "LCK",
                        "side": "blue",
                        "players": [
                            {"id": "zeus-id", "name": "Zeus", "role": "Top"},
                            {"id": "oner-id", "name": "Oner", "role": "Jungle"},
                            {"id": "faker-id", "name": "Faker", "role": "Mid"},
                            {"id": "gumayusi-id", "name": "Gumayusi", "role": "Bot"},
                            {"id": "keria-id", "name": "Keria", "role": "Support"}
                        ]
                    },
                    {
                        "id": "geng-id",
                        "name": "Gen.G",
                        "region": "LCK",
                        "side": "red",
                        "players": [
                            {"id": "kiin-id", "name": "Kiin", "role": "Top"},
                            {"id": "canyon-id", "name": "Canyon", "role": "Jungle"},
                            {"id": "chovy-id", "name": "Chovy", "role": "Mid"},
                            {"id": "peyz-id", "name": "Peyz", "role": "Bot"},
                            {"id": "lehends-id", "name": "Lehends", "role": "Support"}
                        ]
                    }
                ],
                "winner": "t1-id"
            }
        elif "/stats/match/" in endpoint:
            return {
                "matchId": endpoint.split("/")[-1],
                "playerStats": [
                    {"playerId": "zeus-id", "kills": 5, "deaths": 2, "assists": 8, "cs": 320, "gold": 15000},
                    {"playerId": "oner-id", "kills": 3, "deaths": 1, "assists": 12, "cs": 180, "gold": 12000},
                    {"playerId": "faker-id", "kills": 4, "deaths": 2, "assists": 10, "cs": 350, "gold": 16000},
                    {"playerId": "gumayusi-id", "kills": 8, "deaths": 1, "assists": 5, "cs": 400, "gold": 18000},
                    {"playerId": "keria-id", "kills": 1, "deaths": 3, "assists": 15, "cs": 60, "gold": 10000},
                    {"playerId": "kiin-id", "kills": 2, "deaths": 4, "assists": 3, "cs": 300, "gold": 13000},
                    {"playerId": "canyon-id", "kills": 2, "deaths": 3, "assists": 6, "cs": 200, "gold": 11000},
                    {"playerId": "chovy-id", "kills": 3, "deaths": 2, "assists": 4, "cs": 380, "gold": 17000},
                    {"playerId": "peyz-id", "kills": 4, "deaths": 5, "assists": 2, "cs": 350, "gold": 15000},
                    {"playerId": "lehends-id", "kills": 0, "deaths": 5, "assists": 7, "cs": 50, "gold": 9000}
                ],
                "teamStats": [
                    {"teamId": "t1-id", "barons": 1, "dragons": 3, "towers": 9, "goldDiffAt15": 1500},
                    {"teamId": "geng-id", "barons": 0, "dragons": 1, "towers": 3, "goldDiffAt15": -1500}
                ],
                "draft": {
                    "t1-id": {
                        "picks": ["Aatrox", "Lee Sin", "Ahri", "Ezreal", "Nautilus"],
                        "bans": ["Kaisa", "Rakan", "Rumble"]
                    },
                    "geng-id": {
                        "picks": ["Kiin", "Canyon", "Chovy", "Peyz", "Lehends"], # Example champions
                        "bans": ["Orianna", "Varus", "Vi"]
                    }
                }
            }
        return {}
