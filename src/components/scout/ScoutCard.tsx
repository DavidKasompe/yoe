"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoutCardProps {
  name: string;
  role: string;
  efficiency: number;
  tasks: {
      today: number;
      tomorrow: number;
      reserve: number;
  };
  avatarColor?: string;
}

export function ScoutCard({ name, role, efficiency, tasks, avatarColor = "bg-neutral-600" }: ScoutCardProps) {
  return (
    <div className="bg-[#1E1E1E] p-4 rounded-3xl border border-transparent hover:border-yellow-500/20 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold", avatarColor)}>
                {name.charAt(0)}
            </div>
            <div>
                <h4 className="text-white font-bold text-sm">{name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Zap size={10} className={efficiency > 80 ? "text-yellow-400 fill-yellow-400" : "text-neutral-500"} />
                    <span>{efficiency}% Eff.</span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#252525] rounded-xl p-2">
              <div className="text-[10px] text-neutral-500 uppercase">Today</div>
              <div className="text-white font-bold text-xs">{tasks.today}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-2">
              <div className="text-[10px] text-neutral-500 uppercase">Tom.</div>
              <div className="text-white font-bold text-xs">{tasks.tomorrow}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-2">
              <div className="text-[10px] text-neutral-500 uppercase">Res.</div>
              <div className="text-white font-bold text-xs">{tasks.reserve}</div>
          </div>
      </div>

      <div className="mt-3 h-1 w-full bg-[#252525] rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400" style={{ width: `${efficiency}%` }} />
      </div>
    </div>
  );
}
