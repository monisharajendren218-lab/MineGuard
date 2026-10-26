/*
  ==============================================================================
  MineGuard - Real-Time Mining Safety Drone Monitoring & Rescue System
  ESP32 Firmware Code (Arduino Framework)
  ==============================================================================
  
  HARDWARE WIRING DIAGRAM & PINOUT:
  ------------------------------------------------------------------------------
  1. DHT22 (Temperature & Humidity Sensor):
     - VCC -> 3.3V / 5V
     - GND -> GND
     - DATA -> GPIO 4 (with 10k pullup resistor to VCC)

  2. MQ-4 (Methane CH4 Gas Sensor):
     - VCC -> 5V
     - GND -> GND
     - AO (Analog Out) -> GPIO 34 (ADC1_CH6)

  3. MQ-7 (Carbon Monoxide CO Sensor):
     - VCC -> 5V
     - GND -> GND
     - AO (Analog Out) -> GPIO 35 (ADC1_CH7)

  4. MQ-135 (Air Quality AQI Sensor):
     - VCC -> 5V
     - GND -> GND
     - AO (Analog Out) -> GPIO 32 (ADC1_CH4)

  5. HC-SR04 (Ultrasonic Obstacle Sensor):
     - VCC -> 5V
     - GND -> GND
     - TRIG -> GPIO 12
     - ECHO -> GPIO 14 (Use resistor voltage divider 5V->3.3V)

  6. NEO-6M (GPS Module):
     - VCC -> 3.3V / 5V
     - GND -> GND
     - TX -> GPIO 16 (ESP32 RX2)
     - RX -> GPIO 17 (ESP32 TX2)

  7. Battery Voltage Divider Module:
     - Positive Battery Lead -> Resistor Divider (e.g. 100k / 10k)
     - Signal Out -> GPIO 33 (ADC1_CH5)

  8. Status Indicator LED:
     - GPIO 2 (Built-in LED)
  ------------------------------------------------------------------------------
  DEPENDENCIES (Install via Arduino Library Manager):
  - WiFi.h (Built-in ESP32 core)
  - PubSubClient (by Nick O'Leary)
  - ArduinoJson (by Benoit Blanchon, v6+)
  - DHT sensor library (by Adafruit)
  - TinyGPS++ (by Mikal Hart)
  ==============================================================================
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <TinyGPS++.h>

// ==============================================================================
// CONFIGURATION - UPDATE FOR YOUR LOCAL NETWORK & MQTT BROKER
// ==============================================================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* MQTT_BROKER = "broker.hivemq.com"; // Public MQTT broker for testing or your IP
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "mineguard/drone/DRONE-01/sensors";
const char* DEVICE_ID = "DRONE-01";

// Pin definitions
#define DHTPIN 4
#define DHTTYPE DHT22

#define MQ4_PIN 34
#define MQ7_PIN 35
#define MQ135_PIN 32

#define TRIG_PIN 12
#define ECHO_PIN 14

#define BATTERY_PIN 33
#define STATUS_LED 2

// Timing
unsigned long lastPublishTime = 0;
const unsigned long PUBLISH_INTERVAL = 2000; // Publish every 2 seconds

// Instances
WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // Serial2 on GPIO 16 (RX) and GPIO 17 (TX)

// ==============================================================================
// SETUP FUNCTION
// ==============================================================================
void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);

  // Initialize Sensors
  dht.begin();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // GPS Hardware Serial Init
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  Serial.println("\n🚀 Initializing MineGuard ESP32 Drone Telemetry Unit...");

  // Connect WiFi
  connectWiFi();

  // Configure MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

// ==============================================================================
// MAIN LOOP
// ==============================================================================
void loop() {
  // Feed GPS Serial reader
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Ensure WiFi & MQTT connections stay alive
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Periodic Telemetry Transmission
  unsigned long currentMillis = millis();
  if (currentMillis - lastPublishTime >= PUBLISH_INTERVAL) {
    lastPublishTime = currentMillis;
    publishSensorData();
  }
}

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

void connectWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(STATUS_LED, HIGH);
  } else {
    Serial.println("\n⚠️ WiFi Connection Failed. Continuing in offline mode.");
  }
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("📡 Connecting to MQTT Broker...");
    String clientId = "MineGuard-ESP32-";
    clientId += String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str())) {
      Serial.println(" Connected!");
      digitalWrite(STATUS_LED, HIGH);
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(". Retrying in 5 seconds...");
      digitalWrite(STATUS_LED, LOW);
      delay(5000);
    }
  }
}

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 4.0; // Out of range fallback
  float distanceMeters = (duration * 0.0343) / 2.0 / 100.0;
  return distanceMeters;
}

float readBatteryPercentage() {
  int rawADC = analogRead(BATTERY_PIN);
  float voltage = (rawADC / 4095.0) * 3.3 * 4.2; // Adjusted for divider factor
  float batteryPct = ((voltage - 3.2) / (4.2 - 3.2)) * 100.0;
  return constrain(batteryPct, 0.0, 100.0);
}

void publishSensorData() {
  // Read DHT22
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temp)) temp = 28.5; // Fallback
  if (isnan(humidity)) humidity = 62.0;

  // Read Analog Gas Sensors
  int rawMQ4 = analogRead(MQ4_PIN);
  int rawMQ7 = analogRead(MQ7_PIN);
  int rawMQ135 = analogRead(MQ135_PIN);

  // Calibration equations for raw ADC to concentration
  float methaneCH4 = (rawMQ4 / 4095.0) * 5.0; // Methane %
  float carbonMonoxide = (rawMQ7 / 4095.0) * 150.0; // CO ppm
  float airQuality = (rawMQ135 / 4095.0) * 300.0; // AQI

  // Distance & Battery
  float distance = readUltrasonicDistance();
  float battery = readBatteryPercentage();

  // GPS Coordinates
  double lat = 13.0067; // Default baseline if GPS acquiring fix
  double lng = 80.2206;
  if (gps.location.isValid()) {
    lat = gps.location.lat();
    lng = gps.location.lng();
  }

  // Construct JSON Payload
  StaticJsonDocument<384> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["temperature"] = serialized(String(temp, 2));
  doc["humidity"] = serialized(String(humidity, 2));
  doc["methane"] = serialized(String(methaneCH4, 2));
  doc["carbonMonoxide"] = serialized(String(carbonMonoxide, 2));
  doc["airQuality"] = serialized(String(airQuality, 2));
  doc["distance"] = serialized(String(distance, 2));
  doc["battery"] = serialized(String(battery, 2));
  doc["latitude"] = serialized(String(lat, 6));
  doc["longitude"] = serialized(String(lng, 6));
  doc["cameraOnline"] = true;
  doc["deviceOnline"] = true;

  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  Serial.print("📤 Publishing MQTT Payload: ");
  Serial.println(jsonBuffer);

  if (mqttClient.publish(MQTT_TOPIC, jsonBuffer)) {
    // Pulse Status LED on successful transmit
    digitalWrite(STATUS_LED, LOW);
    delay(50);
    digitalWrite(STATUS_LED, HIGH);
  } else {
    Serial.println("❌ Publish failed!");
  }
}
