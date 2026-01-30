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

interface MatchAnalysis {
  winnerPrediction: 'Blue' | 'Red';
  winProbability: number;
  blueWinCondition: string;
  redWinCondition: string;
  keyMatchup: string;
  description: string;
}

interface DeviationAnalysis {
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGH_RISK';
  analysis: string;
  lostAdvantage: string;
  gainedAdvantage: string;
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

// Plain black card
const GlassCard = ({ children, className = "", glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) => (
  <div className={`relative rounded-2xl bg-black border border-white/20 overflow-hidden ${glow ? 'shadow-lg shadow-brown/10' : ''} ${className}`}>
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
  const [finalAnalysis, setFinalAnalysis] = useState<MatchAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [deviationAnalysis, setDeviationAnalysis] = useState<DeviationAnalysis | null>(null);
  const [pendingChampion, setPendingChampion] = useState<Champion | null>(null);
  const [isAnalyzingDeviation, setIsAnalyzingDeviation] = useState(false);

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

  // Trigger AI analysis when phase changes
  useEffect(() => {
    if (!isDraftComplete && champions.length > 0) {
      updateAIRecommendation();
    } else if (isDraftComplete && !finalAnalysis) {
      generateFinalAnalysis();
    }
  }, [currentPhase, isDraftComplete, champions.length]);

  const generateFinalAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/draft/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bluePicks: bluePicks.filter(Boolean),
          redPicks: redPicks.filter(Boolean),
          blueBans: blueBans.filter(Boolean),
          redBans: redBans.filter(Boolean),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFinalAnalysis(data);
        setShowAnalysis(true);
      }
    } catch (error) {
      console.error("Failed to generate final analysis", error);
    } finally {
      setIsAnalyzing(false);
    }
  };



  const analyzeDeviation = async (champion: Champion) => {
    setIsAnalyzingDeviation(true);
    try {
      const response = await fetch('/api/draft/deviation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendedChamp: recommendation.champion,
          selectedChamp: champion.name,
          draftState: {
            currentPhase: currentDraftPhase,
            bluePicks,
            redPicks
          }
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setDeviationAnalysis(data);
      }
    } catch (error) {
      console.error("Deviation analysis failed", error);
      // Fallback: just allow selection if analysis fails
      confirmSelection(champion);
    } finally {
      setIsAnalyzingDeviation(false);
    }
  };

  const confirmSelection = (champion: Champion) => {
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

    // Clear deviation state
    setPendingChampion(null);
    setDeviationAnalysis(null);
    setCurrentPhase(prev => prev + 1);
  };

  const cancelDeviation = () => {
    setPendingChampion(null);
    setDeviationAnalysis(null);
  };

  const handleChampionSelect = useCallback(async (champion: Champion) => {
    if (isDraftComplete || usedChampions.includes(champion.name)) return;

    // Check for Deviation (only pending logic if AI made a recommendation and user picks differently)
    if (
      recommendation && 
      champion.name !== recommendation.champion
    ) {
      // If we are already pending this exact champion, do nothing (wait for user confirmation)
      if (pendingChampion?.name === champion.name) return;

      setPendingChampion(champion);
      analyzeDeviation(champion);
      return;
    }

    // Proceed with selection (either confirmed or no deviation)
    confirmSelection(champion);
  }, [currentPhase, currentDraftPhase, bluePicks, redPicks, blueBans, redBans, isDraftComplete, usedChampions, recommendation, pendingChampion]);

  const updateAIRecommendation = async () => {
    setIsAnalyzing(true);
    setRecommendation(null);
    
    try {
      const availableChamps = champions.filter(c => !usedChampions.includes(c.name)).map(c => c.name);
      
      const response = await fetch('/api/draft/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bluePicks,
          redPicks,
          blueBans,
          redBans,
          currentPhase: currentDraftPhase,
          availableChampions: availableChamps.slice(0, 40) // Send top 40 to save tokens
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const champ = champions.find(c => c.name === data.champion);
        
        setRecommendation({
          champion: data.champion,
          championId: champ?.id || data.champion,
          reason: data.reason,
          confidence: data.confidence,
          synergyScore: data.synergyScore,
          counterScore: data.counterScore,
        });

        // Calculate simplified win prob based on confidence + synergy
        const baseProb = 50 + (data.synergyScore - 50) * 0.2 + (data.counterScore - 50) * 0.2;
        setWinProbability(Math.min(Math.max(baseProb, 30), 70));
      }
    } catch (error) {
      console.error('Failed to fetch draft recommendation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetDraft = () => {
    setBluePicks([null, null, null, null, null]);
    setRedPicks([null, null, null, null, null]);
    setBlueBans([null, null, null, null, null]);
    setRedBans([null, null, null, null, null]);
    setCurrentPhase(0);
    setRecommendation(null);
    setDeviationAnalysis(null);
    setPendingChampion(null);
    setFinalAnalysis(null);
    setShowAnalysis(false);
    setWinProbability(50);
  };

  const getChampionImage = (name: string | null) => {
    if (!name) return null;
    const champ = champions.find(c => c.name === name);
    return champ?.image;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black -m-10 p-10 pt-16">
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
              <GlassCard className="p-6" glow={!!recommendation && !pendingChampion}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${pendingChampion ? 'bg-red-500/20' : 'bg-brown/20'}`}>
                    {pendingChampion ? <AlertTriangle size={16} className="text-red-400" /> : <Zap size={16} className="text-brown-light" />}
                  </div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${pendingChampion ? 'text-red-400' : 'text-neutral-400'}`}>
                    {pendingChampion ? 'Strategic Deviation Warning' : 'AI Strategic Assistant'}
                  </h3>
                </div>

                {pendingChampion ? (
                  // Deviation Analysis UI
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="flex items-start justify-between mb-4">
                        <div>
                           <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Proposed Switch</div>
                           <div className="flex items-center gap-2">
                             <span className="text-neutral-400 line-through text-sm">{recommendation?.champion}</span>
                             <ChevronRight size={14} className="text-white/30" />
                             <span className="text-xl font-bold text-white">{pendingChampion.name}</span>
                           </div>
                        </div>
                        {deviationAnalysis && (
                          <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                            deviationAnalysis.impact === 'POSITIVE' ? 'bg-green-500/20 border-green-500/40 text-green-400' :
                            deviationAnalysis.impact === 'HIGH_RISK' ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                            deviationAnalysis.impact === 'NEGATIVE' ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' :
                            'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          }`}>
                            {deviationAnalysis.impact.replace('_', ' ')}
                          </div>
                        )}
                     </div>

                     {isAnalyzingDeviation ? (
                        <div className="py-8 text-center space-y-3">
                           <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                           <p className="text-xs text-neutral-400 animate-pulse">Analyzing strategic impact...</p>
                        </div>
                     ) : deviationAnalysis ? (
                        <div className="space-y-4">
                           <p className="text-sm text-white italic leading-relaxed">"{deviationAnalysis.analysis}"</p>
                           
                           <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                 <div className="text-[9px] text-red-400 uppercase font-bold mb-1">Lost Advantage</div>
                                 <div className="text-xs text-neutral-300">{deviationAnalysis.lostAdvantage}</div>
                              </div>
                              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                 <div className="text-[9px] text-green-400 uppercase font-bold mb-1">Gained Advantage</div>
                                 <div className="text-xs text-neutral-300">{deviationAnalysis.gainedAdvantage}</div>
                              </div>
                           </div>

                           <div className="flex gap-3 pt-2">
                              <button 
                                onClick={() => confirmSelection(pendingChampion)}
                                className="flex-1 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors text-xs uppercase tracking-wider"
                              >
                                Proceed
                              </button>
                              <button 
                                onClick={cancelDeviation}
                                className="flex-1 py-2.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-xs uppercase tracking-wider border border-white/10"
                              >
                                Cancel
                              </button>
                           </div>
                        </div>
                     ) : null}
                  </div>
                ) : recommendation ? (
                  // Existing Recommendation UI
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

      {/* Final Analysis Modal */}
      {showAnalysis && finalAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <GlassCard className="max-w-3xl w-full p-6 border-brown/30 shadow-2xl shadow-brown/10 relative" glow>
            {/* Close Button */}
            <button 
              onClick={() => setShowAnalysis(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <Users size={20} className="rotate-45" /> 
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brown/20 border border-brown/40 text-brown-light text-[10px] font-bold uppercase tracking-widest mb-3">
                Match Simulation Complete
              </div>
              <h2 className="text-3xl font-black text-white mb-2">PREDICTED WINNER: <span className={finalAnalysis.winnerPrediction === 'Blue' ? 'text-blue-500' : 'text-red-500'}>{finalAnalysis.winnerPrediction.toUpperCase()} TEAM</span></h2>
              <div className="flex justify-center items-center gap-3">
                <span className="text-neutral-400 text-sm">Confidence:</span>
                <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                   <div className={`h-full ${finalAnalysis.winnerPrediction === 'Blue' ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${finalAnalysis.winProbability}%` }} />
                </div>
                <span className="font-bold text-white text-sm">{finalAnalysis.winProbability}%</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-2">Blue Win Condition</h3>
                <p className="text-white text-sm leading-relaxed">{finalAnalysis.blueWinCondition}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <h3 className="text-red-400 font-bold uppercase tracking-wider text-xs mb-2">Red Win Condition</h3>
                <p className="text-white text-sm leading-relaxed">{finalAnalysis.redWinCondition}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold mb-1">Key Matchup</h4>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm">
                  {finalAnalysis.keyMatchup}
                </div>
              </div>
              <div>
                <h4 className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold mb-1">Tactical Summary</h4>
                <p className="text-neutral-300 text-sm leading-relaxed italic border-l-2 border-brown pl-3">
                  "{finalAnalysis.description}"
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={resetDraft}
                className="px-6 py-2.5 rounded-xl bg-brown text-white font-bold hover:bg-brown-light transition-all shadow-lg hover:shadow-brown/20 flex items-center gap-2 text-sm"
              >
                <RotateCcw size={16} />
                Start New Draft
              </button>
            </div>
          </GlassCard>
        </div>
      )}
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
