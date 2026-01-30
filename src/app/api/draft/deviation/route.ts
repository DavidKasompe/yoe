import { NextResponse } from 'next/server';
import { GroqService } from '@/services/groq.service';

const groqService = new GroqService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recommendedChamp, selectedChamp, draftState } = body;

    if (!recommendedChamp || !selectedChamp || !draftState) {
      return NextResponse.json(
        { error: 'Missing required deviation analysis fields' },
        { status: 400 }
      );
    }

    const analysis = await groqService.analyzePickDeviation(
      recommendedChamp,
      selectedChamp,
      draftState
    );

    return NextResponse.json(analysis);
    
  } catch (error: any) {
    console.error('Error in draft/deviation API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze deviation', details: error.message },
      { status: 500 }
    );
  }
}
