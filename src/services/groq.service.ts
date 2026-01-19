export class GroqService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
  }

  async generateChatCompletion(systemPrompt: string, userPrompt: string, temperature: number = 0.7): Promise<string> {
    if (!this.apiKey || this.apiKey === 'gsk_placeholder_key') {
      console.warn("Groq API key is missing or using placeholder. Returning mock response.");
      return "AI Insight: [Mock Response] Based on the current data, focus on objective control and early game scaling.";
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
}
