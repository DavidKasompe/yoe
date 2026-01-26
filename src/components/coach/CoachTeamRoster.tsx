"use client";

import { Users, MoreHorizontal } from "lucide-react";

interface RosterMember {
  name: string;
  role: string;
  status: 'active' | 'inactive';
}

const DEFAULT_ROSTER: RosterMember[] = [
  { name: "T1 Zeus", role: "Top", status: "active" },
  { name: "T1 Oner", role: "Jungle", status: "active" },
  { name: "T1 Faker", role: "Mid (Captain)", status: "active" },
  { name: "T1 Gumayusi", role: "ADC", status: "active" },
  { name: "T1 Keria", role: "Support", status: "active" },
  { name: "T1 Rekkles", role: "Sub/Support", status: "active" },
  { name: "T1 Roach", role: "Coach", status: "active" },
];

export function CoachTeamRoster() {
  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-[400px] flex flex-col hover:border-brown/30 transition-all duration-200 group">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 font-sans">
          <div className="p-2 bg-background rounded-xl group-hover:bg-brown/20 transition-colors duration-200">
            <Users size={16} className="text-brown-light" />
          </div>
          Team Roster
        </h3>
        <MoreHorizontal size={16} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {DEFAULT_ROSTER.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-background transition-all duration-200 group/item cursor-pointer border border-transparent hover:border-border active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-border flex items-center justify-center text-xs font-black text-muted-foreground group-hover/item:bg-brown/20 group-hover/item:text-brown-light transition-all duration-200 font-mono">
                {p.name.split(' ')[1][0]}
              </div>
              <div>
                <div className="text-sm font-black text-foreground group-hover/item:text-brown-light transition-colors duration-200 font-sans">{p.name}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase font-sans">{p.role}</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
