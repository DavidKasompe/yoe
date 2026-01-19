"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Search, Calendar, Trophy, ChevronRight, BarChart2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoutingReportsPage() {
  const [selectedOpponent, setSelectedOpponent] = useState<string>("Team Alpha");
  const [timeWindow, setTimeWindow] = useState<string>("Last 10 Games");
  const [tournamentScope, setTournamentScope] = useState<string>("All Tournaments");
  const [teams, setTeams] = useState<string[]>(["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"]);
  const [report, setReport] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    try {
      const storedTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
      const authHeader = storedTokens?.accessToken ? { 'Authorization': `Bearer ${storedTokens.accessToken}` } : {};

      const response = await fetch('/api/scout/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ teamName: selectedOpponent })
      });
      if (response.ok) {
        // Fetch standardized report after generation
        const reportResponse = await fetch(`/api/scout/report/${selectedOpponent}`, {
          headers: authHeader
        });
        const data = await reportResponse.json();
        setReport(data);
      } else {
        const err = await response.json();
        alert(err.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Scouting Reports
          </h1>
          <p className="text-neutral-600">
            Analyze opponents and generate detailed scouting insights
          </p>
        </div>

        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">
              Opponent Team
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black"
              >
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">
              Time Window
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black"
              >
                <option value="Last 5 Games">Last 5 Games</option>
                <option value="Last 10 Games">Last 10 Games</option>
                <option value="Last 20 Games">Last 20 Games</option>
                <option value="Current Patch">Current Patch</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">
              Tournament Scope
            </label>
            <div className="relative">
              <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={tournamentScope}
                onChange={(e) => setTournamentScope(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black"
              >
                <option value="All Tournaments">All Tournaments</option>
                <option value="Domestic League">Domestic League</option>
                <option value="International Events">International Events</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button 
            onClick={handleGenerateReport}
            disabled={isAnalyzing}
            className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-neutral-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <BarChart2 size={20} />
            {isAnalyzing ? "Analyzing Data..." : `Generate Scouting Report for ${selectedOpponent}`}
          </button>
        </div>

        {/* Results */}
        {report ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                  <BarChart2 size={20} className="text-brown" />
                  Strategic Profile
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Early Game</span>
                    <span className={cn(
                      "font-bold",
                      report.tendencies.early_game === "Aggressive" ? "text-red-600" : "text-blue-600"
                    )}>{report.tendencies.early_game}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Mid Game</span>
                    <span className={cn(
                      "font-bold",
                      report.tendencies.mid_game === "Unstable" ? "text-orange-600" : "text-green-600"
                    )}>{report.tendencies.mid_game}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Late Game</span>
                    <span className="font-bold text-black">{report.tendencies.late_game}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-neutral-600">Aggression Score</span>
                    <span className="font-bold text-black">{(report.tendencies.aggression_score * 100).toFixed(0)}/100</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-red-600" />
                  Vulnerabilities
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Weak Roles</label>
                    <div className="flex gap-2">
                      {report.weaknesses.map((role: string) => (
                        <span key={role} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-100">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Side Preference</label>
                    <span className="text-sm font-medium text-black bg-neutral-100 px-3 py-1 rounded-full">
                      {report.tendencies.side_preference}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Strategic Analysis */}
            <div className="bg-black text-white border border-neutral-800 rounded-lg p-8 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BarChart2 size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-brown-light">
                  <BarChart2 size={20} className="fill-current" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">AI Strategic Analyst</h3>
                </div>
                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6 italic">
                  "{report.llm_summary}"
                </p>
                <div className="flex items-center gap-4 text-neutral-400 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Confidence: 94%
                  </div>
                  <div>Source: GRID Data Pipeline</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-black mb-4">
              Analysis Ready
            </h2>
            <p className="text-neutral-600 mb-6">
              Select an opponent and parameters above to generate strategic insights.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
