"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Zap, TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Sword, Users, Eye, Crown, RefreshCw } from "lucide-react";

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

// Glassmorphism card wrapper
const GlassCard = ({ children, className = "", glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) => (
  <div className={`relative rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden ${glow ? 'shadow-lg shadow-brown/20' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
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

export default function CoachDashboard() {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
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
    setIsExplaining(true);
    setTimeout(() => {
      if (!liveData?.teams?.[0]) {
        setAiInsight("Unable to analyze - no live data available.");
        setIsExplaining(false);
        return;
      }
      
      const team = liveData.teams[0];
      const enemy = liveData.teams[1];
      const goldDiff = (team.gold - enemy.gold) / 1000;
      const killDiff = team.kills - enemy.kills;
      const objDiff = (team.dragons + team.towers + (team.barons || 0)) - (enemy.dragons + enemy.towers + (enemy.barons || 0));
      
      let insight = `${team.name} `;
      if (goldDiff > 0) {
        insight += `holds a ${goldDiff.toFixed(1)}k gold lead. `;
      } else {
        insight += `trails by ${Math.abs(goldDiff).toFixed(1)}k gold. `;
      }
      
      if (killDiff > 3) {
        insight += `Strong kill advantage (+${killDiff}). `;
      }
      
      if (objDiff > 0) {
        insight += `Objective control is favorable. `;
      }
      
      // Find the carry
      const carry = team.players.reduce((best, p) => 
        (p.stats.kills || 0) > (best?.stats.kills || 0) ? p : best
      , team.players[0]);
      
      if (carry) {
        insight += `${carry.name} is carrying (${carry.stats.kills}/${carry.stats.deaths}/${carry.stats.assists}). `;
      }
      
      insight += `Recommend ${goldDiff > 3 ? 'forcing Baron at next spawn' : 'playing for objectives to extend the lead'}.`;
      
      setAiInsight(insight);
      setIsExplaining(false);
    }, 1500);
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] -m-10 p-8">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ASSISTANT COACH DASHBOARD</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-green-400 font-semibold">LIVE</span>
                </div>
                <span className="text-xs text-neutral-500">
                  {ourTeam.name || 'T1'} vs {enemyTeam.name || 'Gen.G'} • Game {liveData?.gameNumber || 1}
                </span>
                {lastUpdated && (
                  <span className="text-[10px] text-neutral-600">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchLiveGame}
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                title="Refresh"
              >
                <RefreshCw size={16} className="text-neutral-400" />
              </button>
              <button
                onClick={handleExplainMatch}
                disabled={isExplaining}
                className="px-5 py-2.5 bg-gradient-to-r from-brown to-brown-light hover:from-brown-light hover:to-brown text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Zap size={16} className={isExplaining ? 'animate-pulse' : ''} />
                {isExplaining ? 'ANALYZING...' : 'EXPLAIN MATCH'}
              </button>
            </div>
          </div>

          {/* AI Insight */}
          {aiInsight && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brown/20 to-brown-light/10 border border-brown/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-brown-light" />
                <span className="text-xs font-semibold text-brown-light uppercase tracking-wider">AI Strategic Insight</span>
              </div>
              <p className="text-neutral-200 text-sm">{aiInsight}</p>
            </div>
          )}

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Win Probability - Large Square */}
            <GlassCard className="col-span-12 md:col-span-4 lg:col-span-3 p-6" glow>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Win Probability</span>
                <div className={`flex items-center gap-1 ${winProbability > 50 ? 'text-brown-light' : 'text-red-400'} text-xs font-semibold`}>
                  {winProbability > 50 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {winProbability > 50 ? '+' : ''}{(winProbability - 50).toFixed(0)}%
                </div>
              </div>
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <ProgressRing value={winProbability} size={140} strokeWidth={10} color={winProbability > 50 ? "#c9a66b" : "#ef4444"} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{winProbability.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Objective Control */}
            <GlassCard className="col-span-6 md:col-span-4 lg:col-span-3 p-6">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Objective Control</span>
              <div className="flex items-center justify-center py-6">
                <div className="relative">
                  <ProgressRing value={objControl} size={100} strokeWidth={8} color="#d4af71" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{objControl}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs text-neutral-500 mt-2">
                <span>🗼 {ourTeam.towers}</span>
                <span>🐉 {ourTeam.dragons}</span>
                <span>👑 {ourTeam.barons || 0}</span>
              </div>
            </GlassCard>

            {/* Gold Diff with Sparkline */}
            <GlassCard className="col-span-6 md:col-span-4 lg:col-span-6 p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Gold Difference</span>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <div className="w-2 h-0.5 bg-yellow-500"></div>
                  vs {enemyTeam.name || 'Enemy'}
                </div>
              </div>
              <div className="relative h-20">
                <Sparkline data={goldHistory} color="#eab308" height={80} />
                <div className="absolute bottom-0 left-0">
                  <span className={`text-3xl font-bold ${isGoldPositive ? 'text-brown-light' : 'text-red-400'}`}>
                    {isGoldPositive ? '+' : ''}{goldDiff}k
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Team Roster */}
            <GlassCard className="col-span-12 md:col-span-6 lg:col-span-3 p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Team Roster</span>
                <span className="text-[10px] text-neutral-600">KDA</span>
              </div>
              <div className="space-y-2">
                {roster.map((player, i) => {
                  const RoleIcon = getRoleIcon(player.role);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400">
                        <RoleIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-medium truncate block">{player.name.split(' ').pop()}</span>
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">{player.kda}</span>
                      <span className="text-[10px] text-neutral-600">{player.cs} CS</span>
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
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Live Kills</span>
              <div className="relative h-24 mt-2">
                <Sparkline data={killsHistory} color="#c9a66b" height={60} />
                <div className="absolute bottom-0 left-0">
                  <span className="text-4xl font-bold text-white">{ourTeam.kills}</span>
                  <span className="text-lg text-neutral-500 ml-1">/ {enemyTeam.kills}</span>
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
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Team KDA</span>
              <div className="flex items-center justify-center py-6">
                <span className="text-4xl font-bold text-white">{teamKDA}</span>
              </div>
              <div className="text-center text-xs text-neutral-500">
                {teamKills}K / {teamDeaths}D / {teamAssists}A
              </div>
            </GlassCard>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
