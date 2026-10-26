import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SensorData, Alert, ThresholdSettings, DroneStatus, User, UserRole } from '../types';
import { playEmergencySiren } from '../utils/audioAlert';

interface SystemContextType {
  latestReading: SensorData | null;
  sensorHistory: SensorData[];
  alerts: Alert[];
  settings: ThresholdSettings;
  droneStatus: DroneStatus;
  isDemoMode: boolean;
  isWebSocketConnected: boolean;
  isAudioMuted: boolean;
  currentUser: User;
  cameraStreamUrl: string;
  activeTab: string;
  lastReceivedSecondsAgo: number;

  // Actions
  toggleDemoMode: (enabled: boolean) => void;
  triggerEmergency: () => void;
  toggleAudioMute: () => void;
  setCameraStreamUrl: (url: string) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  updateSettings: (newSettings: Partial<ThresholdSettings>) => Promise<void>;
  setCurrentUserRole: (role: UserRole) => void;
  setActiveTab: (tab: string) => void;
  exportCSV: () => void;
}

const DEFAULT_SETTINGS: ThresholdSettings = {
  tempWarning: 40.0,
  tempCritical: 45.0,
  methaneWarning: 2.0,
  methaneCritical: 4.0,
  coWarning: 50.0,
  coCritical: 100.0,
  aqiWarning: 150.0,
  aqiCritical: 200.0,
  minDistance: 0.5,
  lowBattery: 20.0
};

const DEFAULT_DRONE_STATUS: DroneStatus = {
  deviceId: 'DRONE-01',
  connection: 'CONNECTED',
  battery: 84,
  signalStrength: 94,
  cameraStatus: 'ONLINE',
  gpsStatus: 'CONNECTED',
  tempSensorStatus: 'ONLINE',
  gasSensorStatus: 'ONLINE',
  lastReceived: null,
  mode: 'DEMO'
};

const DEFAULT_USER: User = {
  id: 'usr-1',
  name: 'Chief Rescue Operator',
  role: 'RESCUE_OPERATOR',
  email: 'operator@mineguard.safety'
};

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [latestReading, setLatestReading] = useState<SensorData | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettingsState] = useState<ThresholdSettings>(DEFAULT_SETTINGS);
  const [droneStatus, setDroneStatus] = useState<DroneStatus>(DEFAULT_DRONE_STATUS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [cameraStreamUrl, setCameraStreamUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lastReceivedTimestamp, setLastReceivedTimestamp] = useState<number | null>(null);
  const [lastReceivedSecondsAgo, setLastReceivedSecondsAgo] = useState<number>(0);

  // Reconnectable WebSocket Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: NodeJS.Timeout | null = null;

    const connectWS = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname;
      const wsPort = '5000';
      const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsWebSocketConnected(true);
        console.log('⚡ Connected to MineGuard WebSocket Server.');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const now = Date.now();

          switch (msg.type) {
            case 'INIT_STATE':
              if (msg.payload.latestReading) {
                setLatestReading(msg.payload.latestReading);
                setLastReceivedTimestamp(now);
              }
              if (msg.payload.activeAlerts) setAlerts(msg.payload.activeAlerts);
              if (msg.payload.settings) setSettingsState(msg.payload.settings);
              if (msg.payload.droneStatus) setDroneStatus(msg.payload.droneStatus);
              if (msg.payload.isDemoMode !== undefined) setIsDemoMode(msg.payload.isDemoMode);
              break;

            case 'TELEMETRY_UPDATE':
              const newReading: SensorData = msg.payload;
              setLatestReading(newReading);
              setLastReceivedTimestamp(now);
              setSensorHistory((prev) => {
                const next = [...prev, newReading];
                return next.slice(-60); // Keep last 60 points for charts
              });
              setDroneStatus((prev) => ({
                ...prev,
                battery: newReading.battery,
                lastReceived: newReading.timestamp,
                connection: newReading.deviceOnline ? 'CONNECTED' : 'DISCONNECTED',
                cameraStatus: newReading.cameraOnline ? 'ONLINE' : 'OFFLINE'
              }));
              break;

            case 'ALERT_NEW':
              const newAlert: Alert = msg.payload;
              setAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
              if (newAlert.severity === 'CRITICAL') {
                playEmergencySiren(isAudioMuted);
              }
              break;

            case 'ALERT_UPDATE':
              const updatedAlert: Alert = msg.payload;
              setAlerts((prev) => prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a)));
              break;

            case 'MODE_UPDATE':
              setIsDemoMode(Boolean(msg.payload.isDemoMode));
              setDroneStatus((prev) => ({
                ...prev,
                mode: msg.payload.isDemoMode ? 'DEMO' : 'LIVE'
              }));
              break;

            case 'SETTINGS_UPDATE':
              setSettingsState(msg.payload);
              break;

            case 'EMERGENCY_TRIGGERED':
              playEmergencySiren(isAudioMuted);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsWebSocketConnected(false);
        console.warn('WebSocket connection lost. Retrying in 3 seconds...');
        timer = setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        ws?.close();
      };
    };

    connectWS();

    return () => {
      if (timer) clearTimeout(timer);
      ws?.close();
    };
  }, [isAudioMuted]);

  // Second timer count-up for LAST DATA RECEIVED
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastReceivedTimestamp) {
        const diffSec = Math.floor((Date.now() - lastReceivedTimestamp) / 1000);
        setLastReceivedSecondsAgo(diffSec);
      } else {
        setLastReceivedSecondsAgo(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastReceivedTimestamp]);

  // Actions
  const toggleDemoMode = useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
    fetch('/api/demo/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    }).catch(console.error);
  }, []);

  const triggerEmergency = useCallback(() => {
    fetch('/api/demo/emergency', { method: 'POST' }).catch(console.error);
  }, []);

  const toggleAudioMute = useCallback(() => {
    setIsAudioMuted((prev) => !prev);
  }, []);

  const acknowledgeAlert = useCallback(
    (id: string) => {
      fetch(`/api/alerts/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser.name })
      })
        .then((res) => res.json())
        .then((updated) => {
          setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        })
        .catch(console.error);
    },
    [currentUser.name]
  );

  const resolveAlert = useCallback((id: string) => {
    fetch(`/api/alerts/${id}/resolve`, { method: 'POST' })
      .then((res) => res.json())
      .then((updated) => {
        setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      })
      .catch(console.error);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<ThresholdSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      setSettingsState(data);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  }, []);

  const setCurrentUserRole = useCallback((role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name:
        role === 'ADMIN'
          ? 'System Administrator'
          : role === 'RESCUE_OPERATOR'
          ? 'Chief Rescue Operator'
          : 'Inspection Viewer'
    }));
  }, []);

  const exportCSV = useCallback(() => {
    window.location.href = '/api/export/csv';
  }, []);

  return (
    <SystemContext.Provider
      value={{
        latestReading,
        sensorHistory,
        alerts,
        settings,
        droneStatus,
        isDemoMode,
        isWebSocketConnected,
        isAudioMuted,
        currentUser,
        cameraStreamUrl,
        activeTab,
        lastReceivedSecondsAgo,
        toggleDemoMode,
        triggerEmergency,
        toggleAudioMute,
        setCameraStreamUrl,
        acknowledgeAlert,
        resolveAlert,
        updateSettings,
        setCurrentUserRole,
        setActiveTab,
        exportCSV
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
