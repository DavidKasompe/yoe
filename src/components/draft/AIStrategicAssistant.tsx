"use client";

import { Zap } from "lucide-react";

interface AIStrategicAssistantProps {
  recommendation: any;
  isUpdating: boolean;
}

export function AIStrategicAssistant({ recommendation, isUpdating }: AIStrategicAssistantProps) {
  return (
    <div className="bg-[#1e1e1e] rounded-[2.5rem] p-10 min-h-[300px] relative overflow-hidden group border border-white/5 shadow-2xl">
        <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={200} />
        </div>
        
        <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Zap size={14} className="text-orange-500 fill-orange-500" />
                </div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    AI Strategic Assistant
                </h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {recommendation ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-2 text-orange-500 font-bold text-xs uppercase tracking-widest">Recommendation</div>
                        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">
                            Pick <span className="text-orange-500">{recommendation.champion}</span>
                        </h2>
                        <p className="text-neutral-400 italic font-medium max-w-lg mb-8">
                            "{recommendation.reason}"
                        </p>
                        <div className="flex gap-8">
                            <div>
                                <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Confidence</div>
                                <div className="text-2xl font-black text-white">{(recommendation.confidence * 100).toFixed(0)}%</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Synergy</div>
                                <div className="text-2xl font-black text-orange-400">+{recommendation.synergyScore}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md">
                        <h2 className="text-2xl font-black text-white italic tracking-tight mb-2">
                            {isUpdating ? "Calculating optimal trajectory..." : "Awaiting initial picks to initiate strategic projection..."}
                        </h2>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                                Neural Engine Standby
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
