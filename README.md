# MineGuard — Mining Safety Drone Monitoring & Rescue System

**MineGuard** is a production-grade, real-time IoT emergency control room monitoring and rescue system designed for subterranean mining operations. It connects autonomous field drones equipped with ESP32 microcontrollers, atmospheric gas sensors, ultrasonic distance rangers, and live camera feeds to a central web command dashboard via MQTT and WebSockets.

---

## 🌟 Key Features

1. **🔴 Live Drone Camera Workstation**:
   - Stream integration for MJPEG, HTTP streams, WebRTC, or RTSP proxies (ESP32-CAM compatible).
   - Snapshot frame capture archive, stream controls, recording indicator, and offline fallback overlay (`CAMERA OFFLINE — CONNECT A CAMERA`).
2. **⚡ Real-Time WebSocket Sensor Pipeline**:
   - Zero browser refresh needed. Automatic push updates for Temperature, Humidity, Methane ($CH_4$), Carbon Monoxide ($CO$), Air Quality ($AQI$), Obstacle Distance, Battery, and GPS Coordinates.
   - Built-in `DEVICE DISCONNECTED` warning and last received timestamp count-up.
3. **🚨 Intelligent Threat & Alert Engine**:
   - Configurable safety thresholds for high temperature, explosive gas leaks, toxic CO levels, and obstacle proximity.
   - Automated Web Audio API alarm siren, alert history log, and one-click Acknowledge / Resolve lifecycle.
4. **🟡 Hackathon DEMO MODE & Emergency Simulator**:
   - Toggle switch for `LIVE MODE` (real ESP32 MQTT telemetry) vs `DEMO MODE` (built-in physics telemetry simulator).
   - Prominent **🚨 SIMULATE EMERGENCY** button to trigger a gas leak ($5.4\% \text{ CH}_4$) & thermal spike ($48.2^\circ\text{C}$) during college presentations.
5. **🗺️ Subterranean Tactical Mine Map**:
   - Interactive tunnel layout & surface GPS positioning map, flight path track, danger heatmaps, and geofenced hazard zones.
6. **📊 Analytics & CSV Data Export**:
   - Historical multi-sensor trend charts powered by Recharts with timeframes (1m, 5m, 30m, 1h) and one-click CSV sensor log export.
7. **🔐 Role-Based Access Control**:
   - Quick-switch user persona profiles: **System Administrator**, **Chief Rescue Operator**, and **Inspection Viewer**.

---

## 📁 System Architecture

```text
  [ ESP32 Hardware Drone Unit ]
  (DHT22, MQ-4, MQ-7, MQ-135, HC-SR04, NEO-6M, ESP32-CAM)
                 │
                 │ (MQTT JSON over WiFi)
                 ▼
  [ MQTT Broker (e.g. HiveMQ / Mosquitto) ]
                 │
                 │ (PubSubClient Subscriber)
                 ▼
     [ Node.js + Express Backend ]
     ├── SQLite Database (better-sqlite3 / sqlite3)
     ├── Sensor Pipeline & Threat Validator
     └── Demo Mode Simulation Engine
                 │
                 │ (Real-Time WebSocket Streams)
                 ▼
   [ React + TypeScript + Vite + Tailwind Dashboard ]
   ├── Emergency Control Panel
   ├── Live Camera Viewport
   ├── Recharts Telemetry Trends
   ├── Tactical Mine Map
   └── Incident Alert Management
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

---

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:5000`. By default, **DEMO MODE** will be active so you can immediately view real-time data streaming to the frontend.

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

### 3. ESP32 Hardware Setup & Flashing

1. Open Arduino IDE and install the required libraries:
   - `PubSubClient` (by Nick O'Leary)
   - `ArduinoJson` (by Benoit Blanchon, v6+)
   - `DHT sensor library` (by Adafruit)
   - `TinyGPS++` (by Mikal Hart)
2. Open `esp32/mineguard_sensor/mineguard_sensor.ino`.
3. Update `WIFI_SSID` and `WIFI_PASSWORD` with your local Wi-Fi credentials.
4. Select board **ESP32 Dev Module** and flash the sketch.

#### Hardware Pinout Mapping:
- **DHT22 (Temp & Humidity)**: GPIO 4
- **MQ-4 (Methane CH4)**: GPIO 34 (ADC1_CH6)
- **MQ-7 (Carbon Monoxide CO)**: GPIO 35 (ADC1_CH7)
- **MQ-135 (Air Quality AQI)**: GPIO 32 (ADC1_CH4)
- **HC-SR04 (Ultrasonic Distance)**: Trig -> GPIO 12, Echo -> GPIO 14
- **NEO-6M (GPS Module)**: RX2 -> GPIO 16, TX2 -> GPIO 17
- **Battery Divider ADC**: GPIO 33 (ADC1_CH5)
- **Status LED**: GPIO 2

---

## 🎯 Demonstrating DEMO MODE at Hackathons

1. Open the dashboard at `http://localhost:3000`.
2. Notice the **`🟡 DEMO MODE`** badge in the navbar and **`SYSTEM: ONLINE`** status indicator.
3. Observe live numbers, battery discharge, and Recharts graph updating every 2 seconds without refreshing the browser.
4. Click the prominent **`🚨 SIMULATE EMERGENCY`** button in the Emergency Control Panel:
   - Methane instantly jumps to $5.4\%$.
   - Temperature jumps to $48.2^\circ\text{C}$.
   - Proximity distance drops to $0.38\text{ m}$.
   - A critical red alert banner appears with an alarm sound siren.
   - The alert is recorded in the **Alerts** page where you can click **Acknowledge** or **Resolve**.
5. Switch to **Live Camera** to view the HUD controls, snapshot frame capture archive, and stream settings modal.
6. Switch to **Analytics** and click **`EXPORT CSV REPORT`** to download full sensor logs.

---

## 🛠 Environment Variables

See `.env.example` for details:

```text
PORT=5000
DATABASE_URL=sqlite://./data/mineguard.db
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
MQTT_TOPIC=mineguard/drone/DRONE-01/sensors
CAMERA_STREAM_URL=http://192.168.1.100:81/stream
```

---

## 📜 License & Compliance Notice

All safety thresholds configured in MineGuard are user-customizable operational limits. Deployment in active mining operations must comply with applicable industrial safety standards and local mining safety regulations.
