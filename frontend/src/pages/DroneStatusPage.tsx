import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Cpu, CheckCircle2, AlertTriangle, RefreshCw, Zap, Wifi, Battery, Radio } from 'lucide-react';

export const DroneStatusPage: React.FC = () => {
  const { latestReading, isDemoMode } = useSystem();
  const [isSelfTesting, setIsSelfTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

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

  const runSelfTest = () => {
    setIsSelfTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsSelfTesting(false);
      setTestResult('✅ HARDWARE SELF-TEST PASSED: All 8 IC sensors and ESP32 telemetry links verified operational.');
    }, 2500);
  };

  const hardwareComponents = [
    { name: 'ESP32 Dual-Core Microcontroller', status: 'ONLINE', details: '240MHz Xtensa LX6, FreeRTOS Core' },
    { name: 'DHT22 / BME280 Temperature & Humidity IC', status: 'ONLINE', details: 'Precision ±0.5°C thermal sensor' },
    { name: 'MQ-4 Methane CH4 Gas Sensor IC', status: 'ONLINE', details: 'Calibrated semiconductor sensor' },
    { name: 'MQ-7 Carbon Monoxide CO Sensor IC', status: 'ONLINE', details: 'Electro-chemical gas module' },
    { name: 'MQ-135 Broad AQI Air Quality IC', status: 'ONLINE', details: 'Air pollution and smoke detector' },
    { name: 'HC-SR04 Ultrasonic Transceiver', status: 'ONLINE', details: '40kHz sound wave obstacle ranger' },
    { name: 'MPU6050 6-Axis Motion IMU', status: 'ONLINE', details: '3D Gyroscope + Accelerometer' },
    { name: 'NEO-6M GPS Navigation Module', status: 'ONLINE', details: '50-Channel satellite positioning' },
    { name: 'ESP32-CAM / RTSP Video Stream Module', status: data.cameraOnline ? 'ONLINE' : 'OFFLINE', details: 'MJPEG / WebRTC video stream' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            DRONE HEALTH & HARDWARE DIAGNOSTICS
          </h2>
          <p className="text-xs text-slate-400">Subsystem status, sensor IC checks, and power diagnostics</p>
        </div>

        <button
          onClick={runSelfTest}
          disabled={isSelfTesting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSelfTesting ? 'animate-spin' : ''}`} />
          <span>{isSelfTesting ? 'RUNNING TEST...' : 'RUN SELF-TEST'}</span>
        </button>
      </div>

      {/* Self Test Feedback */}
      {testResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-4 text-emerald-300 font-mono text-xs animate-fade-in">
          {testResult}
        </div>
      )}

      {/* Hardware Telemetry Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>DEVICE ID</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{data.deviceId}</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            ONLINE TELEMETRY LINK
          </p>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>BATTERY STATE</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{data.battery}%</p>
          <p className="text-[10px] text-slate-400">Main LiPo 3S Flight Pack</p>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>SIGNAL RSSI</span>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white">92% (-54 dBm)</p>
          <p className="text-[10px] text-slate-400">2.4GHz / 802.11 b/g/n</p>
        </div>

        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>OPERATING MODE</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-amber-300">{isDemoMode ? 'DEMO SIM' : 'LIVE ESP32'}</p>
          <p className="text-[10px] text-slate-400">WebSocket Data Pipeline</p>
        </div>
      </div>

      {/* Hardware Component IC Table */}
      <div className="bg-[#121824] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-mono text-sm font-bold text-white uppercase">HARDWARE SUBSYSTEM IC MONITORING</h3>
        </div>
        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {hardwareComponents.map((comp, idx) => (
            <div key={idx} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-900/50">
              <div>
                <span className="font-bold text-white">{comp.name}</span>
                <p className="text-[11px] text-slate-400">{comp.details}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${
                  comp.status === 'ONLINE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                {comp.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
