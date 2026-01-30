# 🎮 Assistant Coach & AI Scout

**Category:** Esports & Data Analytics / AI

An AI-powered esports analytics platform that bridges the gap between raw data and actionable coaching insights. Built for League of Legends, it provides real-time match analysis, automated scouting reports, and intelligent draft recommendations using **Groq** and the **GRID Data API**.

![Hero](https://placehold.co/1200x600/1a1a1a/c9a66b?text=AI+Assistant+Coach)

## 🚀 Key Features

### 1. 📋 Live Coach Dashboard

- **Real-time Signal Processing**: Monitors Gold, XP, and Objective differentials instantly.
- **"Explain Match" (AI)**: Uses Groq to analyze complex game states and explain _why_ a team is winning/losing in natural language.
- **Smart Alerts**: Detects win conditions and critical risks automatically.

### 2. 🕵️ AI Scouting Reports

- **Instant Analysis**: Generates comprehensive scouting reports on opponent teams in seconds.
- **Threat Assessment**: Identifies key player threats and champion pool depths.
- **Tactical Recommendations**: Suggests ban strategies and playstyle counters.

### 3. 🧠 Draft Intelligence

- **Live Ban/Pick Simulation**: Interfaces with draft phase to recommend optimal picks.
- **Deviation Detection**: Warns when the enemy team deviates from expected meta patterns.
- **Win Probability**: Dynamic forecasting based on draft composition.

## 🛠️ Technology Stack

- **Frontend**: [Next.js 14](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/), Lucide Icons
- **AI Inference**: [Groq](https://groq.com/) (Llama 3 70B & Mixtral 8x7b)
- **Data Source**: [GRID Esports API](https://grid.gg/) (Central Data & Live Feed)
- **Animations**: GSAP, Framer Motion
- **Language**: TypeScript

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/assistant-coach-ai.git
   cd assistant-coach-ai
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   GROQ_API_KEY=your_groq_key_here
   GRID_API_KEY=your_grid_key_here
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💡 Inspiration

Esports data is abundant but overwhelming. Coaches often spend hours manually aggregating stats. We wanted to build a "Second Brain" that works alongside the coach, handling the data crunching and pattern recognition so they can focus on strategy and player psychology.

## 🏆 Accomplishments

- Achieved **< 500ms latency** on AI analysis using Groq's LPU inference engine.
- Successfully visualized complex "momentum" signals using custom sparklines.
- Built a completely modular "Bento Grid" dashboard that adapts to different screen sizes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
