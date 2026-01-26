"use client";

import { CheckSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { t: "Review athlete feedback", c: true },
  { t: "Approve training plan", c: false },
  { t: "Schedule sessions", c: true },
  { t: "Update recovery protocols", c: false },
  { t: "Check tournament brackets", c: false },
];

export function CoachActionList() {
  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-[400px] flex flex-col hover:border-brown/30 transition-all duration-200 group">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 font-sans">
          <div className="p-2 bg-background rounded-xl group-hover:bg-brown/20 transition-colors duration-200">
            <CheckSquare size={16} className="text-brown-light" />
          </div>
          Coaching Actions
        </h3>
        <Plus size={16} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200" />
      </div>
      <div className="flex-1 space-y-4">
        {ACTIONS.map((task, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border group/item hover:border-brown/30 transition-all duration-200 cursor-pointer active:scale-[0.98]">
            <div className={cn(
              "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
              task.c ? "bg-brown border-brown shadow-[0_0_10px_rgba(59,47,47,0.4)]" : "bg-transparent border-neutral-800 group-hover/item:border-neutral-600"
            )}>
              {task.c && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
            </div>
            <span className={cn(
              "text-xs font-black tracking-tight transition-all duration-200 font-sans",
              task.c ? "text-muted-foreground line-through opacity-50" : "text-foreground"
            )}>{task.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
