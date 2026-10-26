import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Siren, Volume2, VolumeX, Camera, Disc, Square, ShieldOff, AlertCircle } from 'lucide-react';

export const EmergencyControlBar: React.FC = () => {
  const { triggerEmergency, isAudioMuted, toggleAudioMute, currentUser } = useSystem();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordTimer, setRecordTimer] = useState<NodeJS.Timeout | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleTriggerEmergency = () => {
    if (currentUser.role === 'VIEWER') {
      showNotification('🚫 PERMISSION DENIED: Viewers cannot trigger emergency overrides.');
      return;
    }
    triggerEmergency();
    showNotification('🚨 EMERGENCY OVERRIDE TRIGGERED! Methane & Overheat alert injected.');
  };

  const handleCaptureSnapshot = () => {
    showNotification('📸 SNAPSHOT CAPTURED: Saved frame to local rescue archive (mineguard_snap.jpg)');
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordSeconds(0);
      const timer = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
      setRecordTimer(timer);
      showNotification('⏺ VIDEO RECORDING STARTED: Telemetry & stream recording active.');
    } else {
      setIsRecording(false);
      if (recordTimer) clearInterval(recordTimer);
      setRecordTimer(null);
      showNotification(`⏹ RECORDING STOPPED: Clip saved (${recordSeconds}s duration).`);
    }
  };

  const handleStopMonitoring = () => {
    if (currentUser.role === 'VIEWER') {
      showNotification('🚫 PERMISSION DENIED: Viewers cannot halt monitoring.');
      return;
    }
    showNotification('🛑 MONITORING HALTED: Telemetry pipeline suspended by operator.');
  };

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-xs uppercase font-extrabold text-slate-300 tracking-wider">
            EMERGENCY CONTROL PANEL
          </span>
        </div>

        {/* Feedback Banner */}
        {actionFeedback && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Emergency Trigger */}
          <button
            onClick={handleTriggerEmergency}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-extrabold uppercase shadow-[0_0_20px_rgba(255,51,102,0.4)] transition-all active:scale-95"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span>🚨 SIMULATE EMERGENCY</span>
          </button>

          {/* Mute Siren */}
          <button
            onClick={toggleAudioMute}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-xs font-semibold border transition-all ${
              isAudioMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            <span>{isAudioMuted ? 'UNMUTE SOUND' : 'MUTE SOUND'}</span>
          </button>

          {/* Snapshot */}
          <button
            onClick={handleCaptureSnapshot}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all hover:text-cyan-400"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>SNAPSHOT</span>
          </button>

          {/* Record */}
          <button
            onClick={handleToggleRecord}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-xs font-semibold border transition-all ${
              isRecording
                ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200 hover:text-red-400'
            }`}
          >
            {isRecording ? <Square className="w-4 h-4 text-red-400 fill-current" /> : <Disc className="w-4 h-4 text-red-400" />}
            <span>{isRecording ? `REC (${recordSeconds}s)` : 'RECORD'}</span>
          </button>

          {/* Stop Monitoring */}
          <button
            onClick={handleStopMonitoring}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono font-semibold transition-all"
          >
            <ShieldOff className="w-4 h-4" />
            <span>STOP MONITORING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
