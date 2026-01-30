import { NextResponse } from 'next/server';
import { GroqService } from '@/services/groq.service';

const groqService = new GroqService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bluePicks, redPicks, blueBans, redBans } = body;

    // Validate required fields
    if (!bluePicks || !redPicks) {
      return NextResponse.json(
        { error: 'Missing required draft state fields' },
        { status: 400 }
      );
    }

    const analysis = await groqService.generateDraftAnalysis(
      bluePicks || [],
      redPicks || [],
      blueBans || [],
      redBans || []
    );

    return NextResponse.json(analysis);
    
  } catch (error: any) {
    console.error('Error in draft/analyze API:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis', details: error.message },
      { status: 500 }
    );
  }
}
