import { X, TrendingUp, Shield, Sword, Zap, Target, AlertTriangle, Eye, Clock, Crown, Download } from 'lucide-react';

interface MatchAnalysisProps {
  analysis: {
    overview: string;
    winCondition: string;
    keyObservations: string[];
    nextObjectives: string;
    risks: string;
    generatedAt: string;
  };
  onClose: () => void;
}

export function MatchAnalysisModal({ analysis, onClose }: MatchAnalysisProps) {
  const handleDownload = () => {
    // Create formatted text for report
    const content = `
MATCH ANALYSIS REPORT
${'='.repeat(60)}
Generated: ${analysis.generatedAt}
${'='.repeat(60)}

EXECUTIVE OVERVIEW
${'-'.repeat(60)}
${analysis.overview}

WIN CONDITION
${'-'.repeat(60)}
${analysis.winCondition}

CRITICAL RISKS
${'-'.repeat(60)}
${analysis.risks}

KEY OBSERVATIONS
${'-'.repeat(60)}
${analysis.keyObservations.map((obs, i) => `${i + 1}. ${obs}`).join('\n')}

NEXT OBJECTIVES
${'-'.repeat(60)}
${analysis.nextObjectives}

${'='.repeat(60)}
Powered by Groq AI Coach
`;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Match_Analysis_${new Date().toISOString().slice(0,10)}.txt`;
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
              onClick={handleDownload}
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
              <Zap className="w-8 h-8 text-brown-light" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Live Match Analysis</h2>
              <p className="text-sm text-white/60">AI Assistant Coach • {analysis.generatedAt}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          
          {/* Executive Overview */}
          <section className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-brown-light" />
              <h3 className="text-lg font-bold text-white">Executive Overview</h3>
            </div>
            <p className="text-white/80 leading-relaxed font-medium">{analysis.overview}</p>
          </section>

          {/* Win Condition & Risks Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Win Condition */}
            <section className="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-green-400">Win Condition</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{analysis.winCondition}</p>
            </section>

            {/* Critical Risks */}
            <section className="rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-red-400">Critical Risks</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{analysis.risks}</p>
            </section>
          </div>

          {/* Key Observations */}
          <section className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-brown-light" />
              <h3 className="text-lg font-bold text-white">Key Observations</h3>
            </div>
            <div className="space-y-3">
              {analysis.keyObservations.map((obs, i) => (
                <div key={i} className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-brown-light font-bold text-sm">0{i + 1}</span>
                  <p className="text-white/80 text-sm">{obs}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Next Objectives */}
          <section className="rounded-2xl bg-gradient-to-br from-brown/20 to-brown/5 border border-brown/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-brown-light" />
              <h3 className="text-lg font-bold text-white">Next Objectives</h3>
            </div>
            <p className="text-white/90 leading-relaxed font-medium">{analysis.nextObjectives}</p>
          </section>

        </div>
      </div>
    </div>
  );
}
