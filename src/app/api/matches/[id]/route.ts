import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        winner: true,
        series: true,
        playerStats: {
          include: {
            player: {
              include: { team: true }
            }
          },
          orderBy: { kills: 'desc' } // Just a default sort
        },
        teamStats: {
          include: {
            team: true
          }
        },
        insights: {
          orderBy: { confidence: 'desc' }
        },
        drafts: {
          include: {
            team: true
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error fetching match detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
