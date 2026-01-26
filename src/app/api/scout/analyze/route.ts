import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AnalyticsService } from '@/services/analytics.service';
import { verifyRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // RBAC: Coach, Analyst, Admin
    const auth = await verifyRole(req, ['Coach', 'Analyst', 'Admin']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const { teamName } = await req.json();

    const team = await prisma.team.findUnique({
      where: { name: teamName },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const analytics = new AnalyticsService();
    const report = await analytics.generateScoutingReport(team.id);

    if (!report) {
      return NextResponse.json({ error: 'No data available to generate report' }, { status: 400 });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating scouting report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // RBAC: Coach, Analyst, Admin
    const auth = await verifyRole(req, ['Coach', 'Analyst', 'Admin']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get('teamName');

    if (!teamName) {
      return NextResponse.json({ error: 'teamName is required' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { name: teamName },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const report = await prisma.scoutingReport.findFirst({
      where: { teamId: team.id },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error fetching scouting report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
