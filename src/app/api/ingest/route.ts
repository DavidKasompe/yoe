import { NextRequest, NextResponse } from 'next/server';
import { GridService } from '@/services/grid.service';
import { AnalyticsService } from '@/services/analytics.service';
import { verifyRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // RBAC check - TODO: Re-enable in production
    // const auth = await verifyRole(req, ['Coach', 'Admin']);
    // if (!auth.authorized) {
    //   return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    // }


    const { match_id } = await req.json();

    if (!match_id) {
      return NextResponse.json({ error: 'match_id is required' }, { status: 400 });
    }

    const gridService = new GridService();
    const analyticsService = new AnalyticsService();

    const match = await gridService.ingestMatch(match_id);
    if (!match) {
      return NextResponse.json({ error: 'Failed to ingest match' }, { status: 500 });
    }

    await analyticsService.analyzeMatch(match.id);
    await analyticsService.updateChampionProfiles();

    return NextResponse.json({
      status: 'success',
      match_id: match.id,
      grid_match_id: match.gridMatchId
    });

  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
