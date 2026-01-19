export interface GridMatchStats {
  matchId: string;
  winner: string;
  patch: string;
  duration: number;
  playerStats: {
    playerId: string;
    playerName?: string;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    gold: number;
  }[];
  teamStats: {
    teamId: string;
    barons: number;
    dragons: number;
    towers: number;
    goldDiffAt15: number;
  }[];
  draft: Record<string, {
    picks: string[];
    bans: string[];
  }>;
}

export interface GridSeriesContext {
  data: {
    series: {
      id: string;
      startTimeScheduled: string;
      format: {
        type: string;
      };
      tournament: {
        name: string;
      };
      teams: {
        team: {
          id: string;
          name: string;
        };
      }[];
      title: {
        nameShortened: string;
      };
    };
  };
}

export interface GridTeamPerformance {
  data: {
    teamStatistics: {
      series: {
        count: number;
        kills: { avg: number };
        deaths: { avg: number };
      };
      game: {
        wins: {
          percentage: number;
          streak: {
            max: number;
            current: number;
          };
        };
      };
    };
  };
}
