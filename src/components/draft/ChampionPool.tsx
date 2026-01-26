"use client";

import { Target, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChampionPoolProps {
  champions: string[];
  selection: { blue: string[]; red: string[]; blueBans: string[]; redBans: string[] };
  onPick: (champ: string) => void;
  onConfirmBan: () => void;
  onCommitRed: (champ: string) => void;
}

export function ChampionPool({ champions, selection, onPick, onConfirmBan, onCommitRed }: ChampionPoolProps) {
  return (
    <div className="bg-[#1e1e1e] border border-white/5 rounded-[2.5rem] p-10 min-h-[500px] flex flex-col shadow-2xl">
       {/* Header */}
       <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-3">
               <div className="p-2 bg-orange-500/10 rounded-lg">
                   <Target size={16} className="text-orange-500" />
               </div>
               <h3 className="font-black text-white uppercase text-[10px] tracking-[0.2em]">Pool Availability</h3>
           </div>
           
           <div className="relative w-64">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
               <input 
                 type="text" 
                 placeholder="Search champions..." 
                 className="w-full bg-[#252525] px-10 py-3 rounded-xl text-xs font-bold text-white border-transparent focus:border-orange-500/50 outline-none transition-colors placeholder:text-neutral-600"
               />
           </div>
       </div>

       {/* Grid */}
       <div className="flex-1 grid grid-cols-6 gap-4 content-start">
           {champions.map(champ => {
               const isTaken = [...selection.blue, ...selection.red, ...selection.blueBans, ...selection.redBans].includes(champ);
               return (
                   <button 
                     key={champ}
                     disabled={isTaken}
                     onClick={() => onPick(champ)}
                     className={cn(
                         "flex flex-col items-center gap-2 group transition-all",
                         isTaken ? "opacity-20 grayscale cursor-not-allowed" : "hover:-translate-y-1"
                     )}
                   >
                       <div className="w-14 h-14 rounded-2xl bg-[#252525] flex items-center justify-center font-black text-neutral-500 text-lg group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-lg shadow-black/20">
                           {champ.charAt(0)}
                       </div>
                       <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider group-hover:text-white">{champ.substring(0, 6)}</span>
                   </button>
               )
           })}
       </div>

       {/* Action Buttons */}
       <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
           <button 
             onClick={onConfirmBan}
             className="flex-1 bg-[#252525] text-white hover:bg-orange-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
           >
               Confirm Ban
           </button>
           <button 
             onClick={() => {
                 const available = champions.find(c => ![...selection.blue, ...selection.red, ...selection.blueBans, ...selection.redBans].includes(c));
                 if(available) onCommitRed(available);
             }}
             className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:to-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-900/20 active:scale-95"
           >
               Commit to Red Side
           </button>
       </div>
    </div>
  );
}
