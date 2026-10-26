import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';

export const RealtimeChart: React.FC = () => {
  const { sensorHistory } = useSystem();
  const [selectedMetrics, setSelectedMetrics] = useState({
    temperature: true,
    methane: true,
    carbonMonoxide: false,
    humidity: false,
    airQuality: false,
    battery: false
  });

  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '30m' | '1h'>('5m');

  const toggleMetric = (key: keyof typeof selectedMetrics) => {
    setSelectedMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Format history for Recharts
  const chartData = sensorHistory.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: item.temperature,
    humidity: item.humidity,
    methane: item.methane,
    carbonMonoxide: item.carbonMonoxide,
    airQuality: item.airQuality,
    battery: item.battery
  }));

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              REAL-TIME MULTI-SENSOR TELEMETRY TRENDS
            </h3>
            <p className="text-xs text-slate-400">Live synchronized sensor data stream</p>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['1m', '5m', '30m', '1h'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                timeRange === range ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Checkboxes */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 mr-2">TOGGLE TELEMETRY:</span>
        <button
          onClick={() => toggleMetric('temperature')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            selectedMetrics.temperature
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          🌡 Temp (°C)
        </button>
        <button
          onClick={() => toggleMetric('methane')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            selectedMetrics.methane
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          ☣ Methane CH₄ (%)
        </button>
        <button
          onClick={() => toggleMetric('carbonMonoxide')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            selectedMetrics.carbonMonoxide
              ? 'bg-red-500/20 border-red-500/50 text-red-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          ☠ CO (ppm)
        </button>
        <button
          onClick={() => toggleMetric('humidity')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            selectedMetrics.humidity
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          💧 Humidity (%)
        </button>
        <button
          onClick={() => toggleMetric('airQuality')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            selectedMetrics.airQuality
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          🌫 Air Quality (AQI)
        </button>
        <button
          onClick={() => toggleMetric('battery')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            selectedMetrics.battery
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          🔋 Battery (%)
        </button>
      </div>

      {/* Graph Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121824',
                borderColor: '#1E293B',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace', paddingTop: '10px' }} />
            {selectedMetrics.temperature && (
              <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#FF3366" strokeWidth={2} dot={false} />
            )}
            {selectedMetrics.methane && (
              <Line type="monotone" dataKey="methane" name="Methane (%)" stroke="#F59E0B" strokeWidth={2} dot={false} />
            )}
            {selectedMetrics.carbonMonoxide && (
              <Line type="monotone" dataKey="carbonMonoxide" name="CO (ppm)" stroke="#EF4444" strokeWidth={2} dot={false} />
            )}
            {selectedMetrics.humidity && (
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#00F0FF" strokeWidth={2} dot={false} />
            )}
            {selectedMetrics.airQuality && (
              <Line type="monotone" dataKey="airQuality" name="AQI" stroke="#A855F7" strokeWidth={2} dot={false} />
            )}
            {selectedMetrics.battery && (
              <Line type="monotone" dataKey="battery" name="Battery (%)" stroke="#10B981" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
