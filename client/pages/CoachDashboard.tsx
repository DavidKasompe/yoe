import { MainLayout } from "@/components/MainLayout";
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

export function CoachDashboard() {
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
              Team performance overview and actionable insights
            </p>
          </div>
          <div className="hidden lg:block bg-neutral-50 border border-neutral-200 p-3 rounded-lg max-w-sm">
            <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
              Foundational Data Layer
            </p>
            <p className="text-xs text-neutral-600 leading-tight">
              Powered by official <strong>GRID GraphQL APIs</strong>. Transforming raw data into actionable coaching intelligence.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {KPI_DATA.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white border border-neutral-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold text-black">{kpi.value}</p>
                  </div>
                  <Icon
                    size={24}
                    className={
                      kpi.isPositive ? "text-green-600" : "text-red-600"
                    }
                  />
                </div>
                <p className="text-sm font-medium text-green-600">
                  {kpi.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Win Rate Chart */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">
              Match History (Last 6 Weeks)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MATCH_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                  }}
                />
                <Legend />
                <Bar dataKey="wins" fill="#3d3d3d" name="Wins" />
                <Bar dataKey="losses" fill="#999999" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">
              Role Pick Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ROLE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ROLE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Recent Matches
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Opponent
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Result
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    K/D
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-black">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECENT_MATCHES.map((match, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4 text-neutral-900">
                      {match.opponent}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded text-white font-medium ${
                          match.result === "WIN" ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {match.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{match.date}</td>
                    <td className="py-3 px-4 text-neutral-600">
                      {match.duration}
                    </td>
                    <td className="py-3 px-4 text-neutral-900 font-medium">
                      {match.kills}/{match.deaths}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-brown font-medium hover:underline">
                        View
                      </button>
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
