/**
 * GRID Central Data Service
 * 
 * Fetches real historical data from GRID's Open Access Central Data API.
 * Endpoint: https://api-op.grid.gg/central-data/graphql
 * 
 * Note: Central Data API provides metadata (teams, players, tournaments).
 * For in-game statistics, the Series State API would be needed (requires different permissions).
 */

const GRID_CENTRAL_DATA_ENDPOINT = 'https://api-op.grid.gg/central-data/graphql';

// League of Legends Title ID
const LOL_TITLE_ID = '3';

// GraphQL Queries
const QUERIES = {
  TITLES: `
    query GetTitles {
      titles {
        id
        name
      }
    }
  `,
  
  TEAMS: `
    query GetTeams($first: Int, $titleId: ID) {
      teams(first: $first, filter: { titleId: $titleId }) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `,
  
  TOURNAMENTS: `
    query GetTournaments($first: Int, $titleId: ID) {
      tournaments(first: $first, filter: { titleId: $titleId }) {
        edges {
          node {
            id
            name
            startDate
            endDate
          }
        }
      }
    }
  `,
  
  PLAYERS_WITH_TEAM: `
    query GetPlayersWithTeam($first: Int, $titleId: ID) {
      players(first: $first, filter: { titleId: $titleId }) {
        edges {
          node {
            id
            nickname
            team {
              id
              name
            }
            roles {
              name
            }
          }
        }
      }
    }
  `,

  PLAYERS_BY_TEAM: `
    query GetPlayersByTeam($first: Int, $teamId: ID) {
      players(first: $first, filter: { teamId: $teamId }) {
        edges {
          node {
            id
            nickname
            roles {
              name
            }
          }
        }
      }
    }
  `,
};

export interface GRIDTitle {
  id: string;
  name: string;
}

export interface GRIDTeam {
  id: string;
  name: string;
}

export interface GRIDPlayer {
  id: string;
  nickname: string;
  team?: GRIDTeam;
  roles?: { name: string }[];
}

export interface GRIDTournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export class GridCentralDataService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GRID_API_KEY || '';
    if (this.apiKey) {
      console.log("✅ GRID Central Data Service: API Key detected. Using Real Data from Open Access API.");
    } else {
      console.warn("⚠️ GRID Central Data Service: No API Key found. Some features may be limited.");
    }
  }

  private async query(graphqlQuery: string, variables: Record<string, any> = {}) {
    if (!this.apiKey) {
      throw new Error('GRID_API_KEY is not configured');
    }

    const response = await fetch(GRID_CENTRAL_DATA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GRID API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors && result.errors.length > 0) {
      console.error('GRID GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  /**
   * Get list of game titles (LoL, Dota2, CS2, etc.)
   */
  async getTitles(): Promise<GRIDTitle[]> {
    try {
      const data = await this.query(QUERIES.TITLES);
      return data.titles || [];
    } catch (error) {
      console.error('Failed to fetch titles:', error);
      return [];
    }
  }

  /**
   * Get teams, optionally filtered by game title
   * Default: LoL teams (titleId: 3)
   */
  async getTeams(options: { first?: number; titleId?: string } = {}): Promise<GRIDTeam[]> {
    try {
      const data = await this.query(QUERIES.TEAMS, {
        first: options.first || 50,
        titleId: options.titleId || LOL_TITLE_ID,
      });
      return data.teams?.edges?.map((e: any) => e.node) || [];
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      return [];
    }
  }

  /**
   * Get LoL teams specifically
   */
  async getLoLTeams(first: number = 50): Promise<GRIDTeam[]> {
    return this.getTeams({ first, titleId: LOL_TITLE_ID });
  }

  /**
   * Get tournaments, optionally filtered by game title
   * Default: LoL tournaments (titleId: 3)
   */
  async getTournaments(options: { first?: number; titleId?: string } = {}): Promise<GRIDTournament[]> {
    try {
      const data = await this.query(QUERIES.TOURNAMENTS, {
        first: options.first || 20,
        titleId: options.titleId || LOL_TITLE_ID,
      });
      return data.tournaments?.edges?.map((e: any) => e.node) || [];
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
      return [];
    }
  }

  /**
   * Get LoL tournaments specifically
   */
  async getLoLTournaments(first: number = 20): Promise<GRIDTournament[]> {
    return this.getTournaments({ first, titleId: LOL_TITLE_ID });
  }

  /**
   * Get players with their team info
   * Default: LoL players (titleId: 3)
   */
  async getPlayersWithTeam(options: { first?: number; titleId?: string } = {}): Promise<GRIDPlayer[]> {
    try {
      const data = await this.query(QUERIES.PLAYERS_WITH_TEAM, {
        first: options.first || 50,
        titleId: options.titleId || LOL_TITLE_ID,
      });
      return data.players?.edges?.map((e: any) => e.node) || [];
    } catch (error) {
      console.error('Failed to fetch players:', error);
      return [];
    }
  }

  /**
   * Get players for a specific team
   */
  async getPlayersByTeam(teamId: string, first: number = 10): Promise<GRIDPlayer[]> {
    try {
      const data = await this.query(QUERIES.PLAYERS_BY_TEAM, {
        first,
        teamId,
      });
      return data.players?.edges?.map((e: any) => e.node) || [];
    } catch (error) {
      console.error('Failed to fetch players for team:', error);
      return [];
    }
  }

  /**
   * Get LoL players specifically
   */
  async getLoLPlayers(first: number = 50): Promise<GRIDPlayer[]> {
    return this.getPlayersWithTeam({ first, titleId: LOL_TITLE_ID });
  }
}

