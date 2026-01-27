import { NextRequest, NextResponse } from 'next/server';
import { verifyRole } from '@/lib/auth';
import { GroqService } from '@/services/groq.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // RBAC check: Only Coach, Analyst, or Admin can access LLM features
    // TODO: Re-enable authentication in production
    // const auth = await verifyRole(req, ['Coach', 'Analyst', 'Admin']);
    // if (!auth.authorized) {
    //   return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    // }

    const { analysis_payload } = await req.json();

    if (!analysis_payload) {
      return NextResponse.json({ error: 'analysis_payload is required' }, { status: 400 });
    }

    const groq = new GroqService();
    const systemPrompt = `You are a World-Class League of Legends Strategic Coach (e.g., KkOma).
Analyze the provided live match data, which includes full roster stats, gold distribution, and objective control.
Your goal is to provide a deep, actionable tactical analysis for the Head Coach.

Return ONLY valid JSON with the following structure:
{
  "overview": "Executive summary of the state of the game. focus on momentum and scaling.",
  "winCondition": "The specific primary win condition (e.g., 'Feed Jinx', '1-3-1 Splitpush', 'Navigate Baron fight'). Be specific.",
  "keyObservations": [
    "Observation 1: Analyze a specific lane matchup or gold discrepancy.",
    "Observation 2: Identify a carry performance or underperformance.",
    "Observation 3: Note a critical objective timing or rotation opportunity."
  ],
  "nextObjectives": "Tactical next steps (e.g., 'Set vision around Baron', 'Siege mid T2').",
  "risks": "Critical risks, such as enemy power spikes or vision gaps."
}
Do not include markdown formatting or code blocks. Return raw JSON only.`;
    
    const userPrompt = `LIVE MATCH DATA:
${JSON.stringify(analysis_payload, null, 2)}`;

    // Using temperature 0.4 for consistent, analytical output
    const completion = await groq.generateChatCompletion(systemPrompt, userPrompt, 0.4);
    
    // Parse the JSON response
    let analysis;
    try {
      // Clean up any potential markdown formatting
      const cleanJson = completion.replace(/```json/g, '').replace(/```/g, '').trim();
      analysis = JSON.parse(cleanJson);
      
      // Add timestamp
      analysis.generatedAt = new Date().toLocaleTimeString();
    } catch (e) {
      console.error("Failed to parse LLM response:", completion);
      // Fallback if JSON parsing fails
      analysis = {
        overview: completion,
        winCondition: "Review current game state manually",
        keyObservations: ["AI output parsing failed - raw output returned"],
        nextObjectives: "Focus on standard macro play",
        risks: "Unknown - Check manual analysis",
        generatedAt: new Date().toLocaleTimeString()
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('LLM Explain Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
