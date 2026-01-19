import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get('team') || 'T1'; // Default to T1 for now

    const team = await prisma.team.findUnique({
      where: { name: teamName },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const matches = await prisma.match.findMany({
      where: {
        teamStats: {
          some: { teamId: team.id }
        }
      },
      include: {
        teamStats: true,
        playerStats: true,
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    if (matches.length === 0) {
      return NextResponse.json({
        winRate: "0%",
        objectiveControl: "0%",
        deathsPerGame: "0",
        goldAdvantage: "0",
        matchHistory: [],
      });
    }

    // Check for latest snapshots
    const latestSnapshot = await prisma.teamFeatureSnapshot.findFirst({
      where: { teamId: team.id },
      orderBy: { timestamp: 'desc' },
    });

    const previousSnapshot = await prisma.teamFeatureSnapshot.findFirst({
      where: { teamId: team.id },
      orderBy: { timestamp: 'desc' },
      skip: 1,
    });

    if (latestSnapshot) {
      const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";
      const calculateChange = (current: number, previous: number | undefined, isPercentage = false) => {
        if (previous === undefined || previous === 0) return "+0.0" + (isPercentage ? "%" : "");
        const diff = current - previous;
        const prefix = diff >= 0 ? "+" : "";
        return prefix + (isPercentage ? (diff * 100).toFixed(1) + "%" : diff.toFixed(1));
      };

      // Match History (formatted for Chart)
      const matchHistory = matches.reverse().map((m, i) => ({
        week: `Game ${i + 1}`,
        wins: m.winnerId === team.id ? 1 : 0,
        losses: m.winnerId === team.id ? 0 : 1,
      }));

      return NextResponse.json({
        winRate: formatPercent(latestSnapshot.winRate),
        objectiveControl: formatPercent(latestSnapshot.objectiveControl),
        deathsPerGame: latestSnapshot.avgDeaths.toFixed(1),
        goldAdvantage: (latestSnapshot.goldAdvantage >= 0 ? "+" : "") + (latestSnapshot.goldAdvantage / 1000).toFixed(1) + "k",
        changes: {
          winRate: calculateChange(latestSnapshot.winRate, previousSnapshot?.winRate, true),
          objectiveControl: calculateChange(latestSnapshot.objectiveControl, previousSnapshot?.objectiveControl, true),
          deathsPerGame: calculateChange(latestSnapshot.avgDeaths, previousSnapshot?.avgDeaths),
          goldAdvantage: calculateChange(latestSnapshot.goldAdvantage / 1000, (previousSnapshot?.goldAdvantage || 0) / 1000) + "k",
        },
        matchHistory,
      });
    }

    // Fallback if no snapshots exist (existing calculation logic)
    const wins = matches.filter(m => m.winnerId === team.id).length;
    const winRate = ((wins / matches.length) * 100).toFixed(1) + "%";

    // Calculate Objective Control (Barons + Dragons + Towers)
    let totalObjectives = 0;
    let teamObjectives = 0;
    
    matches.forEach(m => {
      m.teamStats.forEach(ts => {
        const objCount = ts.barons + ts.dragons + ts.towers;
        totalObjectives += objCount;
        if (ts.teamId === team.id) {
          teamObjectives += objCount;
        }
      });
    });

    const objectiveControl = totalObjectives > 0 
      ? ((teamObjectives / totalObjectives) * 100).toFixed(1) + "%"
      : "0%";

    // Calculate Deaths Per Game
    let totalDeaths = 0;
    matches.forEach(m => {
      const teamPlayerStats = m.playerStats.filter(ps => {
        // This is a bit tricky since Player model doesn't store teamId directly in current schema
        // Wait, yes it does. Let's check schema.
        return true; // We'll assume player belongs to team for now in this mock-heavy state
      });
      // Better way: use PlayerStats joined with Player
    });

    // Re-calculating Deaths with proper player filtering
    const playerStats = await prisma.playerStats.findMany({
      where: {
        matchId: { in: matches.map(m => m.id) },
        player: { teamId: team.id }
      }
    });
    
    const deathsPerGame = matches.length > 0 
      ? (playerStats.reduce((acc, ps) => acc + ps.deaths, 0) / matches.length).toFixed(1)
      : "0";

    // Calculate Gold Advantage at 15m (Average)
    const teamStats = await prisma.teamStats.findMany({
      where: {
        matchId: { in: matches.map(m => m.id) },
        teamId: team.id
      }
    });

    const avgGoldAdv = teamStats.length > 0
      ? (teamStats.reduce((acc, ts) => acc + ts.goldDiff15, 0) / teamStats.length / 1000).toFixed(1) + "k"
      : "0k";

    // Match History (formatted for Chart)
    const matchHistory = matches.reverse().map((m, i) => ({
      week: `Game ${i + 1}`,
      wins: m.winnerId === team.id ? 1 : 0,
      losses: m.winnerId === team.id ? 0 : 1,
    }));

    return NextResponse.json({
      winRate,
      objectiveControl,
      deathsPerGame,
      goldAdvantage: (parseFloat(avgGoldAdv) >= 0 ? "+" : "") + avgGoldAdv,
      matchHistory,
    });

  } catch (error) {
    console.error('Error calculating Coach KPIs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
