const GRID_API_ENDPOINT = 'https://api-op.grid.gg/live-data-feed/series-state/graphql';

const GET_SERIES_STATE_QUERY = `
  query GetSeriesState($id: ID!) {
    seriesState(id: $id) {
      id
      started
      finished
      valid
      games {
        id
        sequenceNumber
        finished
        started
        teams {
          id
          baseInfo {
            name
            code
          }
          won
          statistics {
            name
            value
          }
          players {
            id
            baseInfo {
              nickname
            }
            statistics {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export class GridLiveService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GRID_API_KEY || '';
    if (this.apiKey) {
      console.log("✅ GRID Live Service: API Key detected (" + this.apiKey.substring(0, 4) + "...). Using Real Data.");
    } else {
      console.warn("⚠️ GRID Live Service: No API Key found in .env (GRID_API_KEY). Using High-Fidelity Mock Data.");
    }
  }

  async getLiveSeriesState(seriesId: string) {
    if (!this.apiKey) {
      console.warn("GRID_API_KEY is missing. Returning mock live data.");
      return this.getMockLiveState(seriesId);
    }

    try {
      const response = await fetch(GRID_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          query: GET_SERIES_STATE_QUERY,
          variables: { id: seriesId },
        }),
      });

      if (!response.ok) {
        throw new Error(`GRID API Error: ${response.statusText}`);
      }

      const { data } = await response.json();
      return this.processGridState(data.seriesState);
    } catch (error) {
      console.error("Failed to fetch GRID live state:", error);
      return this.getMockLiveState(seriesId);
    }
  }

  // Transform GRID generic stats array into usable object
  private processGridState(seriesState: any) {
    if (!seriesState) return null;

    // Get latest game (active or last finished)
    const latestGame = seriesState.games[seriesState.games.length - 1];
    if (!latestGame) return null;
    
    // Process Teams
    const teams = latestGame.teams.map((team: any) => {
        const stats = this.arrayToMap(team.statistics);
        
        // Sum player stats for some metrics if team stats are missing
        const players = team.players.map((p: any) => ({
            name: p.baseInfo.nickname,
            stats: this.arrayToMap(p.statistics)
        }));

        const totalGold = players.reduce((sum: number, p: any) => sum + (p.stats.netWorth || p.stats.gold || 0), 0);
        
        return {
            name: team.baseInfo.name,
            win: team.won,
            kills: stats.kills || 0,
            gold: totalGold, // Derived from players if needed, or check team stats
            towers: stats.towersDestroyed || 0,
            dragons: stats.dragonsKilled || 0,
            barons: stats.baronsKilled || 0,
            players
        };
    });

    return {
        seriesId: seriesState.id,
        isLive: seriesState.started && !seriesState.finished,
        gameNumber: latestGame.sequenceNumber,
        teams
    };
  }

  private arrayToMap(statsArray: any[]) {
      const map: any = {};
      if (Array.isArray(statsArray)) {
          statsArray.forEach(s => map[s.name] = s.value);
      }
      return map;
  }

  // Fallback Mock Data that mimics a live LoL game
  private getMockLiveState(seriesId: string) {
      // Dynamic mock data that changes over time to simulate a real game
      const gameMinute = Math.floor((Date.now() / 1000 / 60) % 35) + 5; // 5-40 minute game
      const baseGold = 15000 + gameMinute * 450;
      const t1GoldLead = Math.floor(Math.sin(Date.now() / 60000) * 3000) + 1500;
      
      return {
          seriesId,
          isLive: true,
          gameNumber: 1,
          gameTime: `${gameMinute}:${(Date.now() % 60).toString().padStart(2, '0')}`,
          teams: [
              {
                  name: "T1",
                  win: false,
                  kills: Math.floor(10 + (gameMinute / 5) + Math.random() * 3),
                  gold: baseGold + t1GoldLead,
                  towers: Math.min(Math.floor(gameMinute / 8), 8),
                  dragons: Math.min(Math.floor(gameMinute / 10), 4),
                  barons: gameMinute > 20 ? Math.floor(Math.random() * 2) : 0,
                  heralds: gameMinute > 8 ? 1 : 0,
                  players: [
                      { name: "Zeus", stats: { kills: 3, deaths: 1, assists: 4, cs: 160 + gameMinute * 8, gold: 9500 + gameMinute * 200, role: "Top" } },
                      { name: "Oner", stats: { kills: 2, deaths: 2, assists: 6, cs: 120 + gameMinute * 5, gold: 8200 + gameMinute * 180, role: "Jungle" } },
                      { name: "Faker", stats: { kills: 5, deaths: 0, assists: 3, cs: 180 + gameMinute * 9, gold: 10500 + gameMinute * 220, role: "Mid" } },
                      { name: "Gumayusi", stats: { kills: 4, deaths: 1, assists: 2, cs: 190 + gameMinute * 10, gold: 10200 + gameMinute * 210, role: "ADC" } },
                      { name: "Keria", stats: { kills: 0, deaths: 3, assists: 10, cs: 15 + gameMinute, gold: 6800 + gameMinute * 120, role: "Support" } }
                  ]
              },
              {
                  name: "Gen.G",
                  win: false,
                  kills: Math.floor(7 + (gameMinute / 6) + Math.random() * 2),
                  gold: baseGold - t1GoldLead + Math.floor(Math.random() * 500),
                  towers: Math.max(0, Math.floor(gameMinute / 10) - 1),
                  dragons: Math.max(0, Math.floor(gameMinute / 12)),
                  barons: 0,
                  heralds: gameMinute > 12 ? 1 : 0,
                  players: [
                      { name: "Kiin", stats: { kills: 1, deaths: 3, assists: 3, cs: 150 + gameMinute * 7, gold: 8900 + gameMinute * 180, role: "Top" } },
                      { name: "Canyon", stats: { kills: 3, deaths: 2, assists: 4, cs: 130 + gameMinute * 5, gold: 9100 + gameMinute * 190, role: "Jungle" } },
                      { name: "Chovy", stats: { kills: 3, deaths: 2, assists: 2, cs: 195 + gameMinute * 10, gold: 9800 + gameMinute * 200, role: "Mid" } },
                      { name: "Peyz", stats: { kills: 2, deaths: 4, assists: 3, cs: 180 + gameMinute * 9, gold: 9500 + gameMinute * 195, role: "ADC" } },
                      { name: "Lehends", stats: { kills: 0, deaths: 3, assists: 5, cs: 20 + gameMinute, gold: 5500 + gameMinute * 100, role: "Support" } }
                  ]
              }
          ]
      };
  }
}
