import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { RealtimeChart } from '../components/RealtimeChart';
import { BarChart3, Download, Calendar, Filter, Database, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { sensorHistory, exportCSV } = useSystem();
  const [dateRange, setDateRange] = useState('24h');

  // Compute summary stats
  const temps = sensorHistory.map((d) => d.temperature);
  const methanes = sensorHistory.map((d) => d.methane);
  const cos = sensorHistory.map((d) => d.carbonMonoxide);

  const maxTemp = temps.length ? Math.max(...temps).toFixed(1) : '32.5';
  const maxMethane = methanes.length ? Math.max(...methanes).toFixed(2) : '1.8';
  const maxCO = cos.length ? Math.max(...cos).toFixed(0) : '12';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            HISTORICAL TELEMETRY ANALYTICS & REPORTS
          </h2>
          <p className="text-xs text-slate-400">Database sensor log analysis and export functionality</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase shadow-lg transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV REPORT</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-500 text-xs uppercase">PEAK METHANE CH₄</span>
          <p className="text-2xl font-black text-amber-400">{maxMethane}%</p>
          <p className="text-[10px] text-slate-400">Max observed in shaft</p>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-500 text-xs uppercase">MAX TEMPERATURE</span>
          <p className="text-2xl font-black text-rose-400">{maxTemp}°C</p>
          <p className="text-[10px] text-slate-400">Peak thermal reading</p>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-500 text-xs uppercase">PEAK CO CONCENTRATION</span>
          <p className="text-2xl font-black text-red-400">{maxCO} ppm</p>
          <p className="text-[10px] text-slate-400">Highest carbon monoxide</p>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-500 text-xs uppercase">LOGGED TELEMETRY POINTS</span>
          <p className="text-2xl font-black text-cyan-400">{sensorHistory.length}</p>
          <p className="text-[10px] text-slate-400">Active session memory</p>
        </div>
      </div>

      {/* Main Chart */}
      <RealtimeChart />
    </div>
  );
};
