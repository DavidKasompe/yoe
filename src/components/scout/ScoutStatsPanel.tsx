"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Calendar } from "lucide-react";

const DATA_FULL_REPORTS = [
  { name: '1', value: 45 },
  { name: '2', value: 30 },
  { name: '3', value: 25 },
  { name: '4', value: 55 },
  { name: '5', value: 35 },
];

const DATA_MATCH_REPORTS = [
  { name: '1', value: 20 },
  { name: '2', value: 40 },
  { name: '3', value: 15 },
  { name: '4', value: 30 },
  { name: '5', value: 50 },
];

const DATA_SCOUT_REPORTS = [
  { name: '1', full: 20, match: 10 },
  { name: '2', full: 30, match: 20 },
  { name: '3', full: 15, match: 25 },
];

export function ScoutStatsPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Report Statistics</h2>
      
      {/* Top Circular Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#1E1E1E] p-6 rounded-3xl">
        <div className="flex flex-col items-center justify-center relative">
           <span className="text-neutral-400 text-xs mb-2">Total Reports</span>
           <span className="text-4xl font-bold text-white">100</span>
        </div>
        
        {/* Helper for Circle */}
        <div className="flex items-center gap-4">
             <div className="relative w-16 h-16">
                 {/* Simulate Circle with Recharts or div border */}
                 <div className="w-16 h-16 rounded-full border-4 border-[#333] border-t-yellow-400 rotate-45" />
             </div>
             <div>
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                     <span className="text-white text-sm font-bold">Full</span>
                 </div>
                 <span className="text-2xl font-bold text-white">55</span>
             </div>
        </div>

        <div className="flex items-center gap-4">
             <div className="relative w-16 h-16">
                 <div className="w-16 h-16 rounded-full border-4 border-[#333] border-t-neutral-500 rotate-12" />
             </div>
             <div>
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-neutral-500 rounded-full" />
                     <span className="text-white text-sm font-bold">Match</span>
                 </div>
                 <span className="text-2xl font-bold text-white">55</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Full Reports Bar Chart */}
          <div className="bg-[#1E1E1E] p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold">Full Reports</h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <Calendar size={12} />
                      <span>Monthly</span>
                  </div>
              </div>
              <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DATA_FULL_REPORTS} layout="vertical" barSize={12}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                          <Bar dataKey="value" fill="#FFF59D" radius={[0, 4, 4, 0]} background={{ fill: '#333', radius: [0, 4, 4, 0] }} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Match Reports Bar Chart */}
          <div className="bg-[#1E1E1E] p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold">Match Reports</h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <Calendar size={12} />
                      <span>Monthly</span>
                  </div>
              </div>
              <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DATA_MATCH_REPORTS} layout="vertical" barSize={12}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                          <Bar dataKey="value" fill="#BDBDBD" radius={[0, 4, 4, 0]} background={{ fill: '#333', radius: [0, 4, 4, 0] }} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Stacked Chart Bottom */}
      <div className="bg-[#1E1E1E] p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold">Scout Reports</h3>
              <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-yellow-200 rounded-sm" />
                       <span className="text-xs text-neutral-400">Full</span>
                  </div>
                  <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-neutral-500 rounded-sm" />
                       <span className="text-xs text-neutral-400">Match</span>
                  </div>
              </div>
          </div>
          <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DATA_SCOUT_REPORTS} layout="vertical" barSize={20}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{fill: '#666', fontSize: 10}} width={30} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                      <Bar dataKey="full" stackId="a" fill="#FFF59D" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="match" stackId="a" fill="#757575" radius={[0, 4, 4, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
}
