import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { initDatabase } from './database/db.js';
import { initWebSocketServer } from './websocket/wsServer.js';
import { initMQTTClient } from './mqtt/mqttClient.js';
import { startDemoSimulation } from './services/demoSimulator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

const server = http.createServer(app);

async function startServer() {
  try {
    // 1. Initialize SQLite Database
    await initDatabase();
    console.log('🗄️ Database initialized successfully.');

    // 2. Initialize WebSocket Server
    initWebSocketServer(server);
    console.log('🔌 WebSocket server initialized.');

    // 3. Initialize MQTT Client for ESP32 hardware payloads
    initMQTTClient();

    // 4. Start Demo Simulator (runs by default if no hardware is publishing)
    startDemoSimulation();
    console.log('⚡ DEMO Mode simulation active by default.');

    server.listen(PORT, () => {
      console.log(`🚀 MineGuard Safety Backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
}

startServer();
