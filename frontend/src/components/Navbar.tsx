import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import {
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  User,
  Zap,
  Activity,
  AlertTriangle,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isWebSocketConnected,
    lastReceivedSecondsAgo,
    isDemoMode,
    toggleDemoMode,
    isAudioMuted,
    toggleAudioMute,
    alerts,
    currentUser,
    setCurrentUserRole,
    latestReading
  } = useSystem();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const activeCriticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE');
  const isDeviceConnected = latestReading?.deviceOnline || isDemoMode;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
      {/* Left Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <ShieldAlert className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold tracking-wider text-white text-base uppercase font-mono">MINEGUARD</h1>
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Mining Safety Drone Monitoring & Rescue System</p>
        </div>
      </div>

      {/* Center Status Telemetry */}
      <div className="flex flex-wrap items-center gap-3">
        {/* System Online / Offline Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isWebSocketConnected && isDeviceConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'
            }`}
          />
          <span className="font-mono text-xs uppercase font-semibold">
            {isWebSocketConnected && isDeviceConnected ? (
              <span className="text-emerald-400">SYSTEM: ONLINE</span>
            ) : (
              <span className="text-red-400">DEVICE DISCONNECTED</span>
            )}
          </span>
        </div>

        {/* Last Received Data Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">LAST DATA:</span>
          <span className={`font-semibold ${lastReceivedSecondsAgo > 10 ? 'text-amber-400' : 'text-slate-200'}`}>
            {lastReceivedSecondsAgo}s ago
          </span>
        </div>

        {/* Live vs Demo Mode Toggle */}
        <button
          onClick={() => toggleDemoMode(!isDemoMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
            isDemoMode
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
          }`}
          title="Click to toggle between LIVE ESP32 hardware mode and DEMO simulation mode"
        >
          {isDemoMode ? (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>🟡 DEMO MODE</span>
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>🟢 LIVE MODE</span>
            </>
          )}
        </button>

        {/* Critical Alerts Badge Indicator */}
        {activeCriticalAlerts.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-xs animate-glow-danger font-bold">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>{activeCriticalAlerts.length} CRITICAL THREATS</span>
          </div>
        )}
      </div>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-2">
        {/* Audio Siren Mute Button */}
        <button
          onClick={toggleAudioMute}
          className={`p-2 rounded-lg border transition-colors ${
            isAudioMuted
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isAudioMuted ? 'Unmute Emergency Siren Sound' : 'Mute Emergency Siren Sound'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-cyan-400 font-mono">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-2">
              <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                SWITCH ROLE DEMO
              </div>
              <button
                onClick={() => {
                  setCurrentUserRole('ADMIN');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 ${
                  currentUser.role === 'ADMIN' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                }`}
              >
                <span>ADMINISTRATOR</span>
                {currentUser.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <button
                onClick={() => {
                  setCurrentUserRole('RESCUE_OPERATOR');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 ${
                  currentUser.role === 'RESCUE_OPERATOR' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                }`}
              >
                <span>RESCUE OPERATOR</span>
                {currentUser.role === 'RESCUE_OPERATOR' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <button
                onClick={() => {
                  setCurrentUserRole('VIEWER');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 ${
                  currentUser.role === 'VIEWER' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                }`}
              >
                <span>READ-ONLY VIEWER</span>
                {currentUser.role === 'VIEWER' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
