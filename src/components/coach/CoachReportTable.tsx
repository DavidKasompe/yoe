"use client";

import { FileText, Search, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const MATCHES = [
  { opponent: "Team Gamma", result: "WIN", date: "Today", duration: "32:14", size: 12.4 },
  { opponent: "Team Delta", result: "LOSS", date: "Yesterday", duration: "28:45", size: 15.6 },
  { opponent: "Team Beta", result: "WIN", date: "2 days ago", duration: "35:22", size: 18.8 },
  { opponent: "Team Alpha", result: "WIN", date: "3 days ago", duration: "31:08", size: 22.0 },
];

export function CoachReportTable() {
  return (
    <div className="lg:col-span-3 bg-card border border-border rounded-3xl overflow-hidden shadow-lg shadow-black/20 hover:border-brown/30 transition-all duration-200 group">
      <div className="p-8 border-b border-border flex justify-between items-center bg-background/20 group-hover:bg-background/30 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-xl">
            <FileText size={18} className="text-brown-light" />
          </div>
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest font-sans">Comprehensive Analysis Reports</h3>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Filter reports..." className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-brown/50 w-48 transition-all font-sans" />
          </div>
          <button className="bg-background border border-border p-2 rounded-xl hover:bg-neutral-800 transition-colors duration-200 active:scale-95">
            <Activity size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background/50 text-left sticky top-0 z-10">
              <th className="px-10 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest font-sans">Athlete Name</th>
              <th className="px-10 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest font-sans">Report Type</th>
              <th className="px-10 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest font-sans">Status</th>
              <th className="px-10 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center font-sans">File Size</th>
              <th className="px-10 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right font-sans">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {MATCHES.map((match: any, i: number) => (
              <tr key={i} className="hover:bg-background/40 transition-all duration-200 group/row cursor-pointer">
                <td className="px-10 py-5">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover/row:bg-brown/20 group-hover/row:text-brown-light transition-all duration-200 font-mono">
                       {match.opponent[0]}
                     </div>
                     <div className="font-black text-foreground text-sm tracking-tight group-hover/row:text-brown-light transition-colors duration-200 font-sans">{match.opponent}</div>
                  </div>
                </td>
                <td className="px-10 py-5">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-sans">Tactical Analysis</div>
                </td>
                <td className="px-10 py-5">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition-all duration-200 font-sans",
                    match.result === "WIN" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  )}>
                    {match.result === "WIN" ? "Submitted" : "In Progress"}
                  </span>
                </td>
                <td className="px-10 py-5 text-muted-foreground text-[10px] font-black uppercase tracking-widest text-center font-mono">{match.size} MB</td>
                <td className="px-10 py-5 text-right">
                  <div className="text-foreground font-black tracking-tight text-sm mb-0.5 font-mono">{match.date}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase font-sans">{match.duration} Analysis</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
