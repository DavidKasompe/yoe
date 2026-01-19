import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { team_id: string } }
) {
  try {
    const { team_id } = params;

    // Resolve team (can be ID or Name for flexibility)
    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { id: team_id },
          { name: team_id }
        ]
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
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

    // Match History (formatted for Chart)
    const matches = await prisma.match.findMany({
      where: {
        teamStats: {
          some: { teamId: team.id }
        }
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const matchHistory = matches.reverse().map((m, i) => ({
      week: `Game ${i + 1}`,
      wins: m.winnerId === team.id ? 1 : 0,
      losses: m.winnerId === team.id ? 0 : 1,
    }));

    if (!latestSnapshot) {
      return NextResponse.json({
        win_rate: 0,
        objective_control: 0,
        deaths_per_game: 0,
        gold_advantage: 0,
        trend_deltas: {
          win_rate: "+0.0%",
          objective_control: "+0.0%",
          deaths_per_game: "+0.0",
          gold_advantage: "+0.0k",
        },
        match_history: matchHistory,
      });
    }

    const calculateChange = (current: number, previous: number | undefined, isPercentage = false) => {
      if (previous === undefined || previous === 0) return "+0.0" + (isPercentage ? "%" : "");
      const diff = current - previous;
      const prefix = diff >= 0 ? "+" : "";
      return prefix + (isPercentage ? (diff * 100).toFixed(1) + "%" : diff.toFixed(1));
    };

    return NextResponse.json({
      win_rate: (latestSnapshot.winRate * 100).toFixed(1),
      objective_control: (latestSnapshot.objectiveControl * 100).toFixed(1),
      deaths_per_game: latestSnapshot.avgDeaths.toFixed(1),
      gold_advantage: latestSnapshot.goldAdvantage,
      trend_deltas: {
        win_rate: calculateChange(latestSnapshot.winRate, previousSnapshot?.winRate, true),
        objective_control: calculateChange(latestSnapshot.objectiveControl, previousSnapshot?.objectiveControl, true),
        deaths_per_game: calculateChange(latestSnapshot.avgDeaths, previousSnapshot?.avgDeaths),
        gold_advantage: calculateChange(latestSnapshot.goldAdvantage / 1000, (previousSnapshot?.goldAdvantage || 0) / 1000) + "k",
      },
      match_history: matchHistory,
    });

  } catch (error) {
    console.error('Error fetching coach team overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
