import { NextRequest, NextResponse } from 'next/server';
import { verifyRole } from '@/lib/auth';
import { GridService } from '@/services/grid.service';
import { GroqService } from '@/services/groq.service';

export const dynamic = 'force-dynamic';

/**
 * Generate comprehensive scouting report combining:
 * 1. Real team data from database
 * 2. Analytics processing
 * 3. AI-powered insights from Groq
 */
export async function POST(req: NextRequest) {
  try {
    // RBAC check: Only Coach, Analyst, or Admin can generate reports
    // TODO: Re-enable authentication in production
    // const auth = await verifyRole(req, ['Coach', 'Analyst', 'Admin']);
    // if (!auth.authorized) {
    //   return NextResponse.json(
    //     { error: auth.error },
    //     { status: auth.authenticated ? 403 : 401 }
    //   );
    // }


    const { teamName } = await req.json();

    if (!teamName) {
      return NextResponse.json(
        { error: 'teamName is required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch team statistics from database
    const gridService = new GridService();
    const teamStats = await gridService.getTeamStatsForScouting(teamName);

    if (!teamStats) {
      return NextResponse.json(
        { error: `Team "${teamName}" not found in database. Please check spelling or ensure matches have been ingested.` },
        { status: 404 }
      );
    }

    // Step 2: Generate AI-powered insights
    const groqService = new GroqService();
    const aiReport = await groqService.generateScoutingReport(teamStats);

    // Step 3: Compile comprehensive report
    const report = {
      teamName: teamStats.teamName,
      generatedAt: new Date().toLocaleString(),
      overview: aiReport.overview,
      strategicProfile: aiReport.strategicProfile,
      championAnalysis: aiReport.championAnalysis,
      counterplay: aiReport.counterplay,
      threatLevel: aiReport.threatLevel,
      
      // Data-driven statistics
      statistics: {
        record: `${teamStats.wins}-${teamStats.losses}`,
        winRate: `${teamStats.winRate.toFixed(1)}%`,
        trend: teamStats.trend,
        league: teamStats.league,
        region: teamStats.region,
        avgGameTime: `${Math.floor(teamStats.avgGameTime / 60)}m ${teamStats.avgGameTime % 60}s`,
      },
      
      championPool: {
        topPicks: teamStats.topPicks,
        topBans: teamStats.topBans,
      },
      
      recentMatches: teamStats.recentMatches,
    };

    return NextResponse.json({ report });

  } catch (error: any) {
    console.error('Error generating scouting report:', error);
    return NextResponse.json(
      { error: 'Failed to generate scouting report', details: error.message },
      { status: 500 }
    );
  }
}
