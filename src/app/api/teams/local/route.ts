import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Get teams from local database (teams with ingested match data)
 */
export async function GET(req: NextRequest) {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        region: true,
        league: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true,
      count: teams.length,
      data: teams 
    });

  } catch (error: any) {
    console.error('Error fetching local teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams', details: error.message },
      { status: 500 }
    );
  }
}
