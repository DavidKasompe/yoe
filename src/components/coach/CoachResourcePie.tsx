"use client";

import { 
  PieChart, 
  Pie, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Layout, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const DATA = [
  { name: 'Training Data', value: 45, fill: '#4E342E' },
  { name: 'Video Uploads', value: 30, fill: '#3B2F2F' },
  { name: 'Remaining', value: 25, fill: '#1a1a1a' },
];

export function CoachResourcePie() {
  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm hover:border-brown/30 transition-all duration-200 group">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 font-sans">
          <div className="p-2 bg-background rounded-xl group-hover:bg-brown/20 transition-colors duration-200">
            <Layout size={16} className="text-brown-light" />
          </div>
          Resource Usage
        </h3>
        <MoreHorizontal size={16} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
      </div>
      <div className="h-48 relative flex items-center justify-center mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {/* Cells already have fill in data */}
            </Pie>
            <Tooltip 
               contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center">
           <span className="text-2xl font-black text-foreground tracking-tighter font-mono">75%</span>
           <span className="text-[9px] text-muted-foreground uppercase font-black font-sans">Capacity</span>
        </div>
      </div>
      <div className="space-y-3">
        {DATA.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-background/30 border border-transparent hover:border-border transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", `bg-[${item.fill}]`)} style={{ backgroundColor: item.fill }} />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-sans">{item.name}</span>
            </div>
            <span className="text-[10px] font-black text-foreground font-mono">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
