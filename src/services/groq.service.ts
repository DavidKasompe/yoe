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

  /**
   * Generate AI recommendation for the current draft phase
   */
  async generateDraftRecommendation(
    bluePicks: (string | null)[],
    redPicks: (string | null)[],
    blueBans: (string | null)[],
    redBans: (string | null)[],
    currentPhase: { team: 'blue' | 'red', type: 'ban' | 'pick' },
    availableChampions: string[]
  ): Promise<{
    champion: string;
    reason: string;
    confidence: number;
    synergyScore: number;
    counterScore: number;
  }> {
    const isBan = currentPhase.type === 'ban';
    const activeTeam = currentPhase.team === 'blue' ? 'Blue Team' : 'Red Team';
    const opponentTeam = currentPhase.team === 'blue' ? 'Red Team' : 'Blue Team';

    const systemPrompt = `You are a world-class League of Legends draft coach (fearless draft expert). 
Analyze the current pick/ban phase and recommend the optimal move.
${isBan ? 'Suggest a high-value BAN to deny the enemy win conditions.' : 'Suggest a high-value PICK to round out the composition or counter the enemy.'}
Consider: synergy, counter-picks, meta strength, and damage/role balance.
Be decisive and strategic.`;

    const userPrompt = `Draft State:
Blue Picks: [${bluePicks.filter(Boolean).join(', ')}]
Blue Bans: [${blueBans.filter(Boolean).join(', ')}]
Red Picks: [${redPicks.filter(Boolean).join(', ')}]
Red Bans: [${redBans.filter(Boolean).join(', ')}]

Current Turn: ${activeTeam} to ${currentPhase.type.toUpperCase()}
Available Pool Sample: ${availableChampions.slice(0, 20).join(', ')}...

Return a JSON object with:
- champion: The name of the champion to ${isBan ? 'ban' : 'pick'}
- reason: A concise, strategic explanation (2 sentences max)
- confidence: A broad number between 0.0 and 1.0 representing how strong this move is
- synergyScore: 0-100 score for fit with own team (0 if ban)
- counterScore: 0-100 score for impact against enemy`;

    try {
      const response = await this.generateChatCompletion(systemPrompt, userPrompt, 0.7);
      
      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        let recommendedChamp = parsed.champion;
        
        // Strict validation: Ensure AI didn't hallucinate an unavailable champion
        if (!availableChampions.includes(recommendedChamp)) {
             console.warn(`AI suggested unavailable champion ${recommendedChamp}. Fallback to first available.`);
             recommendedChamp = availableChampions[0];
        }

        return {
          champion: recommendedChamp || 'Unknown',
          reason: parsed.reason || 'Strategic recommendation based on current composition.',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
          synergyScore: typeof parsed.synergyScore === 'number' ? parsed.synergyScore : 80,
          counterScore: typeof parsed.counterScore === 'number' ? parsed.counterScore : 75
        };
      } catch {
        // Fallback for parsing error
        const randomChamp = availableChampions[0] || 'Ahri';
        return {
          champion: randomChamp,
          reason: "Prioritize flexibility and blind-pick potential.",
          confidence: 0.75,
          synergyScore: 70,
          counterScore: 60
        };
      }
    } catch (error) {
      console.error('Error generating draft recommendation:', error);
      return {
        champion: availableChampions[0] || 'Lee Sin',
        reason: "Unable to analyze draft state. Suggesting comfort pick.",
        confidence: 0.5,
        synergyScore: 50,
        counterScore: 50
      };
    }
  }

  /**
   * Generate final analysis of the completed draft
   */
  async generateDraftAnalysis(
    bluePicks: string[],
    redPicks: string[],
    blueBans: string[],
    redBans: string[]
  ): Promise<{
    winnerPrediction: 'Blue' | 'Red';
    winProbability: number;
    blueWinCondition: string;
    redWinCondition: string;
    keyMatchup: string;
    description: string;
  }> {
    const systemPrompt = `You are a professional League of Legends high-elo analyst.
Analyze the completed draft for two teams (Blue vs Red).
Identify the team with the better composition based on: scaling, engage, disengage, synergy, and counter-picks.
Predict the winner and explain the win conditions for both sides.`;

    const userPrompt = `COMPLETED DRAFT:
    
BLUE TEAM:
Picks: [${bluePicks.join(', ')}]
Bans: [${blueBans.join(', ')}]

RED TEAM:
Picks: [${redPicks.join(', ')}]
Bans: [${redBans.join(', ')}]

Return a JSON object with:
- winnerPrediction: "Blue" or "Red"
- winProbability: Number between 0 and 100 (e.g. 55)
- blueWinCondition: How Blue team wins (1 sentence)
- redWinCondition: How Red team wins (1 sentence)
- keyMatchup: The most volatile or important lane (e.g. "Top: Fiora vs Jax")
- description: A short summary of how the game likely plays out (3 sentences)`;

    try {
      const response = await this.generateChatCompletion(systemPrompt, userPrompt, 0.6);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        winnerPrediction: parsed.winnerPrediction || 'Blue',
        winProbability: parsed.winProbability || 50,
        blueWinCondition: parsed.blueWinCondition || 'Execute early game divess.',
        redWinCondition: parsed.redWinCondition || 'Scale for late game teamfights.',
        keyMatchup: parsed.keyMatchup || 'Mid Lane',
        description: parsed.description || 'Both teams have strong compositions.'
      };
    } catch (error) {
      console.error('Error generating final analysis:', error);
      return {
        winnerPrediction: 'Blue',
        winProbability: 50,
        blueWinCondition: 'Play for objectives.',
        redWinCondition: 'Split push effectively.',
        keyMatchup: 'Teamfights',
        description: 'Analysis unavailable.'
      };
    }
  }

  /**
   * Analyze the impact of a user deviating from the AI recommendation
   */
  async analyzePickDeviation(
    recommendedChamp: string,
    selectedChamp: string,
    draftState: any
  ): Promise<{
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGH_RISK';
    analysis: string;
    lostAdvantage: string;
    gainedAdvantage: string;
  }> {
    const action = draftState.currentPhase.type === 'ban' ? 'ban' : 'pick';
    const systemPrompt = `You are a League of Legends draft coach. 
The user declined your recommendation (${recommendedChamp}) and wants to ${action} ${selectedChamp}.
Analyze the strategic impact of this switch.
Be critical but fair. If the new ${action} is terrible, say so. If it's a valid side-grade, explain the trade-off.`;

    const userPrompt = `CONTEXT:
Recommended: ${recommendedChamp}
Selected: ${selectedChamp}
Phase: ${draftState.currentPhase.team} ${draftState.currentPhase.type}

Current Composition:
Blue Picks: ${JSON.stringify(draftState.bluePicks)}
Red Picks: ${JSON.stringify(draftState.redPicks)}

Analyze:
1. What strategic advantage is lost by skipping ${recommendedChamp}?
2. What (if anything) is gained by taking ${selectedChamp}?
3. Overall impact rating (POSITIVE, NEUTRAL, NEGATIVE, HIGH_RISK).

Return JSON:
{
  "impact": "...",
  "analysis": "2 sentence summary of why this changes the game plan.",
  "lostAdvantage": "Short phrase (e.g., 'Lost consistent engage')",
  "gainedAdvantage": "Short phrase (e.g., 'Gained lane dominance')"
}`;

    try {
      const response = await this.generateChatCompletion(systemPrompt, userPrompt, 0.7);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        impact: parsed.impact || 'NEUTRAL',
        analysis: parsed.analysis || `Switching to ${selectedChamp} alters the team dynamic.`,
        lostAdvantage: parsed.lostAdvantage || 'Synergy with recommendation',
        gainedAdvantage: parsed.gainedAdvantage || 'Comfort pick'
      };
    } catch (error) {
      console.error('Error analyzing deviation:', error);
      return {
        impact: 'NEUTRAL',
        analysis: 'Unable to analyze strategic deviation at this moment.',
        lostAdvantage: 'Unknown',
        gainedAdvantage: 'Unknown'
      };
    }
  }
}

