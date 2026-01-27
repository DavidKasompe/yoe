import { X, TrendingUp, Shield, Sword, Brain, Target, Trophy, Clock, Download } from 'lucide-react';

interface ScoutingReportProps {
  report: {
    teamName: string;
    generatedAt: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    overview: string;
    strategicProfile: string;
    championAnalysis: string;
    counterplay: string;
    statistics: {
      record: string;
      winRate: string;
      trend: string;
      league: string;
      avgGameTime: string;
    };
    championPool: {
      topPicks: { name: string; count: number }[];
      topBans: { name: string; count: number }[];
    };
    recentMatches: { result: string; opponent: string; date?: Date }[];
  };
  onClose: () => void;
}

const getThreatColor = (level: string) => {
  switch (level) {
    case 'CRITICAL': return 'text-red-500';
    case 'HIGH': return 'text-orange-400';
    case 'MEDIUM': return 'text-yellow-400';
    case 'LOW': return 'text-green-400';
    default: return 'text-gray-400';
  }
};

const getThreatBg = (level: string) => {
  switch (level) {
    case 'CRITICAL': return 'bg-red-500/10 border-red-500/30';
    case 'HIGH': return 'bg-orange-500/10 border-orange-500/30';
    case 'MEDIUM': return 'bg-yellow-500/10 border-yellow-500/30';
    case 'LOW': return 'bg-green-500/10 border-green-500/30';
    default: return 'bg-gray-500/10 border-gray-500/30';
  }
};

export function ScoutingReportModal({ report, onClose }: ScoutingReportProps) {
  const handleDownloadPDF = () => {
    // Create formatted text for PDF
    const content = `
SCOUTING REPORT: ${report.teamName}
${'='.repeat(60)}

Generated: ${report.generatedAt}
Threat Level: ${report.threatLevel}

STATISTICS
${'-'.repeat(60)}
Record: ${report.statistics.record} (${report.statistics.winRate})
Form: ${report.statistics.trend.toUpperCase()}
League: ${report.statistics.league}
Average Game Time: ${report.statistics.avgGameTime}

OVERVIEW
${'-'.repeat(60)}
${report.overview}

STRATEGIC PROFILE
${'-'.repeat(60)}
${report.strategicProfile}

CHAMPION ANALYSIS
${'-'.repeat(60)}
${report.championAnalysis}

Top Picks:
${report.championPool.topPicks.map((c, i) => `${i + 1}. ${c.name} (${c.count} games)`).join('\n')}

Most Banned:
${report.championPool.topBans.map((c, i) => `${i + 1}. ${c.name} (${c.count} bans)`).join('\n')}

COUNTERPLAY RECOMMENDATIONS
${'-'.repeat(60)}
${report.counterplay}

RECENT MATCHES
${'-'.repeat(60)}
${report.recentMatches.map(m => `${m.result} vs ${m.opponent}`).join('\n')}

${'='.repeat(60)}
Powered by Groq AI • ${report.generatedAt}
`;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.teamName.replace(/\s+/g, '_')}_Scouting_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-black border border-white/20 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="relative border-b border-white/20 bg-black p-6">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 rounded-xl bg-brown/20 hover:bg-brown/30 border border-brown/30 transition-all group"
              title="Download Report"
            >
              <Download className="w-5 h-5 text-brown group-hover:text-brown-light" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brown/20 border border-brown/30">
              <Target className="w-8 h-8 text-brown" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{report.teamName}</h2>
              <p className="text-sm text-white/60">AI-Powered Scouting Report</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-xl border ${getThreatBg(report.threatLevel)}`}>
              <span className="text-xs text-white/60">Threat Level</span>
              <p className={`text-sm font-bold ${getThreatColor(report.threatLevel)}`}>
                {report.threatLevel}
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">Record</span>
              <p className="text-sm font-bold text-white">{report.statistics.record}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">Win Rate</span>
              <p className="text-sm font-bold text-green-400">{report.statistics.winRate}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">Form</span>
              <p className="text-sm font-bold text-white capitalize">{report.statistics.trend}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Overview */}
          <section className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-brown" />
              <h3 className="text-lg font-bold text-white">Overview</h3>
            </div>
            <p className="text-white/80 leading-relaxed">{report.overview}</p>
          </section>

          {/* Strategic Profile */}
          <section className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-brown" />
              <h3 className="text-lg font-bold text-white">Strategic Profile</h3>
            </div>
            <p className="text-white/80 leading-relaxed">{report.strategicProfile}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/60 mb-1">League</p>
                <p className="text-sm font-medium text-white">{report.statistics.league}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/60 mb-1">Avg Game Time</p>
                <p className="text-sm font-medium text-white">{report.statistics.avgGameTime}</p>
              </div>
            </div>
          </section>

          {/* Champion Analysis */}
          <section className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-brown" />
              <h3 className="text-lg font-bold text-white">Champion Analysis</h3>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">{report.championAnalysis}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Top Picks */}
              <div>
                <h4 className="text-sm font-semibold text-brown mb-3">Top Picks</h4>
                <div className="space-y-2">
                  {report.championPool.topPicks.slice(0, 5).map((champ, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-sm text-white">{champ.name}</span>
                      <span className="text-xs text-white/60">{champ.count} games</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Bans */}
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-3">Most Banned</h4>
                <div className="space-y-2">
                  {report.championPool.topBans.slice(0, 5).map((champ, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-sm text-white">{champ.name}</span>
                      <span className="text-xs text-white/60">{champ.count} bans</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Counterplay */}
          <section className="rounded-2xl bg-gradient-to-br from-brown/20 to-brown/5 border border-brown/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-brown" />
              <h3 className="text-lg font-bold text-white">Counterplay Recommendations</h3>
            </div>
            <p className="text-white/90 leading-relaxed font-medium">{report.counterplay}</p>
          </section>

          {/* Recent Matches */}
          <section className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-brown" />
              <h3 className="text-lg font-bold text-white">Recent Matches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.recentMatches.map((match, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    match.result === 'W'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  <span className="font-bold">{match.result}</span> vs {match.opponent}
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-white/40">
              Generated {report.generatedAt} • Powered by Groq AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
