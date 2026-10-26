import React from 'react';
import { useSystem } from '../context/SystemContext';
import { LiveCamera } from '../components/LiveCamera';
import { EmergencyControlBar } from '../components/EmergencyControlBar';
import { SensorCard } from '../components/SensorCard';
import { RealtimeChart } from '../components/RealtimeChart';
import {
  Thermometer,
  Droplets,
  Flame,
  Skull,
  Wind,
  Ruler,
  Battery,
  AlertOctagon,
  CheckCircle2,
  MapPin,
  Cpu,
  Radio
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { latestReading, alerts, settings, droneStatus, acknowledgeAlert, isDemoMode } = useSystem();

  const activeCriticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE');

  // Fallback defaults if latestReading is initializing
  const data = latestReading || {
    deviceId: 'DRONE-01',
    timestamp: new Date().toISOString(),
    temperature: 32.5,
    humidity: 68.0,
    methane: 1.8,
    carbonMonoxide: 12.0,
    airQuality: 145.0,
    distance: 2.4,
    battery: 84.0,
    latitude: 13.0067,
    longitude: 80.2206,
    cameraOnline: true,
    deviceOnline: true
  };

  // Helper status checkers
  const getTempStatus = (val: number) => {
    if (val >= settings.tempCritical) return 'CRITICAL';
    if (val >= settings.tempWarning) return 'WARNING';
    return 'SAFE';
  };

  const getMethaneStatus = (val: number) => {
    if (val >= settings.methaneCritical) return 'CRITICAL';
    if (val >= settings.methaneWarning) return 'WARNING';
    return 'SAFE';
  };

  const getCOStatus = (val: number) => {
    if (val >= settings.coCritical) return 'CRITICAL';
    if (val >= settings.coWarning) return 'WARNING';
    return 'SAFE';
  };

  const getAQIStatus = (val: number) => {
    if (val >= settings.aqiCritical) return 'CRITICAL';
    if (val >= settings.aqiWarning) return 'WARNING';
    return 'NORMAL';
  };

  const getDistanceStatus = (val: number) => {
    if (val <= settings.minDistance) return 'CRITICAL';
    if (val <= settings.minDistance * 1.5) return 'WARNING';
    return 'SAFE';
  };

  const getBatteryStatus = (val: number) => {
    if (val <= settings.lowBattery) return 'CRITICAL';
    if (val <= settings.lowBattery * 1.5) return 'WARNING';
    return 'GOOD';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Critical Emergency Banner (Appears immediately on critical alert) */}
      {activeCriticalAlerts.length > 0 && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-4 shadow-[0_0_30px_rgba(255,51,102,0.4)] animate-glow-danger space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
                <AlertOctagon className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-mono text-base font-extrabold text-red-400 uppercase tracking-wider">
                  🚨 CRITICAL HAZARD ALERT DETECTED
                </h3>
                <p className="text-xs text-red-200">{activeCriticalAlerts[0].message}</p>
              </div>
            </div>
            <button
              onClick={() => acknowledgeAlert(activeCriticalAlerts[0].id)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-lg active:scale-95"
            >
              ACKNOWLEDGE THREAT
            </button>
          </div>
        </div>
      )}

      {/* 2. Emergency Action Panel */}
      <EmergencyControlBar />

      {/* 3. Top Row: Live Camera & Drone Telemetry Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Camera Viewport (2 Columns) */}
        <div className="lg:col-span-2">
          <LiveCamera className="h-full min-h-[380px]" />
        </div>

        {/* Drone Telemetry Status Panel (1 Column) */}
        <div className="space-y-4">
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">DRONE TELEMETRY</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DRONE-01
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">CONNECTION</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CONNECTED
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">BATTERY</span>
                <span className="text-emerald-400 font-bold">{data.battery}%</span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">SIGNAL RSSI</span>
                <span className="text-cyan-400 font-bold">92%</span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">CAMERA</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
            </div>
          </div>

          {/* GPS Location Quick Card */}
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h4 className="font-mono text-xs font-bold text-slate-200 uppercase">GPS COORDINATES</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                GPS: CONNECTED
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-500">LAT: </span>
                <span className="text-slate-200 font-bold">{data.latitude}° N</span>
              </div>
              <div>
                <span className="text-slate-500">LNG: </span>
                <span className="text-slate-200 font-bold">{data.longitude}° E</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Sensor Metrics Cards Grid */}
      <div>
        <h3 className="font-mono text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
          ATMOSPHERIC & ENVIRONMENTAL SENSOR READINGS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperature */}
          <SensorCard
            title="Temperature"
            value={data.temperature}
            unit="°C"
            status={getTempStatus(data.temperature)}
            thresholdText={`< ${settings.tempWarning}°C`}
            icon={Thermometer}
            updatedAt={data.timestamp}
          />

          {/* Methane CH4 */}
          <SensorCard
            title="Methane CH₄"
            value={data.methane}
            unit="%"
            status={getMethaneStatus(data.methane)}
            thresholdText={`< ${settings.methaneWarning}%`}
            icon={Flame}
            updatedAt={data.timestamp}
          />

          {/* Carbon Monoxide CO */}
          <SensorCard
            title="Carbon Monoxide CO"
            value={data.carbonMonoxide}
            unit="ppm"
            status={getCOStatus(data.carbonMonoxide)}
            thresholdText={`< ${settings.coWarning} ppm`}
            icon={Skull}
            updatedAt={data.timestamp}
          />

          {/* Air Quality */}
          <SensorCard
            title="Air Quality AQI"
            value={data.airQuality}
            unit="AQI"
            status={getAQIStatus(data.airQuality)}
            thresholdText={`< ${settings.aqiWarning}`}
            icon={Wind}
            updatedAt={data.timestamp}
          />

          {/* Humidity */}
          <SensorCard
            title="Humidity"
            value={data.humidity}
            unit="%"
            status="NORMAL"
            thresholdText="40 - 80%"
            icon={Droplets}
            updatedAt={data.timestamp}
          />

          {/* Distance */}
          <SensorCard
            title="Proximity Distance"
            value={data.distance}
            unit="m"
            status={getDistanceStatus(data.distance)}
            thresholdText={`> ${settings.minDistance}m`}
            icon={Ruler}
            updatedAt={data.timestamp}
          />

          {/* Battery */}
          <SensorCard
            title="Battery Level"
            value={data.battery}
            unit="%"
            status={getBatteryStatus(data.battery)}
            thresholdText={`> ${settings.lowBattery}%`}
            icon={Battery}
            updatedAt={data.timestamp}
          />
        </div>
      </div>

      {/* 5. Real-Time Telemetry Trend Chart */}
      <RealtimeChart />
    </div>
  );
};
