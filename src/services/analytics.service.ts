import { prisma } from '../lib/prisma';
import { GridAPIClient } from './grid-api-client';

export class AnalyticsService {
  private gridClient: GridAPIClient;

  constructor() {
    this.gridClient = new GridAPIClient();
  }

  async analyzeMatch(matchId: string) {
    console.log(`Analyzing match ${matchId}...`);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        playerStats: { include: { player: true } },
        teamStats: { include: { team: true } },
        drafts: { include: { team: true } },
      },
    });

    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    // 1. Feature Extraction
    await this.extractPerformanceFeatures(matchId);

    // 2. ML Inference (Win Prob)
    await this.predictWinProbability(matchId);

    // 3. Category 1: Assistant Coach
    await this.runAssistantCoachAnalysis(matchId);

    // 4. Category 2: Scouting Reports
    await this.runScoutingReportAnalysis(matchId);

    // 5. Category 3: Draft Assistant
    await this.runDraftAssistantAnalysis(matchId);

    // 6. Long-term Team Performance Analysis (Stats Feed)
    await this.analyzeTeamPerformance(matchId);

    // 7. Create feature snapshots for the teams involved (Assistant Coach)
    const matchData = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teamStats: true }
    });
    if (matchData) {
      for (const ts of matchData.teamStats) {
        await this.createTeamFeatureSnapshot(ts.teamId);
      }
    }

    return match;
  }

  async createTeamFeatureSnapshot(teamId: string) {
    const matches = await prisma.match.findMany({
      where: { teamStats: { some: { teamId } } },
      include: { teamStats: true, playerStats: true },
      orderBy: { date: 'desc' },
      take: 20,
    });

    if (matches.length === 0) return;

    // 1. Win Rate
    const wins = matches.filter(m => m.winnerId === teamId).length;
    const winRate = wins / matches.length;

    // 2. Objective Control
    let totalObjectives = 0;
    let teamObjectives = 0;
    matches.forEach(m => {
      m.teamStats.forEach(ts => {
        const objCount = ts.barons + ts.dragons + ts.towers;
        totalObjectives += objCount;
        if (ts.teamId === teamId) teamObjectives += objCount;
      });
    });
    const objectiveControl = totalObjectives > 0 ? teamObjectives / totalObjectives : 0;

    // 3. Avg Deaths
    const playerStats = await prisma.playerStats.findMany({
      where: {
        matchId: { in: matches.map(m => m.id) },
        player: { teamId: teamId }
      }
    });
    const avgDeaths = matches.length > 0 ? playerStats.reduce((acc, ps) => acc + ps.deaths, 0) / matches.length : 0;

    // 4. Gold Advantage (at 15m)
    const teamStats = await prisma.teamStats.findMany({
      where: {
        matchId: { in: matches.map(m => m.id) },
        teamId: teamId
      }
    });
    const goldAdvantage = teamStats.length > 0 ? teamStats.reduce((acc, ts) => acc + ts.goldDiff15, 0) / teamStats.length : 0;

    return prisma.teamFeatureSnapshot.create({
      data: {
        teamId,
        winRate,
        objectiveControl,
        avgDeaths,
        goldAdvantage,
      }
    });
  }

  private async generateLLMInsight(matchId: string, category: string, dataContext: any) {
    let explanation = '';
    if (category === 'Assistant Coach') {
      const { player, deaths, avg_deaths } = dataContext;
      explanation = `${player} struggled with positioning in this match, recording ${deaths} deaths compared to their usual ${avg_deaths.toFixed(
        1
      )} in similar losses. This suggests a vulnerability in mid-game rotations that needs immediate coaching attention.`;
    } else if (category === 'Scouting Reports') {
      const { team, tendency } = dataContext;
      explanation = `${team} consistently prioritizes ${tendency.toLowerCase()} in the early game. Opponents should look to disrupt their bot-side setup, where they often overextend when forced into low-economy defensive scenarios.`;
    } else if (category === 'Draft Assistant') {
      const { win_prob, comfort_picks } = dataContext;
      const comfortStr = comfort_picks?.length
        ? `While ${comfort_picks.join(', ')} are high-comfort picks, `
        : '';
      explanation = `The draft yielded a ${(win_prob * 100).toFixed(
        0
      )}% win probability. ${comfortStr}the composition lacks reliable hard engage, making late-game objective contests high-risk.`;
    } else {
      explanation = `Analysis for ${category}: ${JSON.stringify(dataContext)}`;
    }

    return await prisma.aIInsight.create({
      data: {
        matchId,
        category,
        explanation,
        confidence: 0.95,
      },
    });
  }

  private async runAssistantCoachAnalysis(matchId: string) {
    const playerStats = await prisma.playerStats.findMany({
      where: { matchId },
      include: { player: { include: { team: true } } },
    });

    for (const ps of playerStats) {
      const historicalStats = await prisma.playerStats.findMany({
        where: {
          playerId: ps.playerId,
          match: { winnerId: { not: null }, id: { not: matchId } },
        },
        include: { match: true },
        orderBy: { match: { date: 'desc' } },
        take: 10,
      });

      if (historicalStats.length === 0) continue;

      const losses = historicalStats.filter((s) => s.match.winnerId !== ps.player.teamId);
      if (losses.length > 0) {
        const avgDeathsInLosses = losses.reduce((sum, s) => sum + s.deaths, 0) / losses.length;
        if (ps.deaths > avgDeathsInLosses) {
          await this.generateLLMInsight(matchId, 'Assistant Coach', {
            player: ps.player.identifier,
            deaths: ps.deaths,
            avg_deaths: avgDeathsInLosses,
          });
        }
      }
    }
  }

  private async runScoutingReportAnalysis(matchId: string) {
    const teamStats = await prisma.teamStats.findMany({
      where: { matchId },
      include: { team: true },
    });

    for (const ts of teamStats) {
      const recentMatches = await prisma.match.findMany({
        where: {
          teamStats: { some: { teamId: ts.teamId } },
          id: { not: matchId },
        },
        orderBy: { date: 'desc' },
        take: 5,
      });

      if (recentMatches.length === 0) continue;

      const recentStats = await prisma.teamStats.findMany({
        where: {
          matchId: { in: recentMatches.map((m) => m.id) },
          teamId: ts.teamId,
        },
      });

      const avgDragons = recentStats.reduce((sum, s) => sum + s.dragons, 0) / recentStats.length;
      const tendency = avgDragons > 3 ? 'Heavy Objective Focus' : 'Early Game Aggression';

      await this.generateLLMInsight(matchId, 'Scouting Reports', {
        team: ts.team.name,
        tendency,
      });
    }
  }

  private async runDraftAssistantAnalysis(matchId: string) {
    const drafts = await prisma.draft.findMany({
      where: { matchId },
      include: { team: { include: { players: true } } },
    });

    for (const draft of drafts) {
      const picks: string[] = JSON.parse(draft.picks);
      const comfortPicks: string[] = [];

      for (const pick of picks) {
        const pool = await prisma.championPool.findFirst({
          where: {
            champion: pick,
            player: { teamId: draft.teamId },
          },
        });
        if (pool && pool.frequency > 5) {
          comfortPicks.push(pick);
        }
      }

      await this.generateLLMInsight(matchId, 'Draft Assistant', {
        team: draft.team.name,
        win_prob: draft.winProbability,
        comfort_picks: comfortPicks,
      });
    }
  }

  private async analyzeTeamPerformance(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teamStats: { include: { team: true } } },
    });

    if (!match) return;

    const teamIds = new Set([match.winnerId, ...match.teamStats.map((ts) => ts.teamId)]);

    for (const teamId of Array.from(teamIds)) {
      if (!teamId) continue;
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) continue;

      const perfData = await this.gridClient.getTeamPerformance(team.name, 'LAST_6_MONTHS');
      const stats = perfData?.data?.teamStatistics;

      if (!stats) continue;

      const avgKills = stats.series.kills.avg;
      const avgDeaths = stats.series.deaths.avg;
      const aggressionIndex = avgKills / Math.max(1, avgDeaths);

      const winPct = stats.game.wins.percentage;
      const maxStreak = stats.game.wins.streak.max;
      const currentStreak = stats.game.wins.streak.current;
      const consistencyScore = winPct * (1 + currentStreak / Math.max(1, maxStreak));

      const momentum = currentStreak >= 3 ? 'High' : 'Stable';

      await prisma.aIInsight.create({
        data: {
          matchId,
          category: 'Assistant Coach',
          explanation: `Team ${team.name} Trends: Aggression Index is ${aggressionIndex.toFixed(
            2
          )}. Consistency Score: ${consistencyScore.toFixed(
            2
          )}. Momentum: ${momentum} (Current Streak: ${currentStreak}).`,
          confidence: 0.88,
        },
      });

      await prisma.extractedFeature.createMany({
        data: [
          {
            entityId: team.name,
            entityType: 'Team',
            featureName: 'aggression_index',
            value: aggressionIndex,
          },
          {
            entityId: team.name,
            entityType: 'Team',
            featureName: 'consistency_score',
            value: consistencyScore,
          },
        ],
      });
    }
  }

  private async extractPerformanceFeatures(matchId: string) {
    const playerStats = await prisma.playerStats.findMany({
      where: { matchId },
      include: { player: true },
    });

    for (const ps of playerStats) {
      const kda = (ps.kills + ps.assists) / Math.max(1, ps.deaths);
      await prisma.extractedFeature.create({
        data: {
          entityId: ps.player.identifier,
          entityType: 'Player',
          featureName: 'kda',
          value: kda,
        },
      });
    }
  }

  private async predictWinProbability(matchId: string) {
    const drafts = await prisma.draft.findMany({ where: { matchId } });
    for (const draft of drafts) {
      // Mock ML logic
      const winProb = 0.5 + (Math.random() * 0.2 - 0.1);
      await prisma.draft.update({
        where: { id: draft.id },
        data: { winProbability: winProb },
      });
    }
  }
}
