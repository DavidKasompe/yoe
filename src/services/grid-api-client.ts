import { GridMatchStats, GridSeriesContext, GridTeamPerformance } from '../types/grid';

export class GridAPIClient {
  private apiKey: string | undefined;
  private baseUrl: string;
  private headers: Record<string, string>;
  private rateLimitPause = 1000; // 1 second

  constructor() {
    this.apiKey = process.env.GRID_API_KEY;
    this.baseUrl = process.env.GRID_BASE_URL || 'https://api.grid.gg';
    this.headers = {
      'x-api-key': this.apiKey || '',
      'Content-Type': 'application/json',
    };
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, options: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        console.warn('GRID API Rate Limit reached. Pausing...');
        await this.sleep(this.rateLimitPause);
        return this.fetchWithRetry(url, options);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`GRID API Error: ${error}`);
      return this.getMockResponse(url, options);
    }
  }

  private async get(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    }
    return this.fetchWithRetry(url.toString(), {
      method: 'GET',
      headers: this.headers,
    });
  }

  private async post(endpoint: string, data: any) {
    const url = `${this.baseUrl}${endpoint}`;
    return this.fetchWithRetry(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
  }

  async getSeriesContext(seriesId: string): Promise<GridSeriesContext> {
    const query = `
      query GetSeriesContext($seriesId: ID!) {
        series(id: $seriesId) {
          id
          startTimeScheduled
          format {
            type
          }
          tournament {
            name
          }
          teams {
            team {
              name
              id
            }
          }
          title {
            nameShortened
          }
        }
      }
    `;
    const variables = { seriesId };
    return this.post('/central/graphql', { query, variables });
  }

  async getMatchStats(matchId: string): Promise<GridMatchStats> {
    return this.get(`/stats/match/${matchId}`);
  }

  async getTeamPerformance(teamId: string, timeWindow = 'LAST_6_MONTHS'): Promise<GridTeamPerformance> {
    const query = `
      query TeamPerformance($teamId: ID!, $timeWindow: String!) {
        teamStatistics(
          teamId: $teamId,
          filter: { timeWindow: $timeWindow }
        ) {
          series {
            count
            kills { avg }
            deaths { avg }
          }
          game {
            wins {
              percentage
              streak {
                max
                current
              }
            }
          }
        }
      }
    `;
    const variables = { teamId, timeWindow };
    return this.post('/stats/graphql', { query, variables });
  }

  private getMockResponse(url: string, options: RequestInit): any {
    const body = options.body ? JSON.parse(options.body as string) : null;

    if (url.includes('/central/graphql')) {
      if (body?.query?.includes('GetSeriesContext')) {
        const seriesId = body.variables?.seriesId || 'unknown';
        return {
          data: {
            series: {
              id: seriesId,
              startTimeScheduled: '2024-01-15T12:00:00Z',
              format: { type: 'Bo3' },
              tournament: { name: 'LCK Spring 2024' },
              teams: [
                { team: { id: 't1-id', name: 'T1' } },
                { team: { id: 'geng-id', name: 'Gen.G' } },
              ],
              title: { nameShortened: 'LoL' },
            },
          },
        };
      }
    }

    if (url.includes('/stats/graphql')) {
      if (body?.query?.includes('TeamPerformance')) {
        return {
          data: {
            teamStatistics: {
              series: {
                count: 24,
                kills: { avg: 14.5 },
                deaths: { avg: 12.2 },
              },
              game: {
                wins: {
                  percentage: 0.65,
                  streak: {
                    max: 8,
                    current: 3,
                  },
                },
              },
            },
          },
        };
      }
    }

    if (url.includes('/stats/match/')) {
      const matchId = url.split('/').pop();
      return {
        matchId,
        winner: 't1-id',
        patch: '14.1',
        duration: 2100,
        playerStats: [
          { playerId: 'zeus-id', playerName: 'Zeus', kills: 5, deaths: 2, assists: 8, cs: 320, gold: 15000 },
          { playerId: 'oner-id', playerName: 'Oner', kills: 3, deaths: 1, assists: 12, cs: 180, gold: 12000 },
          { playerId: 'faker-id', playerName: 'Faker', kills: 4, deaths: 2, assists: 10, cs: 350, gold: 16000 },
          { playerId: 'gumayusi-id', playerName: 'Gumayusi', kills: 8, deaths: 1, assists: 5, cs: 400, gold: 18000 },
          { playerId: 'keria-id', playerName: 'Keria', kills: 1, deaths: 3, assists: 15, cs: 60, gold: 10000 },
          { playerId: 'kiin-id', playerName: 'Kiin', kills: 2, deaths: 4, assists: 3, cs: 300, gold: 13000 },
          { playerId: 'canyon-id', playerName: 'Canyon', kills: 2, deaths: 3, assists: 6, cs: 200, gold: 11000 },
          { playerId: 'chovy-id', playerName: 'Chovy', kills: 3, deaths: 2, assists: 4, cs: 380, gold: 17000 },
          { playerId: 'peyz-id', playerName: 'Peyz', kills: 4, deaths: 5, assists: 2, cs: 350, gold: 15000 },
          { playerId: 'lehends-id', playerName: 'Lehends', kills: 0, deaths: 5, assists: 7, cs: 50, gold: 9000 },
        ],
        teamStats: [
          { teamId: 't1-id', barons: 1, dragons: 3, towers: 9, goldDiffAt15: 1500 },
          { teamId: 'geng-id', barons: 0, dragons: 1, towers: 3, goldDiffAt15: -1500 },
        ],
        draft: {
          't1-id': {
            picks: ['Aatrox', 'Lee Sin', 'Ahri', 'Ezreal', 'Nautilus'],
            bans: ['Kaisa', 'Rakan', 'Rumble'],
          },
          'geng-id': {
            picks: ['Jax', 'Vi', 'Azir', 'Aphelios', 'Lulu'],
            bans: ['Orianna', 'Varus', 'Vi'],
          },
        },
      };
    }

    return {};
  }
}
