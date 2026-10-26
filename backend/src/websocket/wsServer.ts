import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { WSMessage, DroneStatus } from '../types/index.js';
import { getLatestReading, setBroadcastCallback, getActiveAlertsMap } from '../services/sensorPipeline.js';
import { getDemoModeStatus, setDemoModeStatus, triggerSimulatedEmergency } from '../services/demoSimulator.js';
import { updateAlertStatus, getAlerts, getSettings } from '../database/db.js';
import { isMQTTConnected } from '../mqtt/mqttClient.js';

let wss: WebSocketServer | null = null;
const clients: Set<WebSocket> = new Set();

export function initWebSocketServer(server: HTTPServer) {
  wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: WebSocket) => {
    clients.add(ws);
    console.log(`🔌 Client connected to WebSocket. Total clients: ${clients.size}`);

    // Send initial system state immediately upon client connection
    try {
      const latestReading = getLatestReading();
      const activeAlerts = getActiveAlertsMap();
      const settings = await getSettings();
      const isDemo = getDemoModeStatus();

      const droneStatus: DroneStatus = {
        deviceId: latestReading?.deviceId || 'DRONE-01',
        connection: latestReading?.deviceOnline ? 'CONNECTED' : isDemo ? 'CONNECTED' : 'DISCONNECTED',
        battery: latestReading?.battery || 84,
        signalStrength: isDemo ? 92 : isMQTTConnected() ? 88 : 0,
        cameraStatus: latestReading?.cameraOnline ? 'ONLINE' : 'OFFLINE',
        gpsStatus: latestReading?.latitude ? 'CONNECTED' : 'UNAVAILABLE',
        tempSensorStatus: 'ONLINE',
        gasSensorStatus: 'ONLINE',
        lastReceived: latestReading?.timestamp || null,
        mode: isDemo ? 'DEMO' : 'LIVE'
      };

      ws.send(
        JSON.stringify({
          type: 'INIT_STATE',
          payload: {
            latestReading,
            activeAlerts,
            settings,
            droneStatus,
            isDemoMode: isDemo
          }
        })
      );
    } catch (err) {
      console.error('Error sending initial WS state:', err);
    }

    // Handle incoming client messages
    ws.on('message', async (message: string) => {
      try {
        const msg: WSMessage = JSON.parse(message.toString());
        switch (msg.type) {
          case 'MODE_UPDATE':
            setDemoModeStatus(Boolean(msg.payload.isDemoMode));
            broadcast({
              type: 'MODE_UPDATE',
              payload: { isDemoMode: Boolean(msg.payload.isDemoMode) }
            });
            break;

          case 'EMERGENCY_TRIGGERED':
            triggerSimulatedEmergency();
            broadcast({
              type: 'EMERGENCY_TRIGGERED',
              payload: { timestamp: new Date().toISOString() }
            });
            break;

          case 'ALERT_UPDATE':
            const { id, status, byUser } = msg.payload;
            const updated = await updateAlertStatus(id, status, byUser);
            if (updated) {
              broadcast({
                type: 'ALERT_UPDATE',
                payload: updated
              });
            }
            break;
        }
      } catch (err) {
        console.error('Failed to parse WS client message:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`🔌 Client disconnected. Remaining clients: ${clients.size}`);
    });
  });

  // Register sensor pipeline broadcast callback
  setBroadcastCallback((message: any) => {
    broadcast(message);
  });
}

export function broadcast(message: any) {
  const jsonStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  });
}
