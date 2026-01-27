export class GroqService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
  }

  async generateChatCompletion(systemPrompt: string, userPrompt: string, temperature: number = 0.7): Promise<string> {
    const key = process.env.GROQ_API_KEY || this.apiKey;
    if (!key || key === 'gsk_placeholder_key') {
      console.warn("Groq API key is missing or using placeholder. Returning mock response.");
      return "AI Insight: [Mock Response] Based on the current data, focus on objective control and early game scaling.";
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "No analysis generated.";
    } catch (error) {
      console.error("Error communicating with Groq:", error);
      return "Strategic analysis temporarily unavailable.";
    }
  }

  /**
   * Generate comprehensive scouting report from team analytics
   */
  async generateScoutingReport(teamStats: any): Promise<{
    overview: string;
    strategicProfile: string;
    championAnalysis: string;
    counterplay: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }> {
    const systemPrompt = `You are an elite esports analyst and tactical advisor with expertise in competitive League of Legends. 
Analyze team performance data and provide professional scouting insights.
Focus on: strategic tendencies, champion pool depth, win conditions, and exploitable weaknesses.
Be specific, data-driven, and provide actionable recommendations.
Keep each section concise but insightful (2-3 sentences per section).`;

    const userPrompt = `Generate a scouting report for ${teamStats.teamName}:

TEAM STATISTICS:
- Recent Record: ${teamStats.wins}-${teamStats.losses} (${teamStats.winRate.toFixed(1)}% win rate)
- Form: ${teamStats.trend.toUpperCase()}
- Average Game Time: ${Math.floor(teamStats.avgGameTime / 60)} minutes
- League: ${teamStats.league}
- Region: ${teamStats.region}

TOP CHAMPION PICKS (last 20 games):
${teamStats.topPicks.map((c: any, i: number) => `${i+1}. ${c.name} (${c.count} games)`).join('\n')}

MOST BANNED AGAINST:
${teamStats.topBans.map((c: any, i: number) => `${i+1}. ${c.name} (${c.count} times)`).join('\n')}

RECENT RESULTS:
${teamStats.recentMatches.map((m: any) => `${m.result} vs ${m.opponent}`).join(', ')}

Provide FOUR sections:
1. OVERVIEW: Brief executive summary (2-3 sentences)
2. STRATEGIC PROFILE: Playstyle, tempo preferences, win conditions
3. CHAMPION ANALYSIS: Pool depth, signature picks, potential weaknesses
4. COUNTERPLAY: Specific tactical recommendations to exploit their weaknesses

Format as JSON with keys: overview, strategicProfile, championAnalysis, counterplay`;

    try {
      const response = await this.generateChatCompletion(systemPrompt, userPrompt, 0.5);
      
      // Try to parse JSON response
      try {
        // Remove markdown code blocks if present
        let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        // Determine threat level based on stats
        let threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
        if (teamStats.winRate >= 70) threatLevel = 'CRITICAL';
        else if (teamStats.winRate >= 60) threatLevel = 'HIGH';
        else if (teamStats.winRate < 40) threatLevel = 'LOW';
        
        return {
          overview: parsed.overview || parsed.OVERVIEW || 'No overview available',
          strategicProfile: parsed.strategicProfile || parsed['STRATEGIC PROFILE'] || 'No strategic profile available',
          championAnalysis: parsed.championAnalysis || parsed['CHAMPION ANALYSIS'] || 'No champion analysis available',
          counterplay: parsed.counterplay || parsed.COUNTERPLAY || 'No counterplay recommendations available',
          threatLevel
        };
      } catch (parseError) {
        // Fallback: use raw response split by sections
        return {
          overview: response.substring(0, 200),
          strategicProfile: 'Analysis includes champion pool depth and strategic patterns.',
          championAnalysis: `Key champions: ${teamStats.topPicks.slice(0, 3).map((c: any) => c.name).join(', ')}`,
          counterplay: 'Target their weaker champion pool coverage and exploit early game weaknesses.',
          threatLevel: teamStats.winRate >= 60 ? 'HIGH' : 'MEDIUM'
        };
      }
    } catch (error) {
      console.error('Error generating scouting report:', error);
      return {
        overview: 'Unable to generate AI analysis at this time.',
        strategicProfile: 'Strategic analysis unavailable',
        championAnalysis: 'Champion analysis unavailable',
        counterplay: 'Counterplay recommendations unavailable',
        threatLevel: 'MEDIUM'
      };
    }
  }
}

