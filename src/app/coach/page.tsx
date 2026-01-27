"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Zap, TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Sword, Users, Eye, Crown, RefreshCw, Trophy } from "lucide-react";

// SVG Lane Icons
const LaneIcons = {
  Top: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3 3h7v7H3V3zm11 0h7v3h-7V3zm0 5h7v3h-7V8zm0 5h7v8h-4v-5h-3v-3zm-11 3h7v5H3v-5zm0-5h3v3H3v-3z" />
    </svg>
  ),
  Jungle: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18 8v8l-6 3.75L6 16V8l6-3.5z" />
    </svg>
  ),
  Mid: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3 3h18v3H6v4h12v4H6v4h15v3H3V3z" />
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3 3h7v3H3V3zm0 5h3v3H3V8zm0 5h3v3H3v-3zm0 5h7v3H3v-3zm11-15h7v8h-4v-5h-3V3zm0 11h7v7h-7v-7z" />
    </svg>
  ),
  Support: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  ADC: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 3l7 7-7 7-7-7 7-7z" />
    </svg>
  ),
};

const getRoleIcon = (role: string) => {
  const roleMap: Record<string, keyof typeof LaneIcons> = {
    'Top': 'Top',
    'Jungle': 'Jungle', 
    'Mid': 'Mid',
    'ADC': 'Bot',
    'Bot': 'Bot',
    'Support': 'Support',
  };
  return LaneIcons[roleMap[role] || 'Mid'];
};

// Sparkline component for mini trends
const Sparkline = ({ data, color = "#c9a66b", height = 40 }: { data: number[], color?: string, height?: number }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full absolute inset-0 opacity-30">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Circular progress ring
const ProgressRing = ({ value, size = 120, strokeWidth = 8, color = "#c9a66b" }: { value: number, size?: number, strokeWidth?: number, color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id={`ringGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#ringGrad-${color})`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

// Enhanced card wrapper with improved styling
const GlassCard = ({ children, className = "", glow = false, hover = true }: { children: React.ReactNode, className?: string, glow?: boolean, hover?: boolean }) => (
  <div className={`
    relative rounded-2xl overflow-hidden
    bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950
    border border-white/[0.08]
    ${glow ? 'shadow-2xl shadow-brown/20 border-brown/20' : 'shadow-lg shadow-black/50'}
    ${hover ? 'hover:scale-[1.01] hover:shadow-2xl hover:shadow-brown/10 hover:border-white/[0.12]' : ''}
    transition-all duration-300 ease-out
    ${className}
  `}>
    {/* Subtle inner glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />
    
    {/* Glow effect for important cards */}
    {glow && (
      <div className="absolute -inset-[1px] bg-gradient-to-br from-brown/10 via-brown-light/5 to-transparent rounded-2xl blur-md -z-10" />
    )}
    
    {/* Content */}
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

interface LiveData {
  seriesId: string;
  isLive: boolean;
  gameNumber: number;
  gameTime?: string;
  teams: Array<{
    name: string;
    win: boolean;
    kills: number;
    gold: number;
    towers: number;
    dragons: number;
    barons: number;
    heralds?: number;
    players: Array<{
      name: string;
      stats: {
        kills?: number;
        deaths?: number;
        assists?: number;
        cs?: number;
        gold?: number;
        role?: string;
      };
    }>;
  }>;
}

import { MatchAnalysisModal } from "@/components/coach/MatchAnalysisModal";

// ... [Keep existing component definitions up to CoachDashboard export] ...

export default function CoachDashboard() {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExplaining, setIsExplaining] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null); // New state for structured analysis
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Historical data for sparklines
  const [goldHistory, setGoldHistory] = useState<number[]>([]);
  const [killsHistory, setKillsHistory] = useState<number[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([]);

  const fetchLiveGame = useCallback(async () => {
    try {
      const res = await fetch('/api/live/3');
      const data = await res.json();
      setLiveData(data);
      setLastUpdated(new Date());
      
      // Update historical data for sparklines
      if (data?.teams?.[0]) {
        const goldDiff = (data.teams[0].gold - data.teams[1].gold) / 1000;
        setGoldHistory(prev => [...prev.slice(-9), goldDiff]);
        setKillsHistory(prev => [...prev.slice(-9), data.teams[0].kills]);
        
        // Performance score based on objectives and kills
        const perfScore = (data.teams[0].kills * 2) + (data.teams[0].towers * 5) + (data.teams[0].dragons * 3) + (data.teams[0].barons * 10);
        setPerformanceHistory(prev => [...prev.slice(-14), perfScore]);
      }
    } catch (e) {
      console.error("Failed to fetch live data", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveGame();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchLiveGame, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveGame]);

  const handleExplainMatch = async () => {
    if (!liveData?.teams?.[0]) return;
    
    setIsExplaining(true);
    try {
      const team = liveData.teams[0];
      const enemy = liveData.teams[1];
      
      // Prepare rich context for the AI
      const analysisPayload = {
        gameState: {
          gameTime: liveData.gameTime || "Unknown",
          goldDiff: ((team.gold - enemy.gold) / 1000).toFixed(1) + "k",
          kills: { us: team.kills, them: enemy.kills },
          objectives: {
            us: { towers: team.towers, dragons: team.dragons, barons: team.barons },
            them: { towers: enemy.towers, dragons: enemy.dragons, barons: enemy.barons }
          }
        },
        // Send full roster for deep analysis
        roster: team.players.map(p => ({
          name: p.name,
          role: p.stats.role || "Unknown",
          kda: `${p.stats.kills || 0}/${p.stats.deaths || 0}/${p.stats.assists || 0}`,
          cs: p.stats.cs || 0,
          gold: p.stats.gold || 0,
        })),
        // Send enemy key stats for matchup context
        enemyRoster: enemy.players.map(p => ({
          name: p.name,
          role: p.stats.role || "Unknown",
          kda: `${p.stats.kills || 0}/${p.stats.deaths || 0}/${p.stats.assists || 0}`,
          gold: p.stats.gold || 0,
        }))
      };

      const response = await fetch('/api/llm/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_payload: analysisPayload })
      });

      if (!response.ok) throw new Error("Analysis failed");

      const { analysis } = await response.json();
      setAnalysisData(analysis);
      
    } catch (error) {
      console.error("Failed to explain match:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const teams = liveData?.teams || [];
  const ourTeam = teams[0] || { kills: 0, gold: 0, towers: 0, dragons: 0, barons: 0, heralds: 0, players: [] };
  const enemyTeam = teams[1] || { kills: 0, gold: 0, towers: 0, dragons: 0, barons: 0, heralds: 0, players: [] };

  // Calculate metrics from live data
  const goldDiff = ((ourTeam.gold - enemyTeam.gold) / 1000).toFixed(1);
  const goldDiffNum = Number(goldDiff);
  const isGoldPositive = goldDiffNum >= 0;
  
  const totalObjOurs = ourTeam.towers + ourTeam.dragons + (ourTeam.barons || 0);
  const totalObjEnemy = enemyTeam.towers + enemyTeam.dragons + (enemyTeam.barons || 0);
  const objControl = totalObjOurs + totalObjEnemy > 0 
    ? Math.round((totalObjOurs / (totalObjOurs + totalObjEnemy)) * 100) 
    : 50;

  // Calculate team KDA
  const teamKills = ourTeam.kills;
  const teamDeaths = enemyTeam.kills;
  const teamAssists = ourTeam.players.reduce((sum, p) => sum + (p.stats.assists || 0), 0);
  const teamKDA = teamDeaths > 0 ? ((teamKills + teamAssists) / teamDeaths).toFixed(1) : "Perfect";

  // Resource usage (based on gold efficiency)
  const totalGoldOurs = ourTeam.players.reduce((sum, p) => sum + (p.stats.gold || 0), 0);
  const avgGold = totalGoldOurs / (ourTeam.players.length || 1);
  const resourceUsage = Math.min(Math.round((avgGold / 15000) * 100), 100);

  // Win probability calculation (simplified)
  const winProbability = Math.min(Math.max(
    50 + (goldDiffNum * 2) + ((teamKills - teamDeaths) * 1.5) + ((objControl - 50) * 0.5),
    10
  ), 90);

  const roster = ourTeam.players.map((p) => ({
    role: p.stats.role || "Mid",
    name: `${ourTeam.name || 'T1'} ${p.name}`,
    kda: `${p.stats.kills || 0}/${p.stats.deaths || 0}/${p.stats.assists || 0}`,
    cs: p.stats.cs || 0,
    gold: p.stats.gold || 0,
    ult: Math.random() > 0.3, // Simulated - would come from real data
  }));

  const coachingActions = [
    { label: "Review Draft", urgent: false },
    { label: "Call Baron", urgent: totalObjOurs >= 3 && ourTeam.barons === 0 },
    { label: "Ping Dragon", urgent: ourTeam.dragons < 3 },
    { label: "Check Vision", urgent: false },
    { label: "Review Fights", urgent: teamDeaths > teamKills },
  ];

  if (isLoading && !liveData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
          <div className="text-neutral-500 animate-pulse flex items-center gap-3">
            <RefreshCw className="animate-spin" size={20} />
            Connecting to GRID Live Feed...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-black -m-10 p-10 pt-16">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">ASSISTANT COACH</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-ping absolute" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-green-400 font-bold uppercase tracking-wider">LIVE</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Our Team Logo */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-brown/40 bg-gradient-to-br from-brown/20 to-brown-light/20">
                      <img 
                        src={`https://am-a.akamaihd.net/image?resize=75:&f=http://static.lolesports.com/teams/${(ourTeam.name || 'T1').toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}.png`}
                        alt={ourTeam.name || 'T1'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-brown/30 to-brown-light/30 text-brown-light font-black text-xs';
                          fallback.textContent = (ourTeam.name || 'T1').substring(0, 2).toUpperCase();
                          target.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <span className="text-sm text-white font-semibold">
                      {ourTeam.name || 'T1'} 
                    </span>
                  </div>
                  <span className="text-neutral-600">vs</span>
                  {/* Enemy Team Logo */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 bg-white/5">
                      <img 
                        src={`https://am-a.akamaihd.net/image?resize=75:&f=http://static.lolesports.com/teams/${(enemyTeam.name || 'Gen.G').toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}.png`}
                        alt={enemyTeam.name || 'Gen.G'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex items-center justify-center bg-white/10 text-white font-black text-xs';
                          fallback.textContent = (enemyTeam.name || 'Gen.G').substring(0, 2).toUpperCase();
                          target.parentElement?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <span className="text-sm text-neutral-300 font-semibold">
                      {enemyTeam.name || 'Gen.G'}
                    </span>
                  </div>
                  <span className="text-neutral-600">•</span>
                  <span className="text-sm text-neutral-500">
                    Game {liveData?.gameNumber || 1}
                  </span>
                </div>
              </div>
              {lastUpdated && (
                <div className="text-[10px] text-neutral-600 mt-1">
                  Last updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchLiveGame}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                title="Refresh"
              >
                <RefreshCw size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={handleExplainMatch}
                disabled={isExplaining}
                className="px-6 py-3 bg-gradient-to-r from-brown to-brown-light hover:from-brown-light hover:to-brown text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-brown/20"
              >
                <Zap size={18} className={isExplaining ? 'animate-pulse' : ''} />
                {isExplaining ? 'ANALYZING...' : 'EXPLAIN MATCH'}
              </button>
            </div>
          </div>

          {/* Bento Grid Layout - SAME AS BEFORE, JUST REMOVED THE OLD AI INSIGHT CARD */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Win Probability - Large Square */}
            <GlassCard className="col-span-12 md:col-span-4 lg:col-span-3 p-6" glow>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brown/30 to-brown-light/30 flex items-center justify-center">
                  <Trophy size={18} className="text-brown-light" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-wider block">Win Probability</span>
                  <div className={`flex items-center gap-1 ${winProbability > 50 ? 'text-green-400' : 'text-red-400'} text-xs font-bold mt-0.5`}>
                    {winProbability > 50 ? <TrendingUp size={12} /> : <ArrowDownRight size={12} />}
                    {winProbability > 50 ? 'Favored' : 'Behind'}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center py-2">
                <div className="relative">
                  <ProgressRing value={winProbability} size={140} strokeWidth={10} color={winProbability > 50 ? "#22c55e" : "#ef4444"} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-white">{winProbability.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Objective Control */}
            <GlassCard className="col-span-6 md:col-span-4 lg:col-span-3 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <Crown size={16} className="text-purple-400" />
                </div>
                <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">Objectives</span>
              </div>
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <ProgressRing value={objControl} size={100} strokeWidth={8} color="#d4af71" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{objControl}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs font-semibold mt-3">
                <div className="flex items-center gap-1">
                  <span className="text-neutral-600">🗼</span>
                  <span className="text-white">{ourTeam.towers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-neutral-600">🐉</span>
                  <span className="text-purple-400">{ourTeam.dragons}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-neutral-600">👑</span>
                  <span className="text-brown-light">{ourTeam.barons || 0}</span>
                </div>
              </div>
            </GlassCard>

            {/* Gold Diff with Sparkline */}
            <GlassCard className="col-span-6 md:col-span-4 lg:col-span-6 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isGoldPositive ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20' : 'bg-gradient-to-br from-red-500/20 to-red-600/20'}`}>
                  <TrendingUp size={16} className={isGoldPositive ? 'text-yellow-400' : 'text-red-400'} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-wider block">Gold Advantage</span>
                  <span className="text-[10px] text-neutral-600">vs {enemyTeam.name || 'Enemy'}</span>
                </div>
              </div>
              <div className="relative h-20">
                <Sparkline data={goldHistory} color={isGoldPositive ? "#eab308" : "#ef4444"} height={80} />
                <div className="absolute bottom-0 left-0">
                  <span className={`text-4xl font-black ${isGoldPositive ? 'text-yellow-400' : 'text-red-400'}`}>
                    {isGoldPositive ? '+' : ''}{goldDiff}k
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Team Roster */}
            <GlassCard className="col-span-12 md:col-span-6 lg:col-span-3 p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
                  <Users size={16} className="text-blue-400" />
                </div>
                <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">Team Roster</span>
              </div>
              <div className="space-y-3">
                {roster.map((player, i) => {
                  const RoleIcon = getRoleIcon(player.role);
                  const kda = player.kda.split('/');
                  const kills = parseInt(kda[0]);
                  const deaths = parseInt(kda[1]);
                  const kdaRatio = deaths > 0 ? (kills / deaths) : kills;
                  const kdaColor = kdaRatio >= 3 ? 'text-green-400' : kdaRatio >= 1.5 ? 'text-yellow-400' : 'text-red-400';
                  const playerName = player.name.split(' ').pop() || player.name;
                  
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all group">
                      {/* Player Avatar with Role Icon Overlay */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/10 to-white/5 group-hover:border-brown/40 transition-all">
                          <img 
                            src={`https://am-a.akamaihd.net/image?resize=75:&f=http://static.lolesports.com/players/${playerName.toLowerCase()}.png`}
                            alt={playerName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-brown/20 to-brown-light/20 text-brown-light font-black text-xs';
                              fallback.textContent = playerName.substring(0, 2).toUpperCase();
                              target.parentElement?.appendChild(fallback);
                            }}
                          />
                        </div>
                        {/* Role Icon Badge */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center text-neutral-400">
                          <RoleIcon />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-bold truncate block">{playerName}</span>
                        <span className="text-[10px] text-neutral-600">{player.role}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono ${kdaColor}`}>{player.kda}</span>
                        <div className="text-[10px] text-neutral-600">{player.cs} CS</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Performance Signal - Wide */}
            <GlassCard className="col-span-12 md:col-span-6 lg:col-span-6 p-6">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 block">Performance Signal</span>
              <div className="h-32 relative">
                {performanceHistory.length > 1 && (
                  <svg viewBox="0 0 300 80" className="w-full h-full">
                    <defs>
                      <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a66b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#c9a66b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area fill */}
                    <path
                      d={`M0,80 ${performanceHistory.map((v, i) => `L${i * (300 / (performanceHistory.length - 1))},${80 - (v / Math.max(...performanceHistory)) * 70}`).join(' ')} L300,80 Z`}
                      fill="url(#perfGradient)"
                    />
                    {/* Line */}
                    <path
                      d={`M0,${80 - (performanceHistory[0] / Math.max(...performanceHistory)) * 70} ${performanceHistory.map((v, i) => `L${i * (300 / (performanceHistory.length - 1))},${80 - (v / Math.max(...performanceHistory)) * 70}`).join(' ')}`}
                      fill="none"
                      stroke="#c9a66b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            </GlassCard>

            {/* Live Kills with Sparkline */}
            <GlassCard className="col-span-6 md:col-span-4 lg:col-span-3 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-600/20 flex items-center justify-center">
                  <Sword size={16} className="text-red-400" />
                </div>
                <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">Team Kills</span>
              </div>
              <div className="relative h-20 mt-2">
                <Sparkline data={killsHistory} color="#ef4444" height={60} />
                <div className="absolute bottom-0 left-0 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{ourTeam.kills}</span>
                  <span className="text-xl text-neutral-500 font-bold">/{enemyTeam.kills}</span>
                </div>
              </div>
            </GlassCard>

            {/* Coaching Actions */}
            <GlassCard className="col-span-12 md:col-span-8 lg:col-span-6 p-5">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 block">Coaching Actions</span>
              <div className="flex flex-wrap gap-2">
                {coachingActions.map((action, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      action.urgent 
                        ? 'bg-brown/20 border border-brown/40 text-brown-light hover:bg-brown/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Team KDA */}
            <GlassCard className="col-span-6 md:col-span-4 lg:col-span-3 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-400" />
                </div>
                <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">Team KDA</span>
              </div>
              <div className="flex items-center justify-center py-4">
                <span className={`text-5xl font-black ${
                  typeof teamKDA === 'string' ? 'text-brown-light' : 
                  parseFloat(teamKDA) >= 3 ? 'text-green-400' : 
                  parseFloat(teamKDA) >= 2 ? 'text-yellow-400' : 'text-red-400'
                }`}>{teamKDA}</span>
              </div>
              <div className="text-center text-xs text-neutral-500 font-semibold">
                {teamKills}K / {teamDeaths}D / {teamAssists}A
              </div>
            </GlassCard>

          </div>
        </div>
      </div>

      {/* Match Analysis Modal */}
      {analysisData && (
        <MatchAnalysisModal
          analysis={analysisData}
          onClose={() => setAnalysisData(null)}
        />
      )}
    </MainLayout>
  );
}
