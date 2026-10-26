import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { AlertTriangle, Bell, Search, CheckCircle2, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { AlertSeverity, AlertStatus } from '../types';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, isAudioMuted, toggleAudioMute, currentUser } = useSystem();
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    const matchesSearch =
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.sensor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-400 animate-bounce" />
            REAL-TIME EMERGENCY ALERTS CENTER
          </h2>
          <p className="text-xs text-slate-400">Automated threat detection and operator incident response</p>
        </div>

        <button
          onClick={toggleAudioMute}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
            isAudioMuted
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white'
          }`}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span>{isAudioMuted ? 'UNMUTE ALARM SIREN' : 'SIREN ACTIVE (CLICK TO MUTE)'}</span>
        </button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts by sensor, gas type, or message..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 px-2">SEVERITY:</span>
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : sev === 'WARNING'
                    ? 'bg-amber-500 text-black'
                    : 'bg-cyan-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 px-2">STATUS:</span>
          {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                statusFilter === st ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alert History Table */}
      <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Alert Type</th>
                <th className="p-4">Sensor / Reading</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Message</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No active or historical alerts match the current filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 text-slate-400 font-semibold">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4 text-slate-200 font-bold">{alert.type}</td>
                    <td className="p-4">
                      <span className="text-white font-bold">{alert.sensor}</span>
                      <span className="text-cyan-400 ml-2">
                        {alert.value} {alert.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          alert.status === 'ACTIVE'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : alert.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs truncate">{alert.message}</td>
                    <td className="p-4 text-right space-x-2">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          disabled={currentUser.role === 'VIEWER'}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[10px] font-bold disabled:opacity-50"
                        >
                          ACKNOWLEDGE
                        </button>
                      )}
                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          disabled={currentUser.role === 'VIEWER'}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[10px] font-bold disabled:opacity-50"
                        >
                          RESOLVE
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
