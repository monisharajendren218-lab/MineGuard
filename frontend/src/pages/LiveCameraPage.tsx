import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { LiveCamera } from '../components/LiveCamera';
import { Camera, Video, Settings, Play, Square, Download, Trash2, Shield } from 'lucide-react';

interface Snapshot {
  id: string;
  timestamp: string;
  dataUrl: string;
}

export const LiveCameraPage: React.FC = () => {
  const { cameraStreamUrl, setCameraStreamUrl, isDemoMode } = useSystem();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [streamUrlInput, setStreamUrlInput] = useState(cameraStreamUrl);

  const handleCaptureSnapshot = () => {
    // Generate a placeholder canvas image for snapshot gallery demo
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#090D14';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#00F0FF';
      ctx.font = '20px monospace';
      ctx.fillText('MINEGUARD RESCUE CAMERA FRAME', 40, 50);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px monospace';
      ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString()}`, 40, 90);
      ctx.fillText(`MODE: ${isDemoMode ? 'DEMO SIMULATION' : 'LIVE FEED'}`, 40, 120);

      const snapUrl = canvas.toDataURL('image/jpeg');
      setSnapshots((prev) => [
        {
          id: `snap-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          dataUrl: snapUrl
        },
        ...prev
      ]);
    }
  };

  const handleSaveStreamUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCameraStreamUrl(streamUrlInput);
    setShowConfig(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Video className="w-6 h-6 text-cyan-400" />
            LIVE DRONE CAMERA WORKSTATION
          </h2>
          <p className="text-xs text-slate-400">High-definition subterranean optics & stream controls</p>
        </div>

        <button
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-200 hover:text-cyan-400 transition-all"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span>CONFIGURE STREAM URL</span>
        </button>
      </div>

      {/* Main Camera Viewport + Snapshot Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expanded Camera Viewport (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <LiveCamera className="h-[480px]" />

          {/* Quick Capture Bar */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">FRAME SNAPSHOT ARCHIVE: {snapshots.length} CAPTURED</span>
            <button
              onClick={handleCaptureSnapshot}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase shadow-lg transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>CAPTURE FRAME</span>
            </button>
          </div>
        </div>

        {/* Snapshot Gallery & Log Panel (1 Column) */}
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            RESCUE SNAPSHOT GALLERY
          </h3>

          {snapshots.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono space-y-2">
              <Camera className="w-8 h-8 mx-auto text-slate-600" />
              <p>No snapshots captured yet.</p>
              <p className="text-[10px] text-slate-600">Click "CAPTURE FRAME" to record visual evidence.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {snapshots.map((snap) => (
                <div key={snap.id} className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-2 group">
                  <img src={snap.dataUrl} alt="Snapshot" className="w-full h-28 object-cover rounded-lg border border-slate-800" />
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                    <span>{snap.timestamp}</span>
                    <button
                      onClick={() => setSnapshots((prev) => prev.filter((s) => s.id !== snap.id))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stream Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="font-mono text-base font-bold text-white uppercase">CONFIGURE STREAM PROTOCOL</h3>
            <p className="text-xs text-slate-400">
              Provide a valid camera stream URL (HTTP MJPEG, WebRTC stream, or backend RTSP proxy).
            </p>
            <form onSubmit={handleSaveStreamUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">STREAM URL</label>
                <input
                  type="url"
                  value={streamUrlInput}
                  onChange={(e) => setStreamUrlInput(e.target.value)}
                  placeholder="http://192.168.1.100:81/stream"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs"
                >
                  APPLY STREAM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
