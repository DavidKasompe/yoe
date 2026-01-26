import { prisma } from '../lib/prisma';
import { GridAPIClient } from './grid-api-client';
import { GroqService } from './groq.service';

export class AnalyticsService {
  private gridClient: GridAPIClient;
  private groq: GroqService;

  constructor() {
    this.gridClient = new GridAPIClient();
    this.groq = new GroqService();
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

  async getCoachDecisionMetrics(teamId: string) {
    const latestSnapshot = await prisma.teamFeatureSnapshot.findFirst({
      where: { teamId },
      orderBy: { timestamp: 'desc' },
    });

    const previousSnapshot = await prisma.teamFeatureSnapshot.findFirst({
      where: { teamId },
      orderBy: { timestamp: 'desc' },
      skip: 1,
    });

    if (!latestSnapshot) return null;

    // Decision Logic: "Are we winning for the right reasons?"
    // Reason 1: Early Game Dominance
    const isEarlyDominant = latestSnapshot.goldAdvantage > 1500;
    const earlyGameStatus = isEarlyDominant ? "Dominant" : "Neutral";
    
    // Reason 2: Objective Efficiency
    const isObjectiveEfficient = latestSnapshot.objectiveControl > 0.65;
    const objectiveStatus = isObjectiveEfficient ? "High Efficiency" : "Low Pressure";

    // "Where are we exposed?"
    const exposure = latestSnapshot.avgDeaths > 4.0 ? "High Risk (Deaths)" : "Stable";
    
    // "What do we adjust next match?"
    let adjustment = "Maintain current momentum.";
    if (latestSnapshot.avgDeaths > 4.0) adjustment = "Prioritize defensive vision and safe rotations.";
    else if (latestSnapshot.objectiveControl < 0.5) adjustment = "Increase objective priority in mid-game.";
    else if (latestSnapshot.goldAdvantage < 0) adjustment = "Focus on early-game laning and gold efficiency.";

    return {
      winRate: (latestSnapshot.winRate * 100).toFixed(1) + "%",
      earlyGameStatus,
      objectiveStatus,
      exposure,
      adjustment,
      performanceSignal: this.calculatePerformanceSignal(latestSnapshot),
      tempoControl: this.calculateTempoControl(latestSnapshot),
      riskExposure: this.calculateRiskExposure(latestSnapshot),
      carryPressure: await this.calculateCarryPressure(teamId),
      raw: {
        winRate: latestSnapshot.winRate,
        goldAdvantage: latestSnapshot.goldAdvantage,
        objectiveControl: latestSnapshot.objectiveControl,
        avgDeaths: latestSnapshot.avgDeaths
      },
      deltas: {
        winRate: previousSnapshot ? (latestSnapshot.winRate - previousSnapshot.winRate) : 0,
        goldAdvantage: previousSnapshot ? (latestSnapshot.goldAdvantage - previousSnapshot.goldAdvantage) : 0,
      }
    };
  }

  private async calculateCarryPressure(teamId: string) {
    const playerStats = await prisma.playerStats.findMany({
      where: {
        player: { teamId: teamId },
        match: { teamStats: { some: { teamId: teamId } } }
      },
      include: { player: true, match: { include: { teamStats: true } } },
      orderBy: { match: { date: 'desc' } },
      take: 25 // Last 5 games (5 players each)
    });

    if (playerStats.length === 0) return null;

    const roleData: Record<string, { damage: number, gold: number, clutch: number, count: number }> = {
      "Top": { damage: 0, gold: 0, clutch: 0, count: 0 },
      "Jungle": { damage: 0, gold: 0, clutch: 0, count: 0 },
      "Mid": { damage: 0, gold: 0, clutch: 0, count: 0 },
      "ADC": { damage: 0, gold: 0, clutch: 0, count: 0 },
      "Support": { damage: 0, gold: 0, clutch: 0, count: 0 },
    };

    playerStats.forEach(ps => {
      const role = ps.player.role || "Unknown";
      if (roleData[role]) {
        roleData[role].damage += (ps.kills * 2) + ps.assists; // Proxy for damage share
        roleData[role].gold += ps.goldEarned;
        roleData[role].clutch += ps.positioningScore; // Proxy for clutch participation
        roleData[role].count += 1;
      }
    });

    const totalPressure = Object.values(roleData).reduce((acc, r) => acc + (r.count > 0 ? (r.damage + r.gold / 1000 + r.clutch * 10) : 0), 0);

    const distribution = Object.entries(roleData).map(([role, stats]) => {
      const rolePressure = stats.count > 0 ? (stats.damage + stats.gold / 1000 + stats.clutch * 10) : 0;
      const share = totalPressure > 0 ? (rolePressure / totalPressure) : 0.2;
      
      let status = "Balanced";
      if (share > 0.25) status = "Overloaded";
      else if (share < 0.15) status = "Underutilized";

      return {
        role,
        value: Math.round(share * 100),
        status
      };
    });

    const topRoles = [...distribution].sort((a, b) => b.value - a.value).slice(0, 2);
    const insight = `Carry pressure heavily concentrated on ${topRoles[0].role} and ${topRoles[1].role}.`;

    return {
      distribution,
      insight
    };
  }

  private calculateRiskExposure(snapshot: any) {
    // Logic: deaths_mid_game / total_deaths (Simulated with avgDeaths for now)
    // pattern: death clustering during mid-game rotations
    const riskLevel = snapshot.avgDeaths > 4.5 ? "High" : snapshot.avgDeaths > 3.0 ? "Medium" : "Low";
    
    let pattern = "Isolated pick-offs";
    if (snapshot.avgDeaths > 4.5) pattern = "Mid-game teamfight collapses";
    else if (snapshot.avgDeaths > 3.0) pattern = "Mid-game rotations without vision";

    let recommendation = "Maintain current vision standards.";
    if (riskLevel === "High") recommendation = "Avoid non-essential skirmishes mid-game.";
    else if (riskLevel === "Medium") recommendation = "Improve vision before objectives.";

    return {
      risk_level: riskLevel,
      pattern: pattern,
      recommendation: recommendation
    };
  }

  private calculatePerformanceSignal(snapshot: any) {
    // Formula: win_rate_weighted_by_opponent_strength + early_game_objective_score * 0.4 + mid_game_stability_score * 0.3 + late_game_conversion_score * 0.3
    // Simplified weighting for now as "opponent strength" is not explicitly modeled
    const winRateWeight = snapshot.winRate; // Base win rate
    const earlyObjScore = snapshot.objectiveControl; // Proxy for early objective score
    const midStability = snapshot.goldAdvantage > 0 ? 0.8 : 0.4; // Proxy for mid game stability
    const lateConversion = snapshot.winRate > 0.6 ? 0.9 : 0.5; // Proxy for late game conversion

    const score = (winRateWeight * 1.0) + (earlyObjScore * 0.4) + (midStability * 0.3) + (lateConversion * 0.3);
    const normalizedScore = Math.min(score / 2.0, 1.0); // Simple normalization to 0-1 range

    let status = "Stable";
    if (normalizedScore > 0.8) status = "Overperforming";
    else if (normalizedScore < 0.4) status = "At Risk";

    return {
      status,
      confidence: normalizedScore,
      summary: status === "Overperforming" ? "Driven by early objective control; late-game untested" : "Performance aligned with expectations",
      drivers: ["early_game", "objective_control"]
    };
  }

  private calculateTempoControl(snapshot: any) {
    // Segmentation: Early Strong (goldAdvantage > 1000), Mid Volatile (deaths/match > 3), Late Neutral
    const early = snapshot.goldAdvantage > 1000 ? "Strong" : "Weak";
    const mid = snapshot.avgDeaths > 3.5 ? "Volatile" : "Stable";
    const late = snapshot.objectiveControl > 0.6 ? "Strong" : "Neutral";

    return {
      early,
      mid,
      late,
      note: early === "Strong" && mid === "Volatile" ? "Tempo loss after first objective rotation" : "Maintaining consistent map pressure"
    };
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

  async generateScoutingReport(teamId: string) {
    const matches = await prisma.match.findMany({
      where: { teamStats: { some: { teamId } } },
      include: { teamStats: true, playerStats: { include: { player: true } } },
      orderBy: { date: 'desc' },
      take: 20,
    });

    if (matches.length === 0) return null;

    // 1. Early Aggression Score (Based on Gold Diff at 15m and early kills)
    const teamStats = await prisma.teamStats.findMany({
      where: { matchId: { in: matches.map(m => m.id) }, teamId }
    });
    const avgGold15 = teamStats.reduce((acc, ts) => acc + ts.goldDiff15, 0) / matches.length;
    const aggressionScore = avgGold15 > 1000 ? 0.9 : avgGold15 > 0 ? 0.6 : 0.3;
    const earlyGame = aggressionScore > 0.7 ? "Aggressive" : "Controlled";

    // 2. Mid Game Stability (Based on Gold Advantage conversion)
    const midGame = avgGold15 > 1000 && matches.filter(m => m.winnerId === teamId).length < matches.length * 0.5 
      ? "Unstable" : "Stable";

    // 3. Late Game Discipline (Based on Objective control in long games)
    const lateGame = "Disciplined"; // Simplified for now

    // 4. Weak Role Detection (Highest death avg per role)
    const roleDeaths: Record<string, { total: number, count: number }> = {};
    const playerStats = await prisma.playerStats.findMany({
      where: { matchId: { in: matches.map(m => m.id) }, player: { teamId } },
      include: { player: true }
    });

    playerStats.forEach(ps => {
      const role = ps.player.role || "Unknown";
      if (!roleDeaths[role]) roleDeaths[role] = { total: 0, count: 0 };
      roleDeaths[role].total += ps.deaths;
      roleDeaths[role].count += 1;
    });

    const weakRoles = Object.entries(roleDeaths)
      .map(([role, stats]) => ({ role, avg: stats.total / stats.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 1)
      .map(r => r.role);

    const scoutingProfile = {
      earlyGame,
      midGame,
      lateGame,
      weakRoles,
      aggressionScore
    };

    const explanation = await this.generateScoutingExplanation(scoutingProfile);

    return prisma.scoutingReport.create({
      data: {
        teamId,
        earlyGame,
        midGame,
        lateGame,
        weakRoles: JSON.stringify(weakRoles),
        aggressionScore,
        sidePreference: "Blue", // Placeholder
        explanation
      }
    });
  }

  async updateChampionProfiles() {
    // In a real scenario, we'd iterate matches and calculate these.
    // For the migration, we'll implement the logic structure.
    const champions = ["Lee Sin", "Orianna", "Jinx", "Thresh", "Renekton", "Azir"];
    
    for (const champion of champions) {
      await prisma.championProfile.upsert({
        where: { champion },
        update: {
          pickFrequency: 15,
          winRate: 0.55,
          roleSynergy: JSON.stringify({ "Mid": ["Orianna"], "Jungle": ["Lee Sin"] }),
          counterStats: JSON.stringify({ "Counters": ["LeBlanc"], "CounteredBy": ["Lissandra"] })
        },
        create: {
          champion,
          pickFrequency: 15,
          winRate: 0.55,
          roleSynergy: JSON.stringify({ "Mid": ["Orianna"], "Jungle": ["Lee Sin"] }),
          counterStats: JSON.stringify({ "Counters": ["LeBlanc"], "CounteredBy": ["Lissandra"] })
        }
      });
    }
  }

  async getDraftRecommendations(currentState: any) {
    const { blue_picks, red_picks, bans } = currentState;
    const allProfiles = await prisma.championProfile.findMany();
    
    if (allProfiles.length === 0) {
      return { 
        status: "insufficient_data",
        recommendations: [],
        message: "Champion pool models not initialized. Please run ingest/modeling first."
      };
    }
    
    // Simple evaluation logic based on prompt weights
    const recommendations = allProfiles
      .filter(p => !blue_picks.includes(p.champion) && !red_picks.includes(p.champion) && !bans.includes(p.champion))
      .map(p => {
        const synergy = JSON.parse(p.roleSynergy);
        const counters = JSON.parse(p.counterStats);
        
        let synergyScore = 0;
        let reasons: string[] = [];
        
        blue_picks.forEach((pick: string) => {
          if (Object.values(synergy).flat().includes(pick)) {
            synergyScore += 0.2;
            reasons.push(`Strong synergy with ${pick}`);
          }
        });

        let counterRisk = 0;
        red_picks.forEach((pick: string) => {
          if (counters.CounteredBy.includes(pick)) {
            counterRisk += 0.3;
            reasons.push(`Vulnerable to ${pick}`);
          }
        });

        const score = (p.winRate * 0.4) + synergyScore - counterRisk;
        
        // Build reason string
        let finalReason = reasons.length > 0 ? reasons.join(". ") : `High historical win rate (${(p.winRate * 100).toFixed(0)}%) and role comfort.`;
        if (p.champion === "Orianna") finalReason = "High mid-lane control and scaling";
        if (p.champion === "Lee Sin") finalReason = "Strong early game pressure and playmaking potential";

        return {
          champion: p.champion,
          confidence: Math.max(0.1, Math.min(0.99, score + 0.5)), // Normalize to 0-1 range
          reason: finalReason,
          winProbability: (score * 100).toFixed(1),
          synergyScore: (synergyScore * 100).toFixed(0),
          score
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return { recommendations };
  }

  private async generateScoutingExplanation(profile: any) {
    const systemPrompt = `You are a professional esports analyst. 
You are given structured analytics JSON. 
Explain ONLY what is supported by the data. 
Do not invent statistics. 
Your task is to explain tendencies, weaknesses, and counter-strategies based on these structured scouting features. Be concise and tactical.`;
    const userPrompt = `Structured Scouting Features (JSON): ${JSON.stringify(profile)}`;
    
    return this.groq.generateChatCompletion(systemPrompt, userPrompt);
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

    if (!playerStats) return;

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
    if (!drafts) return;
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
