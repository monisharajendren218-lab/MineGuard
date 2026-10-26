import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { SensorData, Alert, ThresholdSettings } from '../types/index.js';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'mineguard.db');
const db = new sqlite3.Database(dbPath);

export function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Sensor Readings Table
      db.run(`
        CREATE TABLE IF NOT EXISTS sensor_readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          deviceId TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          temperature REAL,
          humidity REAL,
          methane REAL,
          carbonMonoxide REAL,
          airQuality REAL,
          distance REAL,
          battery REAL,
          latitude REAL,
          longitude REAL,
          cameraOnline INTEGER,
          deviceOnline INTEGER
        )
      `);

      // 2. Alerts Table
      db.run(`
        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          droneId TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          type TEXT NOT NULL,
          sensor TEXT NOT NULL,
          value REAL NOT NULL,
          unit TEXT NOT NULL,
          threshold REAL NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL,
          message TEXT NOT NULL,
          latitude REAL,
          longitude REAL,
          acknowledgedBy TEXT,
          acknowledgedAt TEXT,
          resolvedAt TEXT
        )
      `);

      // 3. Settings Table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Seed Default Threshold Settings if empty
      db.get(`SELECT COUNT(*) as count FROM settings`, (err, row: any) => {
        if (err) return reject(err);
        if (row.count === 0) {
          const defaultSettings: ThresholdSettings = {
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

          const stmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`);
          for (const [k, v] of Object.entries(defaultSettings)) {
            stmt.run(k, JSON.stringify(v));
          }
          stmt.finalize();
        }
        resolve();
      });
    });
  });
}

export function saveSensorReading(data: SensorData): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO sensor_readings (deviceId, timestamp, temperature, humidity, methane, carbonMonoxide, airQuality, distance, battery, latitude, longitude, cameraOnline, deviceOnline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.deviceId,
        data.timestamp,
        data.temperature,
        data.humidity,
        data.methane,
        data.carbonMonoxide,
        data.airQuality,
        data.distance,
        data.battery,
        data.latitude,
        data.longitude,
        data.cameraOnline ? 1 : 0,
        data.deviceOnline ? 1 : 0
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export function getLatestSensorReading(deviceId: string = 'DRONE-01'): Promise<SensorData | null> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM sensor_readings WHERE deviceId = ? ORDER BY id DESC LIMIT 1`,
      [deviceId],
      (err, row: any) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve({
          deviceId: row.deviceId,
          timestamp: row.timestamp,
          temperature: row.temperature,
          humidity: row.humidity,
          methane: row.methane,
          carbonMonoxide: row.carbonMonoxide,
          airQuality: row.airQuality,
          distance: row.distance,
          battery: row.battery,
          latitude: row.latitude,
          longitude: row.longitude,
          cameraOnline: Boolean(row.cameraOnline),
          deviceOnline: Boolean(row.deviceOnline)
        });
      }
    );
  });
}

export function getSensorHistory(limit: number = 100): Promise<SensorData[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM sensor_readings ORDER BY id DESC LIMIT ?`,
      [limit],
      (err, rows: any[]) => {
        if (err) return reject(err);
        const history: SensorData[] = rows.reverse().map((row) => ({
          deviceId: row.deviceId,
          timestamp: row.timestamp,
          temperature: row.temperature,
          humidity: row.humidity,
          methane: row.methane,
          carbonMonoxide: row.carbonMonoxide,
          airQuality: row.airQuality,
          distance: row.distance,
          battery: row.battery,
          latitude: row.latitude,
          longitude: row.longitude,
          cameraOnline: Boolean(row.cameraOnline),
          deviceOnline: Boolean(row.deviceOnline)
        }));
        resolve(history);
      }
    );
  });
}

export function saveAlert(alert: Alert): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO alerts (id, droneId, timestamp, type, sensor, value, unit, threshold, severity, status, message, latitude, longitude, acknowledgedBy, acknowledgedAt, resolvedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alert.id,
        alert.droneId,
        alert.timestamp,
        alert.type,
        alert.sensor,
        alert.value,
        alert.unit,
        alert.threshold,
        alert.severity,
        alert.status,
        alert.message,
        alert.location?.latitude || null,
        alert.location?.longitude || null,
        alert.acknowledgedBy || null,
        alert.acknowledgedAt || null,
        alert.resolvedAt || null
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export function getAlerts(limit: number = 50): Promise<Alert[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?`,
      [limit],
      (err, rows: any[]) => {
        if (err) return reject(err);
        const alerts: Alert[] = rows.map((row) => ({
          id: row.id,
          droneId: row.droneId,
          timestamp: row.timestamp,
          type: row.type,
          sensor: row.sensor,
          value: row.value,
          unit: row.unit,
          threshold: row.threshold,
          severity: row.severity as any,
          status: row.status as any,
          message: row.message,
          location: row.latitude && row.longitude ? { latitude: row.latitude, longitude: row.longitude } : undefined,
          acknowledgedBy: row.acknowledgedBy || undefined,
          acknowledgedAt: row.acknowledgedAt || undefined,
          resolvedAt: row.resolvedAt || undefined
        }));
        resolve(alerts);
      }
    );
  });
}

export function updateAlertStatus(
  id: string,
  status: 'ACKNOWLEDGED' | 'RESOLVED',
  byUser: string = 'Rescue Operator'
): Promise<Alert | null> {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    let query = '';
    let params: any[] = [];

    if (status === 'ACKNOWLEDGED') {
      query = `UPDATE alerts SET status = ?, acknowledgedBy = ?, acknowledgedAt = ? WHERE id = ?`;
      params = [status, byUser, now, id];
    } else {
      query = `UPDATE alerts SET status = ?, resolvedAt = ? WHERE id = ?`;
      params = [status, now, id];
    }

    db.run(query, params, function (err) {
      if (err) return reject(err);
      db.get(`SELECT * FROM alerts WHERE id = ?`, [id], (err, row: any) => {
        if (err || !row) return resolve(null);
        resolve({
          id: row.id,
          droneId: row.droneId,
          timestamp: row.timestamp,
          type: row.type,
          sensor: row.sensor,
          value: row.value,
          unit: row.unit,
          threshold: row.threshold,
          severity: row.severity as any,
          status: row.status as any,
          message: row.message,
          location: row.latitude && row.longitude ? { latitude: row.latitude, longitude: row.longitude } : undefined,
          acknowledgedBy: row.acknowledgedBy || undefined,
          acknowledgedAt: row.acknowledgedAt || undefined,
          resolvedAt: row.resolvedAt || undefined
        });
      });
    });
  });
}

export function getSettings(): Promise<ThresholdSettings> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM settings`, (err, rows: any[]) => {
      if (err) return reject(err);
      const settings: any = {};
      rows.forEach((r) => {
        settings[r.key] = JSON.parse(r.value);
      });
      resolve(settings as ThresholdSettings);
    });
  });
}

export function updateSettings(newSettings: Partial<ThresholdSettings>): Promise<ThresholdSettings> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);
    for (const [k, v] of Object.entries(newSettings)) {
      stmt.run(k, JSON.stringify(v));
    }
    stmt.finalize((err) => {
      if (err) return reject(err);
      getSettings().then(resolve).catch(reject);
    });
  });
}
