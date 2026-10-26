import { Router, Request, Response } from 'express';
import {
  getLatestSensorReading,
  getSensorHistory,
  getAlerts,
  updateAlertStatus,
  getSettings,
  updateSettings
} from '../database/db.js';
import { getLatestReading, validateSensorPayload, processSensorTelemetry } from '../services/sensorPipeline.js';
import { getDemoModeStatus, setDemoModeStatus, triggerSimulatedEmergency } from '../services/demoSimulator.js';
import { isMQTTConnected } from '../mqtt/mqttClient.js';
import { broadcast } from '../websocket/wsServer.js';

const router = Router();

// Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    system: 'MineGuard Safety Telemetry Server',
    mqttConnected: isMQTTConnected(),
    demoMode: getDemoModeStatus()
  });
});

// Drone Status
router.get('/drone/status', async (req: Request, res: Response) => {
  const latest = getLatestReading() || (await getLatestSensorReading());
  const isDemo = getDemoModeStatus();

  res.json({
    deviceId: latest?.deviceId || 'DRONE-01',
    connection: latest?.deviceOnline ? 'CONNECTED' : isDemo ? 'CONNECTED' : 'DISCONNECTED',
    battery: latest?.battery || 84,
    signalStrength: isDemo ? 94 : isMQTTConnected() ? 88 : 0,
    cameraStatus: latest?.cameraOnline ? 'ONLINE' : 'OFFLINE',
    gpsStatus: latest?.latitude ? 'CONNECTED' : 'UNAVAILABLE',
    tempSensorStatus: 'ONLINE',
    gasSensorStatus: 'ONLINE',
    lastReceived: latest?.timestamp || null,
    mode: isDemo ? 'DEMO' : 'LIVE'
  });
});

// Latest Sensor Reading
router.get('/sensors/latest', async (req: Request, res: Response) => {
  const latest = getLatestReading() || (await getLatestSensorReading());
  if (!latest) {
    return res.status(444).json({ error: 'No sensor data available yet' });
  }
  res.json(latest);
});

// Historical Sensor Readings
router.get('/sensors/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = await getSensorHistory(limit);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sensor history' });
  }
});

// HTTP POST for direct ESP32 push
router.post('/sensors', async (req: Request, res: Response) => {
  const validated = validateSensorPayload(req.body);
  if (!validated) {
    return res.status(400).json({ error: 'Invalid or malformed sensor payload' });
  }

  // Switch to LIVE mode on direct HTTP push
  setDemoModeStatus(false);
  await processSensorTelemetry(validated);
  res.json({ success: true, timestamp: validated.timestamp });
});

// Alerts List
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const alerts = await getAlerts(limit);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Acknowledge Alert
router.post('/alerts/:id/acknowledge', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req.body;
  try {
    const updated = await updateAlertStatus(id, 'ACKNOWLEDGED', user || 'Rescue Operator');
    if (!updated) return res.status(404).json({ error: 'Alert not found' });

    broadcast({ type: 'ALERT_UPDATE', payload: updated });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Resolve Alert
router.post('/alerts/:id/resolve', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await updateAlertStatus(id, 'RESOLVED');
    if (!updated) return res.status(404).json({ error: 'Alert not found' });

    broadcast({ type: 'ALERT_UPDATE', payload: updated });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Settings GET
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Settings PUT
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const updated = await updateSettings(req.body);
    broadcast({ type: 'SETTINGS_UPDATE', payload: updated });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Toggle Demo/Live Mode
router.post('/demo/mode', (req: Request, res: Response) => {
  const { enabled } = req.body;
  const isDemo = Boolean(enabled);
  setDemoModeStatus(isDemo);
  broadcast({ type: 'MODE_UPDATE', payload: { isDemoMode: isDemo } });
  res.json({ success: true, isDemoMode: isDemo });
});

// Trigger Emergency Simulation
router.post('/demo/emergency', (req: Request, res: Response) => {
  triggerSimulatedEmergency();
  broadcast({ type: 'EMERGENCY_TRIGGERED', payload: { timestamp: new Date().toISOString() } });
  res.json({ success: true, message: 'Emergency simulation triggered' });
});

// CSV Export
router.get('/export/csv', async (req: Request, res: Response) => {
  try {
    const history = await getSensorHistory(1000);
    let csv =
      'Timestamp,Device ID,Temperature (°C),Humidity (%),Methane (%),CO (ppm),Air Quality (AQI),Distance (m),Battery (%),Latitude,Longitude\n';

    history.forEach((row) => {
      csv += `"${row.timestamp}","${row.deviceId}",${row.temperature},${row.humidity},${row.methane},${row.carbonMonoxide},${row.airQuality},${row.distance},${row.battery},${row.latitude},${row.longitude}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mineguard_sensor_log_${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

export default router;
