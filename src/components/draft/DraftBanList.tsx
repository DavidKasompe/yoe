"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftBanListProps {
  side: "blue" | "red";
  bans: string[];
}

export function DraftBanList({ side, bans }: DraftBanListProps) {
  const isBlue = side === "blue";

  return (
    <div className={cn(
        "bg-[#1e1e1e] border border-white/5 rounded-[2rem] p-6 min-h-[140px] flex flex-col justify-center shadow-lg",
        !isBlue && "items-end"
    )}>
       <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">
           {isBlue ? "Blue Bans" : "Red Bans"}
       </h3>
       <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
             <div 
               key={i} 
               className="w-12 h-12 rounded-xl bg-[#252525] flex items-center justify-center border border-white/5 data-[active=true]:border-orange-500/50"
               data-active={!!bans[i]}
             >
                 {bans[i] ? (
                     <span className="font-black text-orange-500 text-[10px] uppercase">{bans[i].substring(0, 3)}</span>
                 ) : (
                     <X size={12} className="text-white/10" />
                 )}
             </div>
          ))}
       </div>
    </div>
  );
}
