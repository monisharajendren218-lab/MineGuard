import mqtt, { MqttClient } from 'mqtt';
import { validateSensorPayload, processSensorTelemetry } from '../services/sensorPipeline.js';
import { setDemoModeStatus } from '../services/demoSimulator.js';

let client: MqttClient | null = null;
let isConnected = false;

const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = 'mineguard/drone/+/sensors';

export function initMQTTClient() {
  console.log(`📡 Connecting to MQTT Broker: ${MQTT_BROKER}`);

  client = mqtt.connect(MQTT_BROKER, {
    clientId: `mineguard_backend_${Math.random().toString(16).substring(2, 8)}`,
    keepalive: 60,
    reconnectPeriod: 5000,
    connectTimeout: 10000
  });

  client.on('connect', () => {
    isConnected = true;
    console.log('✅ Connected to MQTT Broker successfully.');
    client?.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('Failed to subscribe to MQTT topic:', err);
      } else {
        console.log(`🎯 Subscribed to MQTT topic: ${MQTT_TOPIC}`);
      }
    });
  });

  client.on('message', (topic, message) => {
    try {
      const payloadStr = message.toString();
      const rawObj = JSON.parse(payloadStr);

      // Extract device ID from topic if present (e.g., mineguard/drone/DRONE-01/sensors)
      const topicParts = topic.split('/');
      if (topicParts.length >= 3 && !rawObj.deviceId) {
        rawObj.deviceId = topicParts[2];
      }

      const validated = validateSensorPayload(rawObj);
      if (validated) {
        // Switch to LIVE mode upon receiving valid hardware message
        setDemoModeStatus(false);
        processSensorTelemetry(validated);
      }
    } catch (err) {
      console.error('Malformed MQTT message received:', err);
    }
  });

  client.on('error', (err) => {
    console.warn('MQTT Error:', err.message);
    isConnected = false;
  });

  client.on('offline', () => {
    isConnected = false;
    console.warn('MQTT Client went offline');
  });

  client.on('close', () => {
    isConnected = false;
  });
}

export function isMQTTConnected(): boolean {
  return isConnected;
}
