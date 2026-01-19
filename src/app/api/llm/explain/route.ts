import { NextRequest, NextResponse } from 'next/server';
import { verifyRole } from '@/lib/auth';
import { GroqService } from '@/services/groq.service';

export async function POST(req: NextRequest) {
  try {
    // RBAC check: Only Coach, Analyst, or Admin can access LLM features
    const auth = await verifyRole(req, ['Coach', 'Analyst', 'Admin']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const { analysis_payload } = await req.json();

    if (!analysis_payload) {
      return NextResponse.json({ error: 'analysis_payload is required' }, { status: 400 });
    }

    const groq = new GroqService();
    const systemPrompt = "You are a professional esports analyst.";
    
    // Using temperature 0.4 as per the Django-based prompt instructions
    const explanation = await groq.generateChatCompletion(systemPrompt, analysis_payload, 0.4);

    return NextResponse.json({ explanation });

  } catch (error) {
    console.error('LLM Explain Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
