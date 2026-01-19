"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Zap, Shield, Target, Plus, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DraftIntelligencePage() {
  const [bluePicks, setBluePicks] = useState<string[]>([]);
  const [redPicks, setRedPicks] = useState<string[]>([]);
  const [blueBans, setBlueBans] = useState<string[]>([]);
  const [redBans, setRedBans] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Available champions list
  const champions = ["Lee Sin", "Orianna", "Jinx", "Thresh", "Renekton", "Azir", "K'Sante", "Kai'Sa", "Vi", "Ahri", "Zeri"];

  const updateDraft = async (type: string, champion: string) => {
    let newState = { blue_picks: bluePicks, red_picks: redPicks, bans: [...blueBans, ...redBans] };
    
    if (type === 'blue_pick') {
      const updated = [...bluePicks, champion].slice(0, 5);
      setBluePicks(updated);
      newState.blue_picks = updated;
    } else if (type === 'red_pick') {
      const updated = [...redPicks, champion].slice(0, 5);
      setRedPicks(updated);
      newState.red_picks = updated;
    } else if (type === 'ban') {
      if (blueBans.length <= redBans.length) {
        const updated = [...blueBans, champion].slice(0, 5);
        setBlueBans(updated);
        newState.bans = [...updated, ...redBans];
      } else {
        const updated = [...redBans, champion].slice(0, 5);
        setRedBans(updated);
        newState.bans = [...blueBans, ...updated];
      }
    }

    setIsUpdating(true);
    try {
      const storedTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
      const authHeader = storedTokens?.accessToken ? { 'Authorization': `Bearer ${storedTokens.accessToken}` } : {};

      const res = await fetch('/api/draft/recommend', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(newState)
      });
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentRecommendation = recommendations[0];

  return (
    <MainLayout>
      <div className="max-w-7xl">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Draft Intelligence</h1>
            <p className="text-neutral-600">Live simulation and AI-powered pick/ban recommendations</p>
          </div>
          <button 
            onClick={() => {
              setBluePicks([]);
              setRedPicks([]);
              setBlueBans([]);
              setRedBans([]);
              setRecommendations([]);
            }}
            className="text-sm font-medium text-brown hover:underline"
          >
            Reset Draft
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Blue Side */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h2 className="text-blue-700 font-bold uppercase tracking-wider text-sm mb-4">Blue Side Picks</h2>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={cn(
                    "h-16 bg-white border rounded-lg flex items-center px-4 justify-between transition-all",
                    bluePicks[i] ? "border-blue-400 shadow-sm" : "border-blue-200"
                  )}>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 text-[10px] font-bold">P{i + 1}</span>
                      <span className="font-bold text-sm">{bluePicks[i] || "---"}</span>
                    </div>
                    {!bluePicks[i] && <Plus size={14} className="text-blue-300" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3">Blue Bans</h3>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-white border border-neutral-200 rounded flex items-center justify-center text-[10px] font-bold">
                    {blueBans[i] ? blueBans[i].charAt(0) : <X size={12} className="text-neutral-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Content: AI & Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Recommendation */}
            <div className="bg-black text-white rounded-lg p-8 shadow-2xl relative overflow-hidden min-h-[200px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={160} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-brown-light">
                  <Zap size={20} className="fill-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Strategic Draft Assistant</span>
                </div>
                
                {currentRecommendation ? (
                  <>
                    <h3 className="text-3xl font-bold mb-2">Optimal Pick: <span className="text-brown-light">{currentRecommendation.champion}</span></h3>
                    <p className="text-sm text-neutral-400 mb-6 italic">"{currentRecommendation.reason}"</p>
                    
                    <div className="grid grid-cols-2 gap-12">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-neutral-400 text-xs uppercase font-bold tracking-tighter">AI Confidence</span>
                          <span className="text-2xl font-bold text-green-400">{(currentRecommendation.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-1000" 
                            style={{ width: `${currentRecommendation.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-neutral-400 text-xs uppercase font-bold tracking-tighter">Draft Synergy</span>
                          <span className="text-2xl font-bold text-blue-400">+{currentRecommendation.synergyScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000" 
                            style={{ width: `${currentRecommendation.synergyScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-neutral-400 italic">Waiting for draft inputs to generate optimal recommendations...</p>
                )}
              </div>
            </div>

            {/* Champion Selector */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-black">Champion Selection</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                  <input type="text" placeholder="Search..." className="pl-7 pr-3 py-1 bg-neutral-50 border border-neutral-200 rounded text-xs focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {champions.map(champ => {
                  const isTaken = bluePicks.includes(champ) || redPicks.includes(champ) || blueBans.includes(champ) || redBans.includes(champ);
                  return (
                    <button
                      key={champ}
                      disabled={isTaken}
                      onClick={() => updateDraft('blue_pick', champ)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-2 rounded transition-all",
                        isTaken ? "opacity-20 grayscale" : "hover:bg-neutral-50"
                      )}
                    >
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500">
                        {champ.charAt(0)}
                      </div>
                      <span className="text-[10px] font-medium truncate w-full">{champ}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-100">
                <button 
                  className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-xs font-bold transition-colors"
                  onClick={() => {
                    const lastChamp = bluePicks[bluePicks.length - 1];
                    if (lastChamp) updateDraft('ban', lastChamp); // Simplified mock
                  }}
                >
                  ADD TO BANS
                </button>
                <button 
                  className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-bold transition-colors"
                  onClick={() => {
                    // Logic to add to red side
                    const champ = champions.find(c => !bluePicks.includes(c) && !redPicks.includes(c) && !blueBans.includes(c) && !redBans.includes(c));
                    if (champ) updateDraft('red_pick', champ);
                  }}
                >
                  ADD TO RED SIDE
                </button>
              </div>
            </div>
          </div>

          {/* Red Side */}
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-lg p-6">
              <h2 className="text-red-700 font-bold uppercase tracking-wider text-sm mb-4">Red Side Picks</h2>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={cn(
                    "h-16 bg-white border rounded-lg flex items-center px-4 justify-between transition-all text-right",
                    redPicks[i] ? "border-red-400 shadow-sm" : "border-red-200"
                  )}>
                    {!redPicks[i] && <Plus size={14} className="text-red-300" />}
                    <div className="flex flex-col">
                      <span className="text-neutral-400 text-[10px] font-bold">P{i + 1}</span>
                      <span className="font-bold text-sm">{redPicks[i] || "---"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3 text-right">Red Bans</h3>
              <div className="flex gap-2 justify-end">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-white border border-neutral-200 rounded flex items-center justify-center text-[10px] font-bold">
                    {redBans[i] ? redBans[i].charAt(0) : <X size={12} className="text-neutral-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
