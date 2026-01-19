"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const KPI_DATA = [
  {
    label: "Win Rate",
    value: "58.3%",
    change: "+2.1%",
    isPositive: true,
    icon: TrendingUp,
  },
  {
    label: "Objective Control",
    value: "72%",
    change: "+5.2%",
    isPositive: true,
    icon: TrendingUp,
  },
  {
    label: "Deaths Per Game",
    value: "3.2",
    change: "-0.8",
    isPositive: true,
    icon: ArrowDown,
  },
  {
    label: "Gold Advantage",
    value: "+2.4k",
    change: "+0.5k",
    isPositive: true,
    icon: TrendingUp,
  },
];

const MATCH_HISTORY = [
  { week: "Week 1", wins: 4, losses: 2 },
  { week: "Week 2", wins: 3, losses: 1 },
  { week: "Week 3", wins: 5, losses: 2 },
  { week: "Week 4", wins: 6, losses: 1 },
  { week: "Week 5", wins: 4, losses: 3 },
  { week: "Week 6", wins: 5, losses: 2 },
];

const ROLE_DISTRIBUTION = [
  { name: "Top", value: 18, fill: "#3d3d3d" },
  { name: "Jungle", value: 22, fill: "#666666" },
  { name: "Mid", value: 20, fill: "#999999" },
  { name: "ADC", value: 19, fill: "#3d4040" },
  { name: "Support", value: 21, fill: "#737373" },
];

const RECENT_MATCHES = [
  {
    opponent: "Team Gamma",
    result: "WIN",
    date: "Today",
    duration: "32:14",
    kills: 12,
    deaths: 4,
  },
  {
    opponent: "Team Delta",
    result: "LOSS",
    date: "Yesterday",
    duration: "28:45",
    kills: 8,
    deaths: 6,
  },
  {
    opponent: "Team Beta",
    result: "WIN",
    date: "2 days ago",
    duration: "35:22",
    kills: 14,
    deaths: 3,
  },
  {
    opponent: "Team Alpha",
    result: "WIN",
    date: "3 days ago",
    duration: "31:08",
    kills: 11,
    deaths: 5,
  },
];

export default function CoachDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const response = await fetch('/api/coach/team/T1/overview');
        const data = await response.json();
        setKpis(data);
      } catch (error) {
        console.error('Failed to fetch KPIs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchKPIs();
  }, []);

  const kpiDisplayData = [
    {
      label: "Win Rate",
      value: (kpis?.win_rate || "0") + "%",
      change: kpis?.trend_deltas?.win_rate || "+0.0%",
      isPositive: !(kpis?.trend_deltas?.win_rate?.startsWith('-')),
      icon: TrendingUp,
    },
    {
      label: "Objective Control",
      value: (kpis?.objective_control || "0") + "%",
      change: kpis?.trend_deltas?.objective_control || "+0.0%",
      isPositive: !(kpis?.trend_deltas?.objective_control?.startsWith('-')),
      icon: TrendingUp,
    },
    {
      label: "Deaths Per Game",
      value: kpis?.deaths_per_game || "0",
      change: kpis?.trend_deltas?.deaths_per_game || "+0.0",
      isPositive: kpis?.trend_deltas?.deaths_per_game?.startsWith('-'), // Fewer deaths is good
      icon: ArrowDown,
    },
    {
      label: "Gold Advantage",
      value: (kpis?.gold_advantage !== undefined ? (kpis.gold_advantage >= 0 ? "+" : "") + (kpis.gold_advantage / 1000).toFixed(1) + "k" : "0k"),
      change: kpis?.trend_deltas?.gold_advantage || "+0.0k",
      isPositive: !(kpis?.trend_deltas?.gold_advantage?.startsWith('-')),
      icon: TrendingUp,
    },
  ];

  const matchHistoryData = kpis?.match_history || MATCH_HISTORY;

  return (
    <MainLayout>
      <div className="max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Assistant Coach Dashboard
            </h1>
            <p className="text-neutral-600">
              Overview of team performance and AI coaching insights
            </p>
          </div>
          <button 
            onClick={async () => {
              setIsLoading(true);
              await fetch('/api/ingest', { method: 'POST', body: JSON.stringify({ matchId: 'mock-match-id' }) });
              // Re-fetch
              const response = await fetch('/api/coach/team/T1/overview');
              const data = await response.json();
              setKpis(data);
              setIsLoading(false);
            }}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            {isLoading ? 'Processing...' : 'Refresh Data'}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiDisplayData.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-neutral-50 border border-neutral-200 p-6 rounded-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-neutral-600">
                  {kpi.label}
                </span>
                <kpi.icon
                  size={18}
                  className={kpi.isPositive ? "text-green-600" : "text-red-600"}
                />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-black">
                  {kpi.value}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium mb-1",
                    kpi.isPositive ? "text-green-600" : "text-red-600",
                  )}
                >
                  {kpi.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Win/Loss History */}
          <div className="bg-white border border-neutral-200 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-black mb-6">
              Match History (Last 6 Weeks)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Bar dataKey="wins" name="Wins" fill="#3d3d3d" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="losses" name="Losses" fill="#a3a3a3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white border border-neutral-200 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-black mb-6">
              Carry Potential by Role
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ROLE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ROLE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Matches Table */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-black">Recent Matches</h3>
            <button className="text-sm text-brown font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Opponent
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    K/D
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {RECENT_MATCHES.map((match, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-black">
                      {match.opponent}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-bold rounded",
                          match.result === "WIN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                        )}
                      >
                        {match.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {match.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {match.duration}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {match.kills}/{match.deaths}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
