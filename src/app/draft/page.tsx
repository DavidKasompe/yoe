"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DraftHeader } from "@/components/draft/DraftHeader";
import { DraftColumn } from "@/components/draft/DraftColumn";
import { DraftBanList } from "@/components/draft/DraftBanList";
import { ChampionPool } from "@/components/draft/ChampionPool";
import { AIStrategicAssistant } from "@/components/draft/AIStrategicAssistant";

export default function DraftIntelligencePage() {
  const [bluePicks, setBluePicks] = useState<string[]>([]);
  const [redPicks, setRedPicks] = useState<string[]>([]);
  const [blueBans, setBlueBans] = useState<string[]>([]);
  const [redBans, setRedBans] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Available champions list
  const champions = ["Lee Sin", "Orianna", "Jinx", "Thresh", "Renekton", "Azir", "K'Sante", "Kai'Sa", "Vi", "Ahri", "Zeri", "Maokai", "Rakan", "Xayah", "Jayce", "Sejuani"];

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
      const accessToken = localStorage.getItem("accessToken") || storedTokens?.accessToken;
      const authHeader = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};

      const res = await fetch('/api/draft/recommend', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(newState)
      });
      const data = await res.json();
      if (data.status === "insufficient_data") {
        setRecommendations([]);
        console.warn("Draft recommendation failed:", data.message);
      } else {
        setRecommendations(data.recommendations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetDraft = () => {
      setBluePicks([]);
      setRedPicks([]);
      setBlueBans([]);
      setRedBans([]);
      setRecommendations([]);
  };

  const selectionState = { 
      blue: bluePicks, 
      red: redPicks, 
      blueBans, 
      redBans 
  };

  return (
    <MainLayout>
      <div className="bg-[#121212] min-h-screen -m-10 p-10 font-sans">
        <DraftHeader onReset={resetDraft} />

        <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Blue Side */}
            <div className="col-span-3 space-y-6">
                <DraftColumn side="blue" picks={bluePicks} />
                <DraftBanList side="blue" bans={blueBans} />
            </div>

            {/* Center Area */}
            <div className="col-span-6 space-y-6">
                <AIStrategicAssistant 
                    recommendation={recommendations[0]} 
                    isUpdating={isUpdating} 
                />
                <ChampionPool 
                    champions={champions}
                    selection={selectionState}
                    onPick={(c) => updateDraft('blue_pick', c)}
                    onConfirmBan={() => {
                        const lastChamp = bluePicks[bluePicks.length - 1];
                        if (lastChamp) updateDraft('ban', lastChamp);
                    }}
                    onCommitRed={(c) => updateDraft('red_pick', c)}
                />
            </div>

            {/* Right Column: Red Side */}
            <div className="col-span-3 space-y-6">
                <DraftColumn side="red" picks={redPicks} />
                <DraftBanList side="red" bans={redBans} />
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
