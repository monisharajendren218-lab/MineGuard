import { SensorData } from '../types/index.js';
import { processSensorTelemetry, validateSensorPayload } from './sensorPipeline.js';

let isDemoMode = true; // Enabled by default so the app works instantly out-of-the-box
let simulationTimer: NodeJS.Timeout | null = null;

// Initial state for demo simulator
let simState = {
  temperature: 31.2,
  humidity: 64.0,
  methane: 1.2,
  carbonMonoxide: 12.0,
  airQuality: 110.0,
  distance: 3.4,
  battery: 92.0,
  latitude: 13.0067,
  longitude: 80.2206,
  cameraOnline: true,
  deviceOnline: true,
  // Mine waypoint navigation path
  waypointIndex: 0,
  isEmergencyActive: false
};

// Mine waypoint trajectory loop
const MINE_WAYPOINTS = [
  { lat: 13.0067, lng: 80.2206 },
  { lat: 13.0071, lng: 80.2212 },
  { lat: 13.0078, lng: 80.2219 },
  { lat: 13.0085, lng: 80.2225 },
  { lat: 13.0080, lng: 80.2231 },
  { lat: 13.0072, lng: 80.2224 }
];

export function getDemoModeStatus(): boolean {
  return isDemoMode;
}

export function setDemoModeStatus(mode: boolean) {
  isDemoMode = mode;
  if (isDemoMode) {
    startDemoSimulation();
  } else {
    stopDemoSimulation();
  }
}

export function startDemoSimulation() {
  if (simulationTimer) return;

  simulationTimer = setInterval(() => {
    if (!isDemoMode) return;

    // Gradual float variations
    if (!simState.isEmergencyActive) {
      simState.temperature += (Math.random() - 0.48) * 0.4;
      simState.humidity += (Math.random() - 0.5) * 0.6;
      simState.methane += (Math.random() - 0.49) * 0.08;
      simState.carbonMonoxide += (Math.random() - 0.48) * 0.8;
      simState.airQuality += (Math.random() - 0.48) * 1.5;
      simState.distance += (Math.random() - 0.5) * 0.3;

      // Keep within realistic normal ranges when not emergency
      simState.temperature = Math.min(Math.max(simState.temperature, 26), 36);
      simState.humidity = Math.min(Math.max(simState.humidity, 45), 85);
      simState.methane = Math.min(Math.max(simState.methane, 0.4), 2.2);
      simState.carbonMonoxide = Math.min(Math.max(simState.carbonMonoxide, 5), 35);
      simState.airQuality = Math.min(Math.max(simState.airQuality, 60), 160);
      simState.distance = Math.min(Math.max(simState.distance, 1.2), 5.5);
    } else {
      // During Emergency simulation, keep metrics high for demonstration
      simState.temperature = 48.5 + (Math.random() - 0.5) * 0.8;
      simState.methane = 5.4 + (Math.random() - 0.5) * 0.3;
      simState.carbonMonoxide = 142.0 + (Math.random() - 0.5) * 5.0;
      simState.distance = 0.35 + (Math.random() - 0.5) * 0.05;
      simState.airQuality = 245.0 + (Math.random() - 0.5) * 10;
    }

    // Battery slowly depletes by 0.1% each step
    simState.battery = Math.max(simState.battery - 0.1, 5.0);
    if (simState.battery <= 5.0) simState.battery = 98.0; // Reset battery when reaching empty in demo

    // Progress waypoint
    const currentWaypoint = MINE_WAYPOINTS[simState.waypointIndex];
    simState.latitude = currentWaypoint.lat + (Math.random() - 0.5) * 0.0001;
    simState.longitude = currentWaypoint.lng + (Math.random() - 0.5) * 0.0001;

    simState.waypointIndex = (simState.waypointIndex + 1) % MINE_WAYPOINTS.length;

    const payload: SensorData = {
      deviceId: 'DRONE-01',
      timestamp: new Date().toISOString(),
      temperature: parseFloat(simState.temperature.toFixed(2)),
      humidity: parseFloat(simState.humidity.toFixed(2)),
      methane: parseFloat(simState.methane.toFixed(2)),
      carbonMonoxide: parseFloat(simState.carbonMonoxide.toFixed(2)),
      airQuality: parseFloat(simState.airQuality.toFixed(2)),
      distance: parseFloat(simState.distance.toFixed(2)),
      battery: parseFloat(simState.battery.toFixed(2)),
      latitude: parseFloat(simState.latitude.toFixed(6)),
      longitude: parseFloat(simState.longitude.toFixed(6)),
      cameraOnline: simState.cameraOnline,
      deviceOnline: simState.deviceOnline
    };

    const validated = validateSensorPayload(payload);
    if (validated) {
      processSensorTelemetry(validated);
    }
  }, 2000);
}

export function stopDemoSimulation() {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
}

/**
 * Triggers an immediate hackathon emergency event
 */
export function triggerSimulatedEmergency() {
  simState.isEmergencyActive = true;
  simState.methane = 5.4;
  simState.temperature = 48.2;
  simState.carbonMonoxide = 138.0;
  simState.distance = 0.38;
  simState.airQuality = 260.0;

  const payload: SensorData = {
    deviceId: 'DRONE-01',
    timestamp: new Date().toISOString(),
    temperature: 48.2,
    humidity: 78.0,
    methane: 5.4,
    carbonMonoxide: 138.0,
    airQuality: 260.0,
    distance: 0.38,
    battery: simState.battery,
    latitude: simState.latitude,
    longitude: simState.longitude,
    cameraOnline: true,
    deviceOnline: true
  };

  const validated = validateSensorPayload(payload);
  if (validated) {
    processSensorTelemetry(validated);
  }

  // Automatically reset emergency state after 45 seconds so normal simulation resumes
  setTimeout(() => {
    simState.isEmergencyActive = false;
    simState.methane = 1.4;
    simState.temperature = 31.5;
    simState.carbonMonoxide = 15.0;
    simState.distance = 2.8;
    simState.airQuality = 115.0;
  }, 45000);
}
