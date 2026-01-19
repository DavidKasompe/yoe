import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { verifyRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // RBAC: @require_role(["COACH", "ADMIN"])
    const auth = await verifyRole(req, ['Coach', 'Admin']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const currentState = await req.json();
    const analytics = new AnalyticsService();
    const result = await analytics.getDraftRecommendations(currentState);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in draft recommendations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
