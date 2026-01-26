import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachKPICardProps {
  label: string;
  value: string | number;
  change?: string;
  status?: string;
  icon: LucideIcon;
}

export function CoachKPICard({ label, value, change, status, icon: Icon }: CoachKPICardProps) {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-brown/50 transition-all duration-200 group cursor-pointer active:scale-[0.98]">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-background rounded-lg group-hover:bg-brown/20 transition-colors duration-200">
          <Icon size={16} className="text-muted-foreground group-hover:text-brown-light transition-colors duration-200" />
        </div>
        {change && (
          <div className={cn(
            "text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-opacity duration-200",
            isPositive ? "text-green-500 bg-green-500/10" : 
            isNegative ? "text-red-500 bg-red-500/10" : 
            "text-muted-foreground bg-muted"
          )}>
            {isPositive && <ArrowUp size={8} />}
            {isNegative && <ArrowDown size={8} />}
            {change.replace('+', '').replace('-', '')}
          </div>
        )}
      </div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 truncate font-sans">
        {label}
      </div>
      <div className="text-2xl font-black text-foreground tracking-tighter font-mono">
        {value}
      </div>
    </div>
  );
}
