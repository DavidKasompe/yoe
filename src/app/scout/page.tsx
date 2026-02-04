"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Search, Target, Users, ChevronRight, Zap, Shield, Sword, Crown, TrendingUp, BarChart3, Trophy, Clock, Eye, Brain, Star, Activity } from "lucide-react";
import { ScoutingReportModal } from "@/components/scout/ScoutingReportModal";

// Types
interface Team {
  id: string;
  name: string;
}

interface Player {
  id: string;
  nickname: string;
  team?: { id: string; name: string };
  roles?: { name: string }[];
}

interface ChampionStat {
  name: string;
  games: number;
  winRate: number;
  image?: string;
}

// Glassmorphism card
// Plain black card (Renamed to ScoutCard to force update)
const ScoutCard = ({ children, className = "", glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) => (
  <div className={`relative rounded-2xl bg-black border border-white/20 overflow-hidden ${glow ? 'shadow-lg shadow-brown/10' : ''} ${className}`}>
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

// Sparkline component
const Sparkline = ({ data, color = "#c9a66b" }: { data: number[], color?: string }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
};

// Radar Chart Component
const RadarChart = ({ stats, centerImage }: { stats: { label: string, value: number }[], centerImage?: string }) => {
  const size = 140;
  const center = size / 2;
  const levels = 5;
  const angleStep = (Math.PI * 2) / stats.length;
  
  const points = stats.map((stat, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (stat.value / 100) * (size / 2 - 20);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const imageSize = 48;
  const imageOffset = imageSize / 2;

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background levels */}
      {[...Array(levels)].map((_, i) => {
        const levelPoints = stats.map((_, j) => {
          const angle = j * angleStep - Math.PI / 2;
          const radius = ((i + 1) / levels) * (size / 2 - 20);
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon
            key={i}
            points={levelPoints}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}
      {/* Data polygon */}
      <polygon points={points} fill="rgba(201,166,107,0.2)" stroke="#c9a66b" strokeWidth="2" />
      {/* Point dots */}
      {stats.map((stat, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const radius = (stat.value / 100) * (size / 2 - 20);
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return <circle key={i} cx={x} cy={y} r="3" fill="#c9a66b" />;
      })}
      
      {/* Center image using foreignObject */}
      {centerImage && (
        <foreignObject 
          x={center - imageOffset} 
          y={center - imageOffset} 
          width={imageSize} 
          height={imageSize}
        >
          <div 
            className="w-full h-full rounded-full overflow-hidden border-3 border-brown-light shadow-xl"
            style={{ 
              backgroundColor: '#0a0a0f',
              boxShadow: '0 0 20px rgba(201,166,107,0.3)'
            }}
          >
            <img 
              src={centerImage} 
              alt="Performance" 
              className="w-full h-full object-cover opacity-80"
              style={{ display: 'block' }}
            />
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default function ScoutingPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Generate AI-powered scouting report
  const generateReport = async () => {
    if (!selectedTeam) {
      alert("Please select a team first");
      return;
    }

    setIsGeneratingReport(true);

    try {

      const teamData = teams.find(t => t.id === selectedTeam);
      if (!teamData) {
        alert("Team not found");
        setIsGeneratingReport(false);
        return;
      }

      // Use originalName for local teams, otherwise use name
      const teamName = (teamData as any).originalName || teamData.name;

      const response = await fetch('/api/scout/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }

      const { report } = await response.json();
      
      // Store report data to display in modal
      setReportData(report);
      console.log("Generated Report:", report);
      
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };


  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsRes, playersRes, localTeamsRes] = await Promise.all([
          fetch('/api/history?type=lol-teams&first=30'),
          fetch('/api/history?type=lol-players&first=100'),
          fetch('/api/teams/local'),
        ]);
        
        const teamsData = await teamsRes.json();
        const playersData = await playersRes.json();
        const localTeamsData = await localTeamsRes.json();
        
        // Merge GRID teams and local teams, removing duplicates
        const gridTeams = teamsData.data || [];
        const localTeams = localTeamsData.data || [];
        
        // Add local teams with a marker
        const localTeamsWithMarker = localTeams.map((team: any) => ({
          ...team,
          name: `${team.name} (Local DB)`,
          originalName: team.name, // Keep original for API calls
        }));
        
        const allTeams = [...gridTeams, ...localTeamsWithMarker];
        
        setTeams(allTeams);
        setPlayers(playersData.data || []);
      } catch (e) {
        console.error("Failed to fetch scouting data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      const teamPlayers = players.filter(p => p.team?.id === selectedTeam);
      setSelectedTeamPlayers(teamPlayers);
    } else {
      setSelectedTeamPlayers([]);
    }
  }, [selectedTeam, players]);

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeamName = teams.find(t => t.id === selectedTeam)?.name;

  // Mock data for visualizations
  const topChampions: ChampionStat[] = [
    { name: "Lee Sin", games: 15, winRate: 73, image: "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/LeeSin.png" },
    { name: "Azir", games: 12, winRate: 67, image: "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/Azir.png" },
    { name: "Jinx", games: 11, winRate: 82, image: "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/Jinx.png" },
    { name: "Thresh", games: 10, winRate: 70, image: "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/Thresh.png" },
    { name: "K'Sante", games: 9, winRate: 56, image: "https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/KSante.png" },
  ];

  const matchHistory = [
    { opponent: "Mad Lions", result: "W", duration: "28:34", drakes: 3, barons: 1 },
    { opponent: "G2 Esports", result: "L", duration: "35:21", drakes: 2, barons: 0 },
    { opponent: "Fnatic", result: "W", duration: "31:45", drakes: 4, barons: 1 },
    { opponent: "Team Vitality", result: "W", duration: "26:12", drakes: 3, barons: 1 },
    { opponent: "SK Gaming", result: "L", duration: "42:18", drakes: 1, barons: 1 },
  ];

  const performanceStats = [
    { label: "Laning", value: 78 },
    { label: "Teamfight", value: 85 },
    { label: "Objectives", value: 72 },
    { label: "Vision", value: 68 },
    { label: "Mechanics", value: 82 },
  ];

  const kdaTrend = [2.3, 2.8, 3.1, 2.5, 3.4, 2.9, 3.6];
  const visionTrend = [48, 52, 45, 58, 51, 62, 55];

  return (
    <MainLayout className="bg-black">
      <div className="min-h-screen bg-black -m-10 p-10 pt-16">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SCOUTING INTELLIGENCE</h1>
              <div className="flex items-center gap-3 mt-1">
                {selectedTeam && (
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <ChevronRight size={14} className="text-brown-light rotate-180" />
                    <span className="text-xs text-brown-light font-semibold">Back to Teams</span>
                  </button>
                )}
                <div className="flex items-center gap-1.5">
                  <Target size={12} className="text-brown-light" />
                  <span className="text-xs text-brown-light font-semibold">OPPONENT ANALYSIS</span>
                </div>
                <span className="text-xs text-neutral-500">
                  {teams.length} Teams • {players.length} Players Tracked
                </span>
              </div>
            </div>
            <button 
              onClick={generateReport}
              disabled={!selectedTeam || isGeneratingReport}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brown to-brown-light text-white text-sm font-bold hover:shadow-lg hover:shadow-brown/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={16} className={isGeneratingReport ? 'animate-pulse' : ''} />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>

          {/* Main Grid - Bento Layout */}
          <div className="grid grid-cols-12 gap-4">

            {/* Team Selection - Left Column - Hide when team selected */}
            {!selectedTeam && (
              <div className="col-span-12 lg:col-span-4 space-y-4">
                <ScoutCard className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={14} className="text-brown-light" />
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Team Selection</span>
                  </div>
                  <div className="relative mb-3">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search teams..."
                      className="w-full bg-white/5 pl-8 pr-3 py-2 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-brown/50"
                    />
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[400px]">
                    {isLoading ? (
                      <div className="text-center py-6 text-neutral-500 text-sm">Loading...</div>
                    ) : (
                      filteredTeams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeam(team.id)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-white/5 border border-transparent"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-white/10 text-brown-light">
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{team.name}</div>
                            <div className="text-[10px] text-neutral-500">LoL Esports</div>
                          </div>
                          <ChevronRight size={14} className="text-neutral-600" />
                        </button>
                      ))
                    )}
                  </div>
                </ScoutCard>
              </div>
            )}

            {/* Main Content Area - Full width when team selected */}
            <div className={`col-span-12 transition-all duration-300 ${selectedTeam ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
              {selectedTeam ? (
                <div className="grid grid-cols-12 gap-4">
                  
                  {/* Team Header - Full Width */}
                  <div className="col-span-12">
                    <ScoutCard className="p-6" glow>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brown to-brown-light flex items-center justify-center text-2xl font-black text-white shadow-lg">
                          {selectedTeamName?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-white">{selectedTeamName}</h2>
                          <p className="text-neutral-400 text-sm">Advanced Scouting Intelligence • {selectedTeamPlayers.length} Players</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="text-center">
                            <div className="text-2xl font-black text-green-400">67%</div>
                            <div className="text-[10px] text-neutral-500 uppercase">Win Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-black text-white">28:45</div>
                            <div className="text-[10px] text-neutral-500 uppercase">Avg Time</div>
                          </div>
                        </div>
                      </div>
                    </ScoutCard>
                  </div>

                  {/* AI Analysis - Wide */}
                  <div className="col-span-12 lg:col-span-8">
                    <ScoutCard className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain size={14} className="text-brown-light" />
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">AI Strategic Analysis</span>
                      </div>
                      <div className="bg-brown/10 border-l-4 border-brown rounded-lg p-4">
                        <p className="text-neutral-300 text-sm leading-relaxed">
                          {selectedTeamName} demonstrates a <span className="text-brown-light font-semibold">high-tempo early game</span> strategy with 
                          consistent jungle priority on Drake spawns. Their mid-laner shows <span className="text-brown-light font-semibold">73% roam rate</span> post-level 6.
                          Recommended counter: Deep vision control at 5:00 and 10:00 marks. Priority ban their comfort picks in bot lane.
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase mb-1">Playstyle</div>
                          <div className="text-sm font-bold text-white">Aggressive Early</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase mb-1">Power Spike</div>
                          <div className="text-sm font-bold text-brown-light">15-20 min</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase mb-1">Key Objective</div>
                          <div className="text-sm font-bold text-purple-400">Dragon Soul</div>
                        </div>
                      </div>
                    </ScoutCard>
                  </div>

                  {/* Quick Stats */}
                  <div className="col-span-12 lg:col-span-4 space-y-4">
                    <ScoutCard className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity size={14} className="text-brown-light" />
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Performance Trend</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-neutral-400">KDA Trend</span>
                          <div className="flex items-center gap-2">
                            <Sparkline data={kdaTrend} color="#c9a66b" />
                            <span className="text-sm font-bold text-white">3.6</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-neutral-400">Vision Score</span>
                          <div className="flex items-center gap-2">
                            <Sparkline data={visionTrend} color="#60a5fa" />
                            <span className="text-sm font-bold text-white">55</span>
                          </div>
                        </div>
                      </div>
                    </ScoutCard>
                  </div>

                  {/* Champion Pool */}
                  <div className="col-span-12 lg:col-span-6">
                    <ScoutCard className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Star size={14} className="text-brown-light" />
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Top Champion Pool</span>
                      </div>
                      <div className="space-y-2">
                        {topChampions.map((champ, i) => (
                          <div key={champ.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                            <div className="text-xs font-bold text-neutral-500 w-4">#{i + 1}</div>
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-brown/30">
                              {champ.image ? (
                                <img src={champ.image} alt={champ.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-brown/20 flex items-center justify-center text-xs font-bold text-brown-light">
                                  {champ.name.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-white">{champ.name}</div>
                              <div className="text-[10px] text-neutral-500">{champ.games} games</div>
                            </div>
                            <div className={`text-sm font-bold ${champ.winRate >= 70 ? 'text-green-400' : champ.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {champ.winRate}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScoutCard>
                  </div>

                  {/* Performance Radar */}
                  <div className="col-span-12 lg:col-span-6">
                    <ScoutCard className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={14} className="text-brown-light" />
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Performance Profile</span>
                      </div>
                      <RadarChart stats={performanceStats} centerImage="/radar-bg.jpg" />
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {performanceStats.slice(0, 4).map(stat => (
                          <div key={stat.label} className="flex justify-between text-[10px]">
                            <span className="text-neutral-500">{stat.label}</span>
                            <span className="text-white font-bold">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </ScoutCard>
                  </div>

                  {/* Match History */}
                  <div className="col-span-12 lg:col-span-7">
                    <ScoutCard className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock size={14} className="text-brown-light" />
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Recent Matches</span>
                      </div>
                      <div className="space-y-2">
                        {matchHistory.map((match, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black ${
                              match.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {match.result}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-white">{match.opponent}</div>
                              <div className="text-[10px] text-neutral-500">{match.duration}</div>
                            </div>
                            <div className="flex gap-3 text-[10px]">
                              <div className="flex items-center gap-1">
                                <span className="text-purple-400">🐉</span>
                                <span className="text-white font-bold">{match.drakes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-brown-light">👑</span>
                                <span className="text-white font-bold">{match.barons}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScoutCard>
                  </div>

                  {/* Recommended Bans */}
                  <div className="col-span-12 lg:col-span-5">
                    <ScoutCard className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield size={14} className="text-red-400" />
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Priority Bans</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'Lee Sin', id: 'LeeSin' },
                          { name: 'Azir', id: 'Azir' },
                          { name: 'Thresh', id: 'Thresh' },
                          { name: "K'Sante", id: 'KSante' },
                          { name: 'Viego', id: 'Viego' }
                        ].map((champ, i) => (
                          <div key={champ.name} className={`flex items-center gap-2 rounded-lg p-2 ${
                            i < 3 ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/5'
                          }`}>
                            <div className={`text-xs font-bold ${i < 3 ? 'text-red-400' : 'text-neutral-500'}`}>
                              #{i + 1}
                            </div>
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                              <img 
                                src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${champ.id}.png`} 
                                alt={champ.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-white">{champ.name}</div>
                              <div className="text-[10px] text-neutral-500">{i < 3 ? 'Critical' : 'Consider'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScoutCard>
                  </div>

                  {/* Player Roster */}
                  {selectedTeamPlayers.length > 0 && (
                    <div className="col-span-12">
                      <ScoutCard className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Users size={14} className="text-brown-light" />
                          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Team Roster</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {selectedTeamPlayers.map((player) => (
                            <div key={player.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brown/30 to-brown-light/30 flex items-center justify-center text-brown-light font-bold text-sm mb-2 mx-auto">
                                {player.nickname.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-semibold text-white truncate">{player.nickname}</div>
                                <div className="text-[10px] text-neutral-500">
                                  {player.roles?.length ? player.roles[0].name : 'Player'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScoutCard>
                    </div>
                  )}
                </div>
              ) : (
                <ScoutCard className="flex items-center justify-center min-h-[calc(100vh-220px)]">
                  <div className="max-w-2xl mx-auto px-8 py-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brown/20 to-brown-light/20 flex items-center justify-center mb-6 mx-auto relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-brown/10 to-transparent animate-pulse"></div>
                      <Target size={40} className="text-brown-light relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Select a Team to Scout</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
                      Choose a team from the list to generate comprehensive scouting intelligence with AI-powered insights,
                      champion pool analysis, and strategic recommendations.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <div className="px-4 py-2 rounded-lg bg-brown/10 text-brown-light border border-brown/30 text-xs font-medium">
                        <Brain size={14} className="inline mr-2" />
                        AI Analysis
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-brown/10 text-brown-light border border-brown/30 text-xs font-medium">
                        <Star size={14} className="inline mr-2" />
                        Champion Pool
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-brown/10 text-brown-light border border-brown/30 text-xs font-medium">
                        <Shield size={14} className="inline mr-2" />
                        Priority Bans
                      </div>
                    </div>
                    <div className="mt-12 w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-brown/30 to-brown-light/30 flex items-center justify-center opacity-40">
                      <Eye size={56} className="text-brown-light" />
                    </div>
                  </div>
                </ScoutCard>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scouting Report Modal */}
      {reportData && (
        <ScoutingReportModal
          report={reportData}
          onClose={() => setReportData(null)}
        />
      )}
    </MainLayout>
  );
}
