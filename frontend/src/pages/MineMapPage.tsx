import React from 'react';
import { useSystem } from '../context/SystemContext';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, Compass } from 'lucide-react';

export const MineMapPage: React.FC = () => {
  const { latestReading, isDemoMode, alerts } = useSystem();

  const lat = latestReading?.latitude || 13.0067;
  const lng = latestReading?.longitude || 80.2206;

  const isGPSConnected = Boolean(latestReading?.latitude);

  const dangerZones = [
    { name: 'Ventilation Shaft B-2', risk: 'HIGH METHANE VENTING', status: 'HAZARD', coordinates: '13.0078° N, 80.2219° E' },
    { name: 'Subterranean Gallery 4', risk: 'COLLAPSE RISK / HIGH TEMP', status: 'WARNING', coordinates: '13.0085° N, 80.2225° E' },
    { name: 'Rescue Safe Station 1', risk: 'AIR PURIFIED O2 HUB', status: 'SAFE', coordinates: '13.0065° N, 80.2202° E' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            TACTICAL MINE MAP & DRONE POSITIONING
          </h2>
          <p className="text-xs text-slate-400">Underground tunnel geofencing and live trajectory tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
              isGPSConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {isGPSConnected ? 'GPS: CONNECTED' : 'GPS: UNAVAILABLE'}
          </span>

          {isDemoMode && (
            <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              SIMULATED GPS TRAJECTORY
            </span>
          )}
        </div>
      </div>

      {/* Map Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Tactical Map Container (2 Columns) */}
        <div className="lg:col-span-2 bg-[#090D14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[460px] flex flex-col justify-between p-4">
          {/* Tactical Background Grid & Subterranean Schematic Canvas */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Subterranean Shaft Vectors overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none stroke-cyan-500/40 fill-none stroke-[2]">
            <path d="M 50 100 Q 200 150 400 220 T 700 350" strokeDasharray="5,5" />
            <circle cx="200" cy="150" r="40" className="stroke-red-500/60 fill-red-500/10" />
            <circle cx="400" cy="220" r="30" className="stroke-amber-500/60 fill-amber-500/10" />
            <circle cx="700" cy="350" r="25" className="stroke-emerald-500/60 fill-emerald-500/10" />
          </svg>

          {/* Map Header Overlay */}
          <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span className="font-bold">GRID SECTOR: ALPHA-7 (MINE DEEP LEVEL 3)</span>
            </div>
            <div className="font-mono text-xs text-slate-300">
              <span>DRONE LOC: </span>
              <span className="text-cyan-400 font-bold">{lat.toFixed(6)}° N, {lng.toFixed(6)}° E</span>
            </div>
          </div>

          {/* Central Animated Drone Target Marker */}
          <div className="relative z-10 my-auto text-center space-y-2 py-16">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-75" />
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6)]">
                <Navigation className="w-6 h-6 rotate-45" />
              </div>
            </div>
            <div className="inline-block px-3 py-1 rounded-lg bg-black/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
              🛸 DRONE-01 TELEMETRY LOCK
            </div>
          </div>

          {/* Map Footer Overlay */}
          <div className="relative z-10 bg-black/60 backdrop-blur p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SCALE: 1:500m</span>
            <span>ALTITUDE: -140m BELOW SURFACE</span>
            <span className="text-emerald-400">BEACON SIGNAL: 100%</span>
          </div>
        </div>

        {/* Danger Zones & Map Legend Panel (1 Column) */}
        <div className="space-y-4">
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              SUBTERRANEAN HAZARD ZONES
            </h3>

            <div className="space-y-3">
              {dangerZones.map((zone, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-200">{zone.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        zone.status === 'HAZARD'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : zone.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {zone.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{zone.risk}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{zone.coordinates}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs font-mono">
            <h4 className="font-bold text-slate-300 uppercase border-b border-slate-800 pb-2">MAP SYMBOL LEGEND</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
                <span>Active Drone Telemetry Target</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#FF3366]" />
                <span>Critical Gas / Overheat Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Purified Oxygen Rescue Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
