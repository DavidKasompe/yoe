"use client";

import { BarChart3, ArrowUp } from "lucide-react";

export function CoachEngagementChart() {
  const data = [40, 70, 45, 90, 65, 80, 55];
  
  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-[400px] flex flex-col hover:border-brown/30 transition-all duration-200 group">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 font-sans">
           <div className="p-2 bg-background rounded-xl group-hover:bg-brown/20 transition-colors duration-200">
            <BarChart3 size={16} className="text-brown-light" />
           </div>
           Engagement Metrics
         </h3>
         <ArrowUp size={14} className="text-green-500" />
       </div>
       <div className="mb-6">
         <div className="text-3xl font-black text-foreground tracking-tighter font-mono">88%</div>
         <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">Weekly Avg Success Rate</div>
       </div>
       <div className="flex-1 flex items-end gap-2">
         {data.map((h, i) => (
           <div 
             key={i} 
             className="flex-1 bg-brown-light/20 rounded-t-xl hover:bg-brown-light transition-all duration-200 relative group/bar cursor-pointer"
             style={{ height: `${h}%` }}
           >
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-border text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-200 shadow-xl whitespace-nowrap z-20 scale-90 group-hover/bar:scale-100 font-mono">
               {h}%
             </div>
           </div>
         ))}
       </div>
       <div className="flex justify-between mt-4 px-1">
         {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
           <span key={i} className="text-[9px] font-black text-muted-foreground uppercase font-sans">{day}</span>
         ))}
       </div>
    </div>
  );
}
