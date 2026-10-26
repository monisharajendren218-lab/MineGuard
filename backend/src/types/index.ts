export interface SensorData {
  deviceId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  methane: number;
  carbonMonoxide: number;
  airQuality: number;
  distance: number;
  battery: number;
  latitude: number;
  longitude: number;
  cameraOnline: boolean;
  deviceOnline: boolean;
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  droneId: string;
  timestamp: string;
  type: string;
  sensor: string;
  value: number;
  unit: string;
  threshold: number;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface ThresholdSettings {
  tempWarning: number;
  tempCritical: number;
  methaneWarning: number;
  methaneCritical: number;
  coWarning: number;
  coCritical: number;
  aqiWarning: number;
  aqiCritical: number;
  minDistance: number;
  lowBattery: number;
}

export interface DroneStatus {
  deviceId: string;
  connection: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
  battery: number;
  signalStrength: number; // RSSI percentage
  cameraStatus: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  gpsStatus: 'CONNECTED' | 'UNAVAILABLE';
  tempSensorStatus: 'ONLINE' | 'FAULT';
  gasSensorStatus: 'ONLINE' | 'FAULT';
  lastReceived: string | null;
  mode: 'LIVE' | 'DEMO';
}

export interface WSMessage {
  type:
    | 'TELEMETRY_UPDATE'
    | 'ALERT_NEW'
    | 'ALERT_UPDATE'
    | 'STATUS_UPDATE'
    | 'SETTINGS_UPDATE'
    | 'MODE_UPDATE'
    | 'EMERGENCY_TRIGGERED';
  payload: any;
}
