import { NextRequest, NextResponse } from "next/server";
import { GridCentralDataService } from "@/services/grid-central.service";

export const dynamic = 'force-dynamic';

/**
 * Historical Data API
 * 
 * Fetches real data from GRID Central Data API (Open Access).
 * Endpoint: GET /api/history
 * 
 * Query params:
 * - type: "titles" | "teams" | "tournaments" | "players" | "lol-teams" | "lol-tournaments" | "lol-players" | "team-players"
 * - titleId: (optional) filter by game title (e.g., "3" for LoL)
 * - teamId: (optional) for team-players type
 * - first: (optional) limit number of results
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'lol-teams';
  const titleId = searchParams.get('titleId') || undefined;
  const teamId = searchParams.get('teamId') || undefined;
  const first = parseInt(searchParams.get('first') || '50');

  const gridService = new GridCentralDataService();

  try {
    switch (type) {
      case 'titles':
        const titles = await gridService.getTitles();
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          count: titles.length,
          data: titles 
        });

      case 'teams':
        const teams = await gridService.getTeams({ first, titleId });
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          count: teams.length,
          data: teams 
        });

      case 'lol-teams':
        const lolTeams = await gridService.getLoLTeams(first);
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          game: 'League of Legends',
          count: lolTeams.length,
          data: lolTeams 
        });

      case 'tournaments':
        const tournaments = await gridService.getTournaments({ first, titleId });
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          count: tournaments.length,
          data: tournaments 
        });

      case 'lol-tournaments':
        const lolTournaments = await gridService.getLoLTournaments(first);
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          game: 'League of Legends',
          count: lolTournaments.length,
          data: lolTournaments 
        });

      case 'players':
        const players = await gridService.getPlayersWithTeam({ first, titleId });
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          count: players.length,
          data: players 
        });

      case 'lol-players':
        const lolPlayers = await gridService.getLoLPlayers(first);
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          game: 'League of Legends',
          count: lolPlayers.length,
          data: lolPlayers 
        });

      case 'team-players':
        if (!teamId) {
          return NextResponse.json({ 
            error: 'teamId required for team-players type' 
          }, { status: 400 });
        }
        const teamPlayers = await gridService.getPlayersByTeam(teamId, first);
        return NextResponse.json({ 
          status: 'success',
          source: 'grid-api',
          teamId,
          count: teamPlayers.length,
          data: teamPlayers 
        });

      default:
        return NextResponse.json({ 
          error: 'Unknown type. Available types: titles, teams, lol-teams, tournaments, lol-tournaments, players, lol-players, team-players' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error.message 
    }, { status: 500 });
  }
}
