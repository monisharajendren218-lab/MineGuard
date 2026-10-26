import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Video, Maximize2, Camera, RefreshCw, AlertTriangle, Settings, Radio } from 'lucide-react';

interface LiveCameraProps {
  className?: string;
}

export const LiveCamera: React.FC<LiveCameraProps> = ({ className = '' }) => {
  const { latestReading, isDemoMode, cameraStreamUrl, setCameraStreamUrl } = useSystem();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [urlInput, setUrlInput] = useState(cameraStreamUrl);

  const isCameraOnline = latestReading?.cameraOnline ?? true;

  const toggleFullScreen = () => {
    const el = document.getElementById('camera-viewport-container');
    if (el) {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(console.error);
        setIsFullScreen(true);
      } else {
        document.exitFullscreen().catch(console.error);
        setIsFullScreen(false);
      }
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCameraStreamUrl(urlInput);
    setShowConfig(false);
  };

  return (
    <div
      id="camera-viewport-container"
      className={`relative bg-[#090D14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between ${className}`}
      style={{ minHeight: '360px' }}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            LIVE DRONE CAMERA
          </span>
          {isDemoMode && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO FEED
            </span>
          )}
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
            title="Configure Camera Stream URL"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stream Display Container */}
      <div className="relative w-full h-full flex-1 flex items-center justify-center bg-black overflow-hidden min-h-[300px]">
        {/* Stream URL Form Modal Overlay */}
        {showConfig && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur p-6 flex flex-col justify-center items-center text-center">
            <h3 className="text-sm font-mono font-bold text-white mb-2">CONFIGURE LIVE CAMERA STREAM URL</h3>
            <p className="text-xs text-slate-400 max-w-md mb-4">
              Enter an MJPEG, HTTP stream, WebRTC or RTSP proxy URL (e.g., http://192.168.1.100:81/stream for ESP32-CAM).
            </p>
            <form onSubmit={handleSaveUrl} className="w-full max-w-md space-y-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://192.168.1.100:81/stream"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs"
                >
                  SAVE & CONNECT
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Actual Video Stream or Simulated Demo Viewport or Offline Fallback */}
        {cameraStreamUrl && isStreamActive ? (
          <img
            src={cameraStreamUrl}
            alt="Live Drone Stream"
            className="w-full h-full object-cover"
            onError={() => {
              console.warn('Failed to load live video stream from URL:', cameraStreamUrl);
            }}
          />
        ) : isDemoMode && isStreamActive ? (
          /* High quality simulated subterranean drone HUD camera view */
          <div className="relative w-full h-full min-h-[320px] bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center">
            {/* Tactical Grid Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            {/* Radar Sweep Reticle */}
            <div className="relative w-48 h-48 rounded-full border border-cyan-500/30 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-cyan-500/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-cyan-500/40 animate-ping" />
              </div>
              <div className="absolute w-full h-[1px] bg-cyan-500/20" />
              <div className="absolute h-full w-[1px] bg-cyan-500/20" />
              {/* Corner reticle markers */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* Subterranean Tunnel Hazard Visualizer */}
            <div className="absolute bottom-10 text-center pointer-events-none">
              <span className="font-mono text-xs text-cyan-400/80 uppercase tracking-widest">
                SUBTERRANEAN SHAFT ALPHA-4 • INFRARED OPTICS
              </span>
            </div>
          </div>
        ) : (
          /* Offline Fallback State */
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-mono text-sm font-bold text-slate-300 uppercase">CAMERA OFFLINE — CONNECT A CAMERA</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No active camera feed detected. Configure a stream URL or switch to DEMO MODE to view HUD telemetry.
              </p>
            </div>
            <button
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/20 transition-all"
            >
              CONFIGURE CAMERA URL
            </button>
          </div>
        )}
      </div>

      {/* Bottom HUD Metadata & Controls Overlay */}
      <div className="bg-[#0B0F17]/90 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 text-slate-400">
          <div>
            <span>ALT: </span>
            <span className="text-slate-200 font-bold">14.2m</span>
          </div>
          <div>
            <span>SPD: </span>
            <span className="text-slate-200 font-bold">1.8 m/s</span>
          </div>
          <div>
            <span>PITCH: </span>
            <span className="text-slate-200 font-bold">+2.4°</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span>RES: 1080p @ 30FPS</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">{latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleTimeString() : 'LIVE'}</span>
        </div>
      </div>
    </div>
  );
};
