import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  Activity,
  Thermometer,
  Flame,
  Skull,
  Wind,
  Ruler,
  Navigation,
  Battery,
  Layers,
  Cpu
} from 'lucide-react';

export const SensorsPage: React.FC = () => {
  const { latestReading, settings } = useSystem();

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

  const sensorSpecs = [
    {
      name: 'Temperature & Humidity',
      chip: 'DHT22 / BME280',
      pin: 'GPIO 4 (I2C/Digital)',
      value: `${data.temperature} °C / ${data.humidity} %`,
      status: data.temperature >= settings.tempCritical ? 'CRITICAL' : data.temperature >= settings.tempWarning ? 'WARNING' : 'SAFE',
      limit: `Warning: ${settings.tempWarning}°C | Crit: ${settings.tempCritical}°C`,
      icon: Thermometer,
      desc: 'Ambient temperature and relative atmospheric humidity level in subterranean shaft.'
    },
    {
      name: 'Methane Gas Concentration',
      chip: 'MQ-4 Semiconductor',
      pin: 'GPIO 34 (ADC1_CH6)',
      value: `${data.methane} %`,
      status: data.methane >= settings.methaneCritical ? 'CRITICAL' : data.methane >= settings.methaneWarning ? 'WARNING' : 'SAFE',
      limit: `Warning: ${settings.methaneWarning}% | Crit: ${settings.methaneCritical}%`,
      icon: Flame,
      desc: 'Flammable CH4 methane gas detection to prevent explosive underground ignition.'
    },
    {
      name: 'Carbon Monoxide Toxic Gas',
      chip: 'MQ-7 Semiconductor',
      pin: 'GPIO 35 (ADC1_CH7)',
      value: `${data.carbonMonoxide} ppm`,
      status: data.carbonMonoxide >= settings.coCritical ? 'CRITICAL' : data.carbonMonoxide >= settings.coWarning ? 'WARNING' : 'SAFE',
      limit: `Warning: ${settings.coWarning} ppm | Crit: ${settings.coCritical} ppm`,
      icon: Skull,
      desc: 'Toxic odorless CO detection protecting miners from lethal asphyxiation.'
    },
    {
      name: 'Air Quality Index',
      chip: 'MQ-135 Gas Sensor',
      pin: 'GPIO 32 (ADC1_CH4)',
      value: `${data.airQuality} AQI`,
      status: data.airQuality >= settings.aqiCritical ? 'CRITICAL' : data.airQuality >= settings.aqiWarning ? 'WARNING' : 'NORMAL',
      limit: `Warning: ${settings.aqiWarning} | Crit: ${settings.aqiCritical}`,
      icon: Wind,
      desc: 'Broad spectrum air pollution, smoke, ammonia, and particulate index.'
    },
    {
      name: 'Ultrasonic Obstacle Proximity',
      chip: 'HC-SR04 Transceiver',
      pin: 'Trig: GPIO 12 / Echo: GPIO 14',
      value: `${data.distance} m`,
      status: data.distance <= settings.minDistance ? 'CRITICAL' : 'SAFE',
      limit: `Min Limit: ${settings.minDistance} m`,
      icon: Ruler,
      desc: 'High-precision distance measurement for tunnel wall collision avoidance.'
    },
    {
      name: 'Motion & Gyro Telemetry',
      chip: 'MPU6050 6-Axis IMU',
      pin: 'GPIO 21 (SDA) / GPIO 22 (SCL)',
      value: 'Pitch: +2.4° | Roll: -0.8°',
      status: 'SAFE',
      limit: 'Max Tilt Limit: 45.0°',
      icon: Layers,
      desc: 'Orientation, stabilization, and impact detection telemetry.'
    },
    {
      name: 'GPS Geo-Positioning',
      chip: 'NEO-6M GPS Module',
      pin: 'UART2 (RX2: GPIO 16 / TX2: GPIO 17)',
      value: `${data.latitude}° N, ${data.longitude}° E`,
      status: 'SAFE',
      limit: 'Subterranean Lock Active',
      icon: Navigation,
      desc: 'Real-time surface and shaft coordinates for rescue team deployment.'
    },
    {
      name: 'Battery Voltage Monitor',
      chip: 'Divider Network ADC',
      pin: 'GPIO 33 (ADC1_CH5)',
      value: `${data.battery} %`,
      status: data.battery <= settings.lowBattery ? 'WARNING' : 'GOOD',
      limit: `Low Battery Cutoff: ${settings.lowBattery}%`,
      icon: Battery,
      desc: 'Main flight battery voltage monitoring for automated return-to-home.'
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            DETAILED HARDWARE SENSORS MONITORING
          </h2>
          <p className="text-xs text-slate-400">ESP32 telemetry channels and hardware safety thresholds</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>8 HARDWARE CHANNELS ACTIVE</span>
        </div>
      </div>

      {/* Hardware Sensors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensorSpecs.map((spec, idx) => {
          const Icon = spec.icon;
          return (
            <div
              key={idx}
              className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      spec.status === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-glow-danger'
                        : spec.status === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {spec.status}
                  </span>
                </div>

                <h3 className="font-mono text-sm font-bold text-white uppercase">{spec.name}</h3>
                <p className="text-[11px] text-cyan-400 font-mono font-semibold">{spec.chip}</p>
                <p className="text-[10px] text-slate-500 font-mono">{spec.pin}</p>

                <div className="my-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="font-mono text-xl font-black text-white">{spec.value}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{spec.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                <span>{spec.limit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
