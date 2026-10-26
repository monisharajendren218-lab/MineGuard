import React from 'react';
import { useSystem } from '../context/SystemContext';
import { ShieldAlert, UserCheck, Shield, Eye, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { setCurrentUserRole, setActiveTab } = useSystem();

  const handleLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      {/* Background Reticle Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, #00F0FF 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_30px_rgba(0,240,255,0.3)]">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black font-mono tracking-wider uppercase text-white">MINEGUARD</h1>
          <p className="text-xs text-slate-400">Mining Safety Drone Monitoring & Emergency Rescue Control Room</p>
        </div>

        {/* Quick Role Select Persona Cards */}
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-800 pb-3">
            SELECT COMMAND OPERATOR PROFILE
          </h2>

          <div className="space-y-3">
            {/* Rescue Operator (Recommended) */}
            <button
              onClick={() => handleLogin('RESCUE_OPERATOR')}
              className="w-full p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-cyan-300">CHIEF RESCUE OPERATOR</h3>
                  <p className="text-xs text-slate-400">Full control over live drone, alerts, and emergency rescue panel</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Administrator */}
            <button
              onClick={() => handleLogin('ADMIN')}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-200">SYSTEM ADMINISTRATOR</h3>
                  <p className="text-xs text-slate-400">Configure safety thresholds, users, and MQTT broker parameters</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Read-only Viewer */}
            <button
              onClick={() => handleLogin('VIEWER')}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-200">INSPECTION VIEWER</h3>
                  <p className="text-xs text-slate-400">Read-only observation mode for historical analytics and reports</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] font-mono text-slate-500">
          MineGuard v1.0.0 • College & Hackathon Project Edition
        </div>
      </div>
    </div>
  );
};
