import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { team_id: string } }
) {
  try {
    // RBAC: Analyst, Admin
    const auth = await verifyRole(req, ['Analyst', 'Admin']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const { team_id } = params;

    // Resolve team (by ID or Name)
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

    const report = await prisma.scoutingReport.findFirst({
      where: { teamId: team.id },
      orderBy: { timestamp: 'desc' },
    });

    if (!report) {
      return NextResponse.json({ error: 'No report found for this team' }, { status: 404 });
    }

    // Mapping to the requested API Contract
    return NextResponse.json({
      tendencies: {
        early_game: report.earlyGame,
        mid_game: report.midGame,
        late_game: report.lateGame,
        aggression_score: report.aggressionScore,
        side_preference: report.sidePreference
      },
      weaknesses: JSON.parse(report.weakRoles),
      llm_summary: report.explanation
    });

  } catch (error) {
    console.error('Error fetching scouting report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
