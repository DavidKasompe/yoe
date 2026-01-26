import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRole } from '@/lib/auth';
import { AnalyticsService } from '@/services/analytics.service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { team_id: string } }
) {
  try {
    // RBAC: Coach, Admin
    const auth = await verifyRole(req, ['Coach', 'Admin']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

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

    const analytics = new AnalyticsService();
    const decisionMetrics = await analytics.getCoachDecisionMetrics(team.id);

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

    if (!decisionMetrics) {
      return NextResponse.json({
        performance_signal: {
          status: "Stable",
          confidence: 0.5,
          summary: "Need more match data to generate signal.",
          drivers: []
        },
        tempo_control: {
          early: "Neutral",
          mid: "Neutral",
          late: "Neutral",
          note: "Insufficient data for tempo analysis."
        },
        risk_exposure: {
          risk_level: "Low",
          pattern: "No data",
          recommendation: "Ingest data to begin analysis."
        },
        decision_cards: [
          { label: "Sessions This Month", value: "0", status: "No Data", subtext: "Need more matches", subtext_delta: "+0%" },
          { label: "Active Athletes", value: "0", status: "Neutral", subtext: "No roster data", subtext_delta: "+0" },
          { label: "Reports Generated", value: "0", status: "Neutral", subtext: "No analysis", subtext_delta: "+0%" },
          { label: "Completed Training Plans", value: "0", status: "Neutral", subtext: "No drills", subtext_delta: "+0" },
          { label: "Ongoing Programs", value: "0", status: "Neutral", subtext: "No modules", subtext_delta: "+0" },
          { label: "Success Rate", value: "0%", status: "No Data", subtext: "No matches", subtext_delta: "+0%" },
        ],
        adjustment: "Ingest data to begin analysis.",
        match_history: matchHistory,
      });
    }

    const calculateDelta = (delta: number, isPercentage = false) => {
      const prefix = delta >= 0 ? "+" : "";
      return prefix + (isPercentage ? (delta * 100).toFixed(1) + "%" : delta.toFixed(1));
    };

    return NextResponse.json({
      performance_signal: decisionMetrics.performanceSignal,
      tempo_control: decisionMetrics.tempoControl,
      risk_exposure: decisionMetrics.riskExposure,
      carry_pressure: decisionMetrics.carryPressure,
      decision_cards: [
        { 
          label: "Sessions This Month", 
          value: matches.length.toString(), 
          status: "Healthy", 
          subtext: "Total matches analyzed",
          subtext_delta: calculateDelta(decisionMetrics.deltas.winRate, true)
        },
        { 
          label: "Active Athletes", 
          value: "5", 
          status: "Healthy", 
          subtext: "Core roster active",
          subtext_delta: "+1"
        },
        { 
          label: "Reports Generated", 
          value: (matches.length * 2).toString(), 
          status: "Healthy", 
          subtext: "Post-match analysis",
          subtext_delta: "+18%"
        },
        { 
          label: "Completed Training Plans", 
          value: "32", 
          status: "Healthy", 
          subtext: "Skill drills finalized",
          subtext_delta: "+5"
        },
        { 
          label: "Ongoing Programs", 
          value: "12", 
          status: "Healthy", 
          subtext: "Strategic modules",
          subtext_delta: "+2"
        },
        { 
          label: "Success Rate", 
          value: decisionMetrics.winRate, 
          status: parseFloat(decisionMetrics.winRate) > 50 ? "Healthy" : "Needs Review", 
          subtext: "Match win percentage",
          subtext_delta: calculateDelta(decisionMetrics.deltas.winRate, true)
        },
      ],
      adjustment: decisionMetrics.adjustment,
      match_history: matchHistory,
    });

  } catch (error: any) {
    console.error('Error fetching coach team overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
