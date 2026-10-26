import { SensorData, Alert, ThresholdSettings } from '../types/index.js';
import { saveSensorReading, saveAlert, getSettings } from '../database/db.js';

let latestSensorReading: SensorData | null = null;
let activeAlerts: Map<string, Alert> = new Map();
let onBroadcastCallback: ((message: any) => void) | null = null;

export function setBroadcastCallback(cb: (message: any) => void) {
  onBroadcastCallback = cb;
}

export function getLatestReading(): SensorData | null {
  return latestSensorReading;
}

export function getActiveAlertsMap(): Alert[] {
  return Array.from(activeAlerts.values());
}

/**
 * Validates incoming payload from ESP32 or Demo Simulator
 */
export function validateSensorPayload(raw: any): SensorData | null {
  if (!raw || typeof raw !== 'object') return null;

  const deviceId = typeof raw.deviceId === 'string' ? raw.deviceId : 'DRONE-01';
  const timestamp = typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString();

  // Validate numbers and reject NaN/Infinity or absurd values
  const sanitizeNum = (val: any, fallback: number, min: number, max: number): number => {
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) return fallback;
    return Math.min(Math.max(num, min), max);
  };

  const temperature = sanitizeNum(raw.temperature, 25.0, -40, 100);
  const humidity = sanitizeNum(raw.humidity, 50.0, 0, 100);
  const methane = sanitizeNum(raw.methane, 0.5, 0, 100);
  const carbonMonoxide = sanitizeNum(raw.carbonMonoxide, 10.0, 0, 1000);
  const airQuality = sanitizeNum(raw.airQuality, 80.0, 0, 500);
  const distance = sanitizeNum(raw.distance, 3.0, 0, 20);
  const battery = sanitizeNum(raw.battery, 100.0, 0, 100);
  const latitude = sanitizeNum(raw.latitude, 13.0067, -90, 90);
  const longitude = sanitizeNum(raw.longitude, 80.2206, -180, 180);

  return {
    deviceId,
    timestamp,
    temperature: parseFloat(temperature.toFixed(2)),
    humidity: parseFloat(humidity.toFixed(2)),
    methane: parseFloat(methane.toFixed(2)),
    carbonMonoxide: parseFloat(carbonMonoxide.toFixed(2)),
    airQuality: parseFloat(airQuality.toFixed(2)),
    distance: parseFloat(distance.toFixed(2)),
    battery: parseFloat(battery.toFixed(2)),
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6)),
    cameraOnline: raw.cameraOnline !== undefined ? Boolean(raw.cameraOnline) : true,
    deviceOnline: raw.deviceOnline !== undefined ? Boolean(raw.deviceOnline) : true
  };
}

/**
 * Process normalized sensor telemetry, check safety thresholds, save to DB, and broadcast
 */
export async function processSensorTelemetry(data: SensorData): Promise<void> {
  latestSensorReading = data;

  // 1. Save reading to DB
  try {
    await saveSensorReading(data);
  } catch (err) {
    console.error('Failed to save sensor reading:', err);
  }

  // 2. Fetch active threshold configurations
  let settings: ThresholdSettings;
  try {
    settings = await getSettings();
  } catch {
    settings = {
      tempWarning: 40,
      tempCritical: 45,
      methaneWarning: 2.0,
      methaneCritical: 4.0,
      coWarning: 50,
      coCritical: 100,
      aqiWarning: 150,
      aqiCritical: 200,
      minDistance: 0.5,
      lowBattery: 20
    };
  }

  // 3. Evaluate Alerts
  const detectedAlerts: Alert[] = [];

  // Methane Check
  if (data.methane >= settings.methaneCritical) {
    detectedAlerts.push(
      createAlert(
        data,
        'GAS_LEAK',
        'Methane CH₄',
        data.methane,
        '%',
        settings.methaneCritical,
        'CRITICAL',
        `🚨 CRITICAL METHANE LEAK: ${data.methane}% CH₄ detected in mining shaft!`
      )
    );
  } else if (data.methane >= settings.methaneWarning) {
    detectedAlerts.push(
      createAlert(
        data,
        'GAS_WARNING',
        'Methane CH₄',
        data.methane,
        '%',
        settings.methaneWarning,
        'WARNING',
        `⚠ HIGH METHANE CONCENTRATION: ${data.methane}% CH₄ exceeds safety warning.`
      )
    );
  }

  // Carbon Monoxide Check
  if (data.carbonMonoxide >= settings.coCritical) {
    detectedAlerts.push(
      createAlert(
        data,
        'CO_CRITICAL',
        'Carbon Monoxide CO',
        data.carbonMonoxide,
        'ppm',
        settings.coCritical,
        'CRITICAL',
        `🚨 HAZARDOUS CARBON MONOXIDE: ${data.carbonMonoxide} ppm CO levels dangerous to life!`
      )
    );
  } else if (data.carbonMonoxide >= settings.coWarning) {
    detectedAlerts.push(
      createAlert(
        data,
        'CO_WARNING',
        'Carbon Monoxide CO',
        data.carbonMonoxide,
        'ppm',
        settings.coWarning,
        'WARNING',
        `⚠ ELEVATED CO LEVEL: ${data.carbonMonoxide} ppm CO detected.`
      )
    );
  }

  // Temperature Check
  if (data.temperature >= settings.tempCritical) {
    detectedAlerts.push(
      createAlert(
        data,
        'HIGH_TEMP_CRITICAL',
        'Temperature',
        data.temperature,
        '°C',
        settings.tempCritical,
        'CRITICAL',
        `🚨 CRITICAL OVERHEAT: Ambient temperature ${data.temperature}°C critical limit!`
      )
    );
  } else if (data.temperature >= settings.tempWarning) {
    detectedAlerts.push(
      createAlert(
        data,
        'HIGH_TEMP_WARNING',
        'Temperature',
        data.temperature,
        '°C',
        settings.tempWarning,
        'WARNING',
        `⚠ HIGH TEMPERATURE: Tunnel temperature reached ${data.temperature}°C.`
      )
    );
  }

  // Obstacle Distance Check
  if (data.distance <= settings.minDistance && data.distance > 0) {
    detectedAlerts.push(
      createAlert(
        data,
        'OBSTACLE_COLLISION',
        'Distance',
        data.distance,
        'm',
        settings.minDistance,
        'WARNING',
        `⚠ PROXIMITY OBSTACLE: Wall/Obstacle detected at ${data.distance}m!`
      )
    );
  }

  // Battery Check
  if (data.battery <= settings.lowBattery) {
    detectedAlerts.push(
      createAlert(
        data,
        'LOW_BATTERY',
        'Battery',
        data.battery,
        '%',
        settings.lowBattery,
        'WARNING',
        `🔋 LOW DRONE BATTERY: Power level down to ${data.battery}%. Return to base soon.`
      )
    );
  }

  // Save new alerts to DB and active map
  for (const alert of detectedAlerts) {
    const existing = activeAlerts.get(alert.type);
    if (!existing || existing.status === 'RESOLVED') {
      activeAlerts.set(alert.type, alert);
      await saveAlert(alert);

      // Broadcast alert notification
      if (onBroadcastCallback) {
        onBroadcastCallback({
          type: 'ALERT_NEW',
          payload: alert
        });
      }
    }
  }

  // 4. Broadcast updated telemetry to WebSocket clients
  if (onBroadcastCallback) {
    onBroadcastCallback({
      type: 'TELEMETRY_UPDATE',
      payload: data
    });
  }
}

function createAlert(
  data: SensorData,
  type: string,
  sensor: string,
  value: number,
  unit: string,
  threshold: number,
  severity: 'CRITICAL' | 'WARNING' | 'INFO',
  message: string
): Alert {
  return {
    id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    droneId: data.deviceId,
    timestamp: new Date().toISOString(),
    type,
    sensor,
    value,
    unit,
    threshold,
    severity,
    status: 'ACTIVE',
    message,
    location: {
      latitude: data.latitude,
      longitude: data.longitude
    }
  };
}
