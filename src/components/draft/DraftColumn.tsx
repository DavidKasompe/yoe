"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftColumnProps {
  side: "blue" | "red";
  picks: string[];
}

export function DraftColumn({ side, picks }: DraftColumnProps) {
  const isBlue = side === "blue";
  
  return (
    <div className="bg-black border border-white/20 rounded-[2.5rem] p-6 min-h-[600px] flex flex-col gap-4 shadow-2xl">
      <div className={cn("flex items-center gap-3 mb-4", !isBlue && "justify-end flex-row-reverse")}>
         {/* Unified Orange Dot for styling, could be removed if purely monochrome desired, but slight indicator is helpful. 
             Actually, reference is Orange only. Let's make it Orange. */}
         <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
             {isBlue ? "Blue Side Picks" : "Red Side Picks"}
         </h2>
      </div>

      <div className="flex-1 flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
             <div 
               key={i}
               className={cn(
                   "h-24 rounded-3xl flex items-center px-6 relative overflow-hidden transition-all duration-300",
                   // Filled State
                   picks[i] 
                     ? "bg-black border border-orange-500 shadow-lg shadow-orange-500/10"
                     : "bg-black/30 border border-white/5 border-dashed group hover:border-orange-500/30 transition-colors"
               )}
             >
                {picks[i] ? (
                    <div className={cn("w-full flex justify-between items-center gap-4", !isBlue && "flex-row-reverse")}>
                        <div className={cn("flex flex-col", !isBlue && "items-end")}>
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-1">
                                {isBlue ? `Pick ${i+1}` : `Counter ${i+1}`}
                            </span>
                            <span className="text-xl font-black text-white tracking-tight uppercase truncate max-w-[120px]">
                                {picks[i]}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-orange-500 font-black text-sm border border-orange-500/20 shadow-inner">
                            {picks[i].charAt(0)}
                        </div>
                    </div>
                ) : (
                    <div className={cn("w-full flex items-center", !isBlue ? "justify-end" : "justify-start")}>
                        <div className="flex items-center gap-2 opacity-10">
                            <Plus size={16} className="text-white" />
                            <span className="text-xl font-black text-white tracking-widest">---</span>
                        </div>
                    </div>
                )}
             </div>
          ))}
      </div>
    </div>
  );
}
