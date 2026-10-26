import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  status: 'SAFE' | 'NORMAL' | 'WARNING' | 'CRITICAL' | 'GOOD';
  thresholdText: string;
  icon: LucideIcon;
  updatedAt?: string;
  sparklineData?: number[];
  colorTheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  status,
  thresholdText,
  icon: Icon,
  updatedAt,
  sparklineData = [10, 15, 12, 18, 22, 19, 24, 20],
  colorTheme = 'cyan'
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'SAFE':
      case 'NORMAL':
      case 'GOOD':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/50 animate-glow-danger';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'SAFE':
      case 'NORMAL':
      case 'GOOD':
        return '🟢';
      case 'WARNING':
        return '🟡';
      case 'CRITICAL':
        return '🚨';
    }
  };

  // Compute SVG sparkline points normalized
  const minVal = Math.min(...sparklineData, 0);
  const maxVal = Math.max(...sparklineData, 1);
  const range = maxVal - minVal || 1;
  const width = 100;
  const height = 30;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative bg-[#121824] border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
        </div>

        {/* Status Badge */}
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 ${getBadgeStyle()}`}>
          <span>{getStatusIcon()}</span>
          <span>{status}</span>
        </span>
      </div>

      {/* Primary Value Display */}
      <div className="my-2 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-black text-white tracking-tight">{value}</span>
          <span className="font-mono text-xs font-semibold text-slate-400">{unit}</span>
        </div>

        {/* Mini Sparkline Graph */}
        <div className="w-24 h-8">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={status === 'CRITICAL' ? '#FF3366' : status === 'WARNING' ? '#F59E0B' : '#00F0FF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Limit: {thresholdText}</span>
        <span className="text-[10px] text-slate-500">{updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'Live'}</span>
      </div>
    </div>
  );
};
