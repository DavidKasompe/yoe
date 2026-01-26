import { NextRequest, NextResponse } from "next/server";
import { GridLiveService } from "@/services/grid-live.service";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const seriesId = params.id;
    const gridLive = new GridLiveService();
    
    // LoL Test Loop ID is 3, but we might accept any ID
    const data = await gridLive.getLiveSeriesState(seriesId || '3');

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching live data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
