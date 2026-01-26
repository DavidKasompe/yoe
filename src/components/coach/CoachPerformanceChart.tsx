"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Activity } from "lucide-react";

const DEFAULT_DATA = [
  { week: "Week 1", wins: 4, losses: 2 },
  { week: "Week 2", wins: 3, losses: 1 },
  { week: "Week 3", wins: 5, losses: 2 },
  { week: "Week 4", wins: 6, losses: 1 },
  { week: "Week 5", wins: 4, losses: 3 },
  { week: "Week 6", wins: 5, losses: 2 },
];

interface CoachPerformanceChartProps {
  data?: any[];
}

export function CoachPerformanceChart({ data = DEFAULT_DATA }: CoachPerformanceChartProps) {
  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-lg shadow-black/20 hover:border-brown/30 transition-all duration-200 group">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-xl group-hover:bg-brown/20 transition-colors duration-200">
            <Activity size={18} className="text-brown-light" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground font-sans">Performance Signal</h3>
        </div>
        <div className="flex bg-background border border-border rounded-lg p-1">
          {["Month", "Quarter", "Year"].map((range) => (
            <button key={range} className={`
              px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95
              ${range === "Month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}
            `}>
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '20px' }}
            />
            <Line name="Athlete Performance" type="monotone" dataKey="wins" stroke="#4E342E" strokeWidth={4} dot={{ r: 4, fill: '#4E342E', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            <Line name="Workload" type="monotone" dataKey="losses" stroke="#888" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
