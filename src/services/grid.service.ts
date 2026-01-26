import { prisma } from '../lib/prisma';
import { GridAPIClient } from './grid-api-client';

export class GridService {
  private client: GridAPIClient;

  constructor() {
    this.client = new GridAPIClient();
  }

  async ingestMatch(gridMatchId: string) {
    console.log(`Ingesting match from GRID: ${gridMatchId}...`);
    const seriesResponse = await this.client.getSeriesContext(gridMatchId);
    const matchStats = await this.client.getMatchStats(gridMatchId);

    const seriesContext = seriesResponse?.data?.series;

    if (!seriesContext || !matchStats) {
      console.error(`Failed to fetch data for match ${gridMatchId}`);
      return null;
    }

    // 1b. Create or Update Series
    const series = await prisma.series.upsert({
      where: { gridSeriesId: seriesContext.id },
      update: {
        tournamentName: seriesContext.tournament.name,
        format: seriesContext.format.type,
        startTime: new Date(seriesContext.startTimeScheduled),
      },
      create: {
        gridSeriesId: seriesContext.id,
        tournamentName: seriesContext.tournament.name,
        format: seriesContext.format.type,
        startTime: new Date(seriesContext.startTimeScheduled),
      },
    });

    // 2. Get or Create Teams
    const teamMap: Record<string, any> = {}; // GRID ID -> Team Object
    for (const teamEntry of seriesContext.teams) {
      const teamData = teamEntry.team;
      const team = await prisma.team.upsert({
        where: { name: teamData.name },
        update: {
          region: 'Unknown',
          league: seriesContext.tournament.name,
          series: {
            connect: { id: series.id }
          }
        },
        create: {
          name: teamData.name,
          region: 'Unknown',
          league: seriesContext.tournament.name,
          series: {
            connect: { id: series.id }
          }
        },
      });
      teamMap[teamData.id] = team;
    }

    // 3. Create Match
    const winnerId = matchStats.winner;
    const winner = teamMap[winnerId];

    const match = await prisma.match.upsert({
      where: { gridMatchId },
      update: {
        seriesId: series.id,
      },
      create: {
        gridMatchId,
        seriesId: series.id,
        date: new Date(seriesContext.startTimeScheduled),
        patch: matchStats.patch || 'Unknown',
        duration: matchStats.duration || 0,
        winnerId: winner?.id,
        formatType: seriesContext.format.type,
        tournamentName: seriesContext.tournament.name,
        gameTitle: seriesContext.title.nameShortened,
      },
    });

    // Check if player stats already exist (simplified check)
    const existingStatsCount = await prisma.playerStats.count({
      where: { matchId: match.id },
    });

    if (existingStatsCount > 0) {
      console.log(`Match ${gridMatchId} already has stats. Skipping ingestion of stats.`);
      return match;
    }

    // 4. Create Players & Stats
    // Assuming team index 0 is first team, team index 1 is second team for mock mapping
    const teamIds = Object.keys(teamMap);
    
    for (let i = 0; i < matchStats.playerStats.length; i++) {
      const pStats = matchStats.playerStats[i];
      // In a real scenario, we'd map players correctly. Here we distribute them.
      const assignedTeamId = i < 5 ? teamIds[0] : teamIds[1];
      const team = teamMap[assignedTeamId];

      const player = await prisma.player.upsert({
        where: {
          teamId_identifier: {
            teamId: team.id,
            identifier: pStats.playerName || `Player-${pStats.playerId}`,
          },
        },
        update: {},
        create: {
          identifier: pStats.playerName || `Player-${pStats.playerId}`,
          role: 'Unknown',
          teamId: team.id,
        },
      });

      await prisma.playerStats.create({
        data: {
          matchId: match.id,
          playerId: player.id,
          kills: pStats.kills,
          deaths: pStats.deaths,
          assists: pStats.assists,
          cs: pStats.cs,
          goldEarned: pStats.gold,
          positioningScore: 0.85,
        },
      });
    }

    // 5. Create Team Stats
    for (const tStats of matchStats.teamStats) {
      const team = teamMap[tStats.teamId];
      if (team) {
        await prisma.teamStats.create({
          data: {
            matchId: match.id,
            teamId: team.id,
            barons: tStats.barons,
            dragons: tStats.dragons,
            towers: tStats.towers,
            goldDiff15: tStats.goldDiffAt15,
          },
        });
      }
    }

    // 6. Create Drafts
    for (const [teamGridId, draftData] of Object.entries(matchStats.draft)) {
      const team = teamMap[teamGridId];
      if (team) {
        await prisma.draft.create({
          data: {
            matchId: match.id,
            teamId: team.id,
            bans: JSON.stringify(draftData.bans),
            picks: JSON.stringify(draftData.picks),
            winProbability: 0.5,
          },
        });
      }
    }

    console.log(`Successfully ingested match ${match.gridMatchId}`);
    return match;
  }
}
