"use client";

interface DraftHeaderProps {
  onReset: () => void;
}

export function DraftHeader({ onReset }: DraftHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
           <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
           <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Live Simulation</span>
        </div>
        <p className="text-neutral-500 text-sm font-medium">AI-powered recommendations active</p>
      </div>
      
      <button 
        onClick={onReset}
        className="text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:text-orange-500 transition-colors border border-white/5 rounded-lg px-4 py-2 hover:border-orange-500/50 hover:bg-[#252525]"
      >
        Reset Draft
      </button>
    </div>
  );
}
