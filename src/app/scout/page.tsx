"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Search, Target, Users, ChevronRight, Zap, Shield, Sword, Crown, TrendingUp, BarChart3 } from "lucide-react";

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

export default function ScoutingPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsRes, playersRes] = await Promise.all([
          fetch('/api/history?type=lol-teams&first=30'),
          fetch('/api/history?type=lol-players&first=100'),
        ]);
        
        const teamsData = await teamsRes.json();
        const playersData = await playersRes.json();
        
        setTeams(teamsData.data || []);
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

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0d0d0d] min-h-screen -m-10 p-10 pt-16 text-white font-sans">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <Target size={24} className="text-orange-500" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Scouting Dashboard</h1>
              </div>
              <p className="text-neutral-500 text-sm ml-[52px]">Automated opponent analysis powered by GRID data</p>
            </div>
            <button className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2">
              <Zap size={16} /> Generate Full Report
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column - Team Selection */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-white/5">
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search teams..." 
                      className="w-full bg-[#252525] text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-neutral-600 transition-all"
                    />
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  </div>
                </div>
                
                {/* Team List */}
                <div className="max-h-[500px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-pulse text-neutral-500 text-sm">Loading teams...</div>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredTeams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeam(team.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${
                            selectedTeam === team.id 
                              ? 'bg-orange-500/20 border border-orange-500/40' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            selectedTeam === team.id ? 'bg-orange-500 text-white' : 'bg-[#252525] text-orange-500'
                          }`}>
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm truncate">{team.name}</div>
                            <div className="text-xs text-neutral-500">League of Legends</div>
                          </div>
                          <ChevronRight size={16} className={selectedTeam === team.id ? 'text-orange-500' : 'text-neutral-600'} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - Scouting Report */}
            <div className="lg:col-span-6 space-y-4">
              {selectedTeam ? (
                <>
                  {/* Team Header Card */}
                  <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-orange-500/30">
                        {selectedTeamName?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedTeamName}</h2>
                        <p className="text-neutral-500 text-sm">Scouting Report • {selectedTeamPlayers.length} Players Tracked</p>
                      </div>
                    </div>

                    {/* Key Findings */}
                    <div className="bg-[#252525] rounded-xl p-4 border-l-4 border-orange-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} className="text-orange-500" />
                        <h3 className="text-orange-500 text-xs font-bold uppercase tracking-wider">AI Analysis</h3>
                      </div>
                      <p className="text-neutral-300 text-sm leading-relaxed">
                        {selectedTeamName} demonstrates a preference for <span className="text-orange-400 font-semibold">early-game aggression</span> with 
                        heavy emphasis on dragon control. Their mid-laner tends to roam post-level 6 with 73% consistency. 
                        Consider counter-strategies focusing on vision control and jungle tracking.
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-neutral-500 text-xs uppercase tracking-wider">Win Rate</span>
                      </div>
                      <div className="text-2xl font-black text-green-500">67%</div>
                    </div>
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={14} className="text-blue-500" />
                        <span className="text-neutral-500 text-xs uppercase tracking-wider">Avg Time</span>
                      </div>
                      <div className="text-2xl font-black text-white">28:45</div>
                    </div>
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Sword size={14} className="text-orange-500" />
                        <span className="text-neutral-500 text-xs uppercase tracking-wider">First Blood</span>
                      </div>
                      <div className="text-2xl font-black text-orange-500">58%</div>
                    </div>
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown size={14} className="text-purple-500" />
                        <span className="text-neutral-500 text-xs uppercase tracking-wider">Dragon</span>
                      </div>
                      <div className="text-2xl font-black text-purple-500">High</div>
                    </div>
                  </div>

                  {/* Recommended Bans */}
                  <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield size={16} className="text-red-500" />
                      Recommended Bans
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Lee Sin', 'Azir', 'Thresh', 'K\'Sante', 'Viego'].map((champ, i) => (
                        <div 
                          key={champ} 
                          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
                            i < 3 
                              ? 'bg-red-500/20 border border-red-500/40 text-red-400' 
                              : 'bg-[#252525] border border-white/10 text-neutral-400'
                          }`}
                        >
                          {i < 3 && <span className="text-xs opacity-60">#{i+1}</span>}
                          {champ}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-[#252525] flex items-center justify-center mb-4">
                    <Target size={40} className="text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Select an Opponent</h3>
                  <p className="text-neutral-500 text-sm text-center max-w-sm">
                    Choose a team from the list to generate an AI-powered scouting report with strategic insights and recommended bans.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Team Roster */}
            <div className="lg:col-span-3 space-y-4">
              {selectedTeam && selectedTeamPlayers.length > 0 ? (
                <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h2 className="font-bold flex items-center gap-2">
                      <Users size={16} className="text-orange-500" />
                      Team Roster
                    </h2>
                  </div>
                  <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                    {selectedTeamPlayers.map((player) => (
                      <div key={player.id} className="bg-[#252525] hover:bg-[#2a2a2a] rounded-xl p-3 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center text-orange-500 font-bold text-sm">
                            {player.nickname.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm truncate">{player.nickname}</div>
                            <div className="text-xs text-neutral-500">
                              {player.roles?.length ? player.roles.map(r => r.name).join(', ') : 'Player'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedTeam ? (
                <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
                  <div className="text-center text-neutral-500 text-sm">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    No player data available
                  </div>
                </div>
              ) : null}

              {/* Quick Stats Panel */}
              <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
                <h3 className="font-bold text-sm mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-sm">Teams Loaded</span>
                    <span className="font-bold text-orange-500">{teams.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-sm">Players Tracked</span>
                    <span className="font-bold text-orange-500">{players.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-sm">Data Source</span>
                    <span className="text-xs font-bold text-green-500 bg-green-500/20 px-2 py-0.5 rounded">GRID API</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
