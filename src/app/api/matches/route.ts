import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { date: 'desc' },
      include: {
        winner: true,
        playerStats: {
          include: {
            player: true
          }
        },
        teamStats: {
          include: {
            team: true
          }
        },
        insights: true,
        drafts: {
          include: {
            team: true
          }
        }
      }
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
