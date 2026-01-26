"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Zap, RotateCcw, ChevronRight, Shield, Sword, Search, Users, Target, TrendingUp, AlertTriangle } from "lucide-react";

// Types
interface Champion {
  id: string;
  name: string;
  title: string;
  tags: string[];
  image: string;
}

interface DraftPhase {
  type: 'ban' | 'pick';
  team: 'blue' | 'red';
  position: number;
}

// Draft phase order for professional LoL (Fearless Draft style)
const DRAFT_ORDER: DraftPhase[] = [
  // Ban Phase 1
  { type: 'ban', team: 'blue', position: 0 },
  { type: 'ban', team: 'red', position: 0 },
  { type: 'ban', team: 'blue', position: 1 },
  { type: 'ban', team: 'red', position: 1 },
  { type: 'ban', team: 'blue', position: 2 },
  { type: 'ban', team: 'red', position: 2 },
  // Pick Phase 1
  { type: 'pick', team: 'blue', position: 0 },
  { type: 'pick', team: 'red', position: 0 },
  { type: 'pick', team: 'red', position: 1 },
  { type: 'pick', team: 'blue', position: 1 },
  { type: 'pick', team: 'blue', position: 2 },
  { type: 'pick', team: 'red', position: 2 },
  // Ban Phase 2
  { type: 'ban', team: 'red', position: 3 },
  { type: 'ban', team: 'blue', position: 3 },
  { type: 'ban', team: 'red', position: 4 },
  { type: 'ban', team: 'blue', position: 4 },
  // Pick Phase 2
  { type: 'pick', team: 'red', position: 3 },
  { type: 'pick', team: 'blue', position: 3 },
  { type: 'pick', team: 'blue', position: 4 },
  { type: 'pick', team: 'red', position: 4 },
];

const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

// Glassmorphism card
const GlassCard = ({ children, className = "", glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) => (
  <div className={`relative rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden ${glow ? 'shadow-lg shadow-brown/20' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

// Progress ring for win probability
const ProgressRing = ({ value, size = 80, color = "#c9a66b" }: { value: number, size?: number, color?: string }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
    </svg>
  );
};

export default function DraftIntelligencePage() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [bluePicks, setBluePicks] = useState<(string | null)[]>([null, null, null, null, null]);
  const [redPicks, setRedPicks] = useState<(string | null)[]>([null, null, null, null, null]);
  const [blueBans, setBlueBans] = useState<(string | null)[]>([null, null, null, null, null]);
  const [redBans, setRedBans] = useState<(string | null)[]>([null, null, null, null, null]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [winProbability, setWinProbability] = useState(50);

  // Fetch champions on mount
  useEffect(() => {
    async function loadChampions() {
      try {
        // Try to fetch from Data Dragon
        const res = await fetch('https://ddragon.leagueoflegends.com/cdn/14.2.1/data/en_US/champion.json');
        if (res.ok) {
          const data = await res.json();
          const champs: Champion[] = Object.values(data.data).map((c: any) => ({
            id: c.id,
            name: c.name,
            title: c.title,
            tags: c.tags,
            image: `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${c.image.full}`,
          }));
          setChampions(champs.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          throw new Error('Failed to fetch');
        }
      } catch {
        // Fallback champions
        setChampions(getFallbackChampions());
      }
    }
    loadChampions();
  }, []);

  const currentDraftPhase = DRAFT_ORDER[currentPhase];
  const isDraftComplete = currentPhase >= DRAFT_ORDER.length;

  // Get all picked/banned champions
  const usedChampions = [
    ...bluePicks.filter(Boolean),
    ...redPicks.filter(Boolean),
    ...blueBans.filter(Boolean),
    ...redBans.filter(Boolean),
  ] as string[];

  // Filter champions
  const filteredChampions = champions.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || c.tags.some(tag => {
      if (selectedRole === 'ADC') return tag === 'Marksman';
      if (selectedRole === 'Support') return tag === 'Support';
      if (selectedRole === 'Top') return ['Fighter', 'Tank'].includes(tag);
      if (selectedRole === 'Jungle') return ['Fighter', 'Assassin', 'Tank'].includes(tag);
      if (selectedRole === 'Mid') return ['Mage', 'Assassin'].includes(tag);
      return false;
    });
    return matchesSearch && matchesRole && !usedChampions.includes(c.name);
  });

  const handleChampionSelect = useCallback((champion: Champion) => {
    if (isDraftComplete || usedChampions.includes(champion.name)) return;

    const phase = currentDraftPhase;
    
    if (phase.type === 'ban') {
      if (phase.team === 'blue') {
        const newBans = [...blueBans];
        newBans[phase.position] = champion.name;
        setBlueBans(newBans);
      } else {
        const newBans = [...redBans];
        newBans[phase.position] = champion.name;
        setRedBans(newBans);
      }
    } else {
      if (phase.team === 'blue') {
        const newPicks = [...bluePicks];
        newPicks[phase.position] = champion.name;
        setBluePicks(newPicks);
      } else {
        const newPicks = [...redPicks];
        newPicks[phase.position] = champion.name;
        setRedPicks(newPicks);
      }
    }

    setCurrentPhase(prev => prev + 1);
    updateAIRecommendation();
  }, [currentPhase, currentDraftPhase, bluePicks, redPicks, blueBans, redBans, isDraftComplete, usedChampions]);

  const updateAIRecommendation = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const availableChamps = champions.filter(c => !usedChampions.includes(c.name));
      if (availableChamps.length > 0) {
        const recommended = availableChamps[Math.floor(Math.random() * Math.min(5, availableChamps.length))];
        
        const reasons = [
          `Strong counter to enemy composition. High synergy with your team's engage tools.`,
          `Flexible pick that can adapt to multiple lanes. Excellent scaling into late game.`,
          `Dominant laning presence. Provides crucial utility for team fights.`,
          `Meta pick with high win rate in professional play. Covers team's weaknesses.`,
        ];
        
        setRecommendation({
          champion: recommended.name,
          championId: recommended.id,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          confidence: 0.7 + Math.random() * 0.25,
          synergyScore: Math.floor(70 + Math.random() * 25),
          counterScore: Math.floor(60 + Math.random() * 30),
        });

        // Calculate win probability based on draft state
        const bluePickCount = bluePicks.filter(Boolean).length;
        const redPickCount = redPicks.filter(Boolean).length;
        const baseProb = 50 + (bluePickCount - redPickCount) * 3 + Math.random() * 10 - 5;
        setWinProbability(Math.min(Math.max(baseProb, 30), 70));
      }
      setIsAnalyzing(false);
    }, 800);
  };

  const resetDraft = () => {
    setBluePicks([null, null, null, null, null]);
    setRedPicks([null, null, null, null, null]);
    setBlueBans([null, null, null, null, null]);
    setRedBans([null, null, null, null, null]);
    setCurrentPhase(0);
    setRecommendation(null);
    setWinProbability(50);
  };

  const getChampionImage = (name: string | null) => {
    if (!name) return null;
    const champ = champions.find(c => c.name === name);
    return champ?.image;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] -m-10 p-10 pt-16">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AI DRAFT ASSISTANT</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-brown-light" />
                  <span className="text-xs text-brown-light font-semibold">LIVE ANALYSIS</span>
                </div>
                <span className="text-xs text-neutral-500">
                  Phase {currentPhase + 1} of {DRAFT_ORDER.length} • {isDraftComplete ? 'Complete' : `${currentDraftPhase?.team.toUpperCase()} ${currentDraftPhase?.type.toUpperCase()}`}
                </span>
              </div>
            </div>
            <button
              onClick={resetDraft}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 text-neutral-400 text-sm"
            >
              <RotateCcw size={14} />
              Reset Draft
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Blue Side */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              {/* Blue Bans */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Blue Bans</span>
                </div>
                <div className="flex gap-2">
                  {blueBans.map((ban, i) => (
                    <div key={i} className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
                      ban ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/5 border border-white/10 border-dashed'
                    }`}>
                      {ban ? (
                        <img src={getChampionImage(ban)} alt={ban} className="w-full h-full object-cover grayscale opacity-60" />
                      ) : (
                        <span className="text-neutral-600 text-xs">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Blue Picks */}
              <GlassCard className="p-4" glow>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Blue Side Picks</span>
                </div>
                <div className="space-y-2">
                  {ROLES.map((role, i) => (
                    <div key={i} className={`h-16 rounded-xl flex items-center px-4 gap-3 transition-all ${
                      bluePicks[i] 
                        ? 'bg-blue-500/10 border border-blue-500/30' 
                        : currentDraftPhase?.team === 'blue' && currentDraftPhase?.type === 'pick' && currentDraftPhase?.position === i
                          ? 'bg-blue-500/20 border border-blue-500 animate-pulse'
                          : 'bg-white/5 border border-white/10 border-dashed'
                    }`}>
                      {bluePicks[i] ? (
                        <>
                          <img src={getChampionImage(bluePicks[i])} alt={bluePicks[i]!} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <div className="text-[10px] text-blue-400 uppercase tracking-wider">{role}</div>
                            <div className="text-sm font-bold text-white">{bluePicks[i]}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-neutral-600">
                            <Users size={16} />
                          </div>
                          <span className="text-neutral-600 text-sm">{role}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Center - Champion Pool & AI */}
            <div className="col-span-12 lg:col-span-6 space-y-4">
              
              {/* AI Recommendation */}
              <GlassCard className="p-6" glow>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-brown/20 rounded-lg">
                    <Zap size={16} className="text-brown-light" />
                  </div>
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">AI Strategic Assistant</h3>
                </div>

                {recommendation ? (
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div className="text-[10px] text-brown-light uppercase tracking-widest mb-1">Recommended Pick</div>
                      <h2 className="text-2xl font-black text-white mb-2">
                        {recommendation.champion}
                      </h2>
                      <p className="text-neutral-400 text-sm italic mb-4">"{recommendation.reason}"</p>
                      <div className="flex gap-6">
                        <div>
                          <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Confidence</div>
                          <div className="text-xl font-bold text-white">{(recommendation.confidence * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Synergy</div>
                          <div className="text-xl font-bold text-green-400">+{recommendation.synergyScore}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Counter</div>
                          <div className="text-xl font-bold text-orange-400">{recommendation.counterScore}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative">
                        <ProgressRing value={winProbability} size={80} color={winProbability > 50 ? "#c9a66b" : "#ef4444"} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{winProbability.toFixed(0)}%</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-neutral-500 uppercase mt-2">Win Prob</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <h2 className="text-lg font-bold text-white italic mb-2">
                      {isAnalyzing ? "Analyzing composition..." : "Start drafting to receive AI recommendations..."}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-brown-light ${isAnalyzing ? 'animate-pulse' : ''}`} />
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Neural Engine Standby</span>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Champion Pool */}
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Target size={16} className="text-brown-light" />
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Champion Pool</h3>
                  </div>
                  <div className="relative w-48">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full bg-white/5 pl-8 pr-3 py-2 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-brown/50"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      !selectedRole ? 'bg-brown text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    All
                  </button>
                  {ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedRole === role ? 'bg-brown text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Champion Grid */}
                <div className="grid grid-cols-8 gap-2 max-h-[300px] overflow-y-auto">
                  {filteredChampions.slice(0, 48).map(champ => (
                    <button
                      key={champ.id}
                      onClick={() => handleChampionSelect(champ)}
                      disabled={isDraftComplete}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-all group disabled:opacity-30"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 group-hover:border-brown/50 transition-all">
                        <img src={champ.image} alt={champ.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] text-neutral-400 group-hover:text-white truncate w-full text-center">{champ.name.substring(0, 8)}</span>
                    </button>
                  ))}
                </div>

                {/* Current Phase Indicator */}
                {!isDraftComplete && (
                  <div className="mt-4 p-3 rounded-xl bg-brown/10 border border-brown/30 flex items-center gap-3">
                    <AlertTriangle size={14} className="text-brown-light" />
                    <span className="text-xs text-brown-light">
                      <strong>{currentDraftPhase?.team.toUpperCase()}</strong> team: Select a champion to <strong>{currentDraftPhase?.type.toUpperCase()}</strong>
                    </span>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Red Side */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              {/* Red Bans */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3 justify-end">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Red Bans</span>
                  <Shield size={14} className="text-red-400" />
                </div>
                <div className="flex gap-2 justify-end">
                  {redBans.map((ban, i) => (
                    <div key={i} className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
                      ban ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/5 border border-white/10 border-dashed'
                    }`}>
                      {ban ? (
                        <img src={getChampionImage(ban)} alt={ban} className="w-full h-full object-cover grayscale opacity-60" />
                      ) : (
                        <span className="text-neutral-600 text-xs">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Red Picks */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-4 justify-end">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Red Side Picks</span>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div className="space-y-2">
                  {ROLES.map((role, i) => (
                    <div key={i} className={`h-16 rounded-xl flex items-center px-4 gap-3 justify-end transition-all ${
                      redPicks[i] 
                        ? 'bg-red-500/10 border border-red-500/30' 
                        : currentDraftPhase?.team === 'red' && currentDraftPhase?.type === 'pick' && currentDraftPhase?.position === i
                          ? 'bg-red-500/20 border border-red-500 animate-pulse'
                          : 'bg-white/5 border border-white/10 border-dashed'
                    }`}>
                      {redPicks[i] ? (
                        <>
                          <div className="text-right">
                            <div className="text-[10px] text-red-400 uppercase tracking-wider">{role}</div>
                            <div className="text-sm font-bold text-white">{redPicks[i]}</div>
                          </div>
                          <img src={getChampionImage(redPicks[i])} alt={redPicks[i]!} className="w-10 h-10 rounded-lg object-cover" />
                        </>
                      ) : (
                        <>
                          <span className="text-neutral-600 text-sm">{role}</span>
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-neutral-600">
                            <Users size={16} />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Draft Progress */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-brown-light" />
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Draft Progress</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brown to-brown-light transition-all duration-500"
                    style={{ width: `${(currentPhase / DRAFT_ORDER.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-neutral-500">
                  <span>Bans</span>
                  <span>Picks</span>
                  <span>{isDraftComplete ? '✓ Complete' : `${currentPhase}/${DRAFT_ORDER.length}`}</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Fallback champions
function getFallbackChampions(): Champion[] {
  const champs = [
    { id: 'Aatrox', name: 'Aatrox', tags: ['Fighter', 'Tank'] },
    { id: 'Ahri', name: 'Ahri', tags: ['Mage', 'Assassin'] },
    { id: 'Akali', name: 'Akali', tags: ['Assassin'] },
    { id: 'Azir', name: 'Azir', tags: ['Mage'] },
    { id: 'Caitlyn', name: 'Caitlyn', tags: ['Marksman'] },
    { id: 'Darius', name: 'Darius', tags: ['Fighter', 'Tank'] },
    { id: 'Ezreal', name: 'Ezreal', tags: ['Marksman'] },
    { id: 'Fiora', name: 'Fiora', tags: ['Fighter', 'Assassin'] },
    { id: 'Gnar', name: 'Gnar', tags: ['Fighter', 'Tank'] },
    { id: 'Graves', name: 'Graves', tags: ['Marksman'] },
    { id: 'Irelia', name: 'Irelia', tags: ['Fighter', 'Assassin'] },
    { id: 'Jayce', name: 'Jayce', tags: ['Fighter', 'Marksman'] },
    { id: 'Jinx', name: 'Jinx', tags: ['Marksman'] },
    { id: 'Kaisa', name: "Kai'Sa", tags: ['Marksman'] },
    { id: 'KSante', name: "K'Sante", tags: ['Fighter', 'Tank'] },
    { id: 'LeeSin', name: 'Lee Sin', tags: ['Fighter', 'Assassin'] },
    { id: 'Leona', name: 'Leona', tags: ['Tank', 'Support'] },
    { id: 'Lulu', name: 'Lulu', tags: ['Support', 'Mage'] },
    { id: 'Maokai', name: 'Maokai', tags: ['Tank'] },
    { id: 'Nautilus', name: 'Nautilus', tags: ['Tank', 'Support'] },
    { id: 'Orianna', name: 'Orianna', tags: ['Mage'] },
    { id: 'Rakan', name: 'Rakan', tags: ['Support'] },
    { id: 'RekSai', name: "Rek'Sai", tags: ['Fighter'] },
    { id: 'Renekton', name: 'Renekton', tags: ['Fighter', 'Tank'] },
    { id: 'Sejuani', name: 'Sejuani', tags: ['Tank', 'Fighter'] },
    { id: 'Sylas', name: 'Sylas', tags: ['Mage', 'Assassin'] },
    { id: 'Thresh', name: 'Thresh', tags: ['Support', 'Fighter'] },
    { id: 'Viego', name: 'Viego', tags: ['Assassin', 'Fighter'] },
    { id: 'Vi', name: 'Vi', tags: ['Fighter', 'Assassin'] },
    { id: 'Xayah', name: 'Xayah', tags: ['Marksman'] },
    { id: 'Zeri', name: 'Zeri', tags: ['Marksman'] },
    { id: 'Zoe', name: 'Zoe', tags: ['Mage'] },
  ];
  
  return champs.map(c => ({
    ...c,
    title: '',
    image: `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${c.id}.png`,
  }));
}
