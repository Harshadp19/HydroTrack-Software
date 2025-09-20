# ESP32 Integration Guide for HydroTrack System

## Overview
This guide will help you connect your ESP32 device with 2 soil moisture sensors, 2 water pumps, and 1 ultrasonic sensor to your HydroTrack web application.

## Hardware Setup

### Components Required:
- 1x ESP32 Development Board
- 2x Soil Moisture Sensors
- 2x Water Pumps (12V recommended)
- 1x Ultrasonic Sensor (HC-SR04)
- 2x Relay Modules (for pump control)
- Breadboard/PCB for connections
- Power supply (12V for pumps, 3.3V/5V for ESP32)

### Pin Connections:

```
ESP32 Pins:
├── GPIO 32 → Soil Moisture Sensor 1 (Analog)
├── GPIO 33 → Soil Moisture Sensor 2 (Analog)
├── GPIO 25 → Ultrasonic Sensor Trigger
├── GPIO 26 → Ultrasonic Sensor Echo
├── GPIO 27 → Relay 1 (Water Pump 1)
├── GPIO 14 → Relay 2 (Water Pump 2)
├── 3.3V → Sensors VCC
└── GND → Common Ground
```

## ESP32 Code Implementation

### 1. Install Required Libraries
```cpp
// Install these libraries in Arduino IDE:
// - WiFi (built-in)
// - HTTPClient (built-in)
// - ArduinoJson
```

### 2. Main ESP32 Code
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoints
const String API_BASE = "https://zyyjukmesxgnrikayeyk.supabase.co/functions/v1/esp32-data";
const String SENSOR_ENDPOINT = API_BASE + "/sensor-data";
const String COMMAND_ENDPOINT = API_BASE + "/commands";

// Pin definitions
#define SOIL_SENSOR_1 32
#define SOIL_SENSOR_2 33
#define ULTRASONIC_TRIG 25
#define ULTRASONIC_ECHO 26
#define PUMP_1_RELAY 27
#define PUMP_2_RELAY 14

// Device configuration
const String DEVICE_ID = "esp32_hydrotrack_001"; // Unique device identifier

// Variables
bool pump1_status = false;
bool pump2_status = false;
unsigned long lastSensorReading = 0;
unsigned long lastCommandCheck = 0;
const unsigned long SENSOR_INTERVAL = 30000; // 30 seconds
const unsigned long COMMAND_INTERVAL = 10000; // 10 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(SOIL_SENSOR_1, INPUT);
  pinMode(SOIL_SENSOR_2, INPUT);
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  pinMode(PUMP_1_RELAY, OUTPUT);
  pinMode(PUMP_2_RELAY, OUTPUT);
  
  // Initialize pumps as off
  digitalWrite(PUMP_1_RELAY, LOW);
  digitalWrite(PUMP_2_RELAY, LOW);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentTime = millis();
  
  // Send sensor data every 30 seconds
  if (currentTime - lastSensorReading >= SENSOR_INTERVAL) {
    sendSensorData();
    lastSensorReading = currentTime;
  }
  
  // Check for commands every 10 seconds
  if (currentTime - lastCommandCheck >= COMMAND_INTERVAL) {
    checkForCommands();
    lastCommandCheck = currentTime;
  }
  
  delay(1000);
}

float readSoilMoisture(int pin) {
  int rawValue = analogRead(pin);
  // Convert to percentage (adjust these values based on your sensor calibration)
  float moisture = map(rawValue, 0, 4095, 0, 100);
  return constrain(moisture, 0, 100);
}

float readWaterVolume() {
  // Send trigger pulse
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  
  // Read echo pulse
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH);
  
  // Calculate distance in cm
  float distance = duration * 0.034 / 2;
  
  // Convert distance to volume (adjust based on your tank dimensions)
  // Example: cylindrical tank with radius 10cm, height 30cm
  float tankRadius = 10.0; // cm
  float maxHeight = 30.0;  // cm
  float waterHeight = maxHeight - distance;
  
  if (waterHeight < 0) waterHeight = 0;
  if (waterHeight > maxHeight) waterHeight = maxHeight;
  
  float volume = 3.14159 * tankRadius * tankRadius * waterHeight; // cm³
  return volume; // Convert to ml (1 cm³ = 1 ml)
}

void sendSensorData() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SENSOR_ENDPOINT);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    DynamicJsonDocument doc(1024);
    doc["device_id"] = DEVICE_ID;
    
    JsonObject sensors = doc.createNestedObject("sensors");
    sensors["soil_moisture_1"] = readSoilMoisture(SOIL_SENSOR_1);
    sensors["soil_moisture_2"] = readSoilMoisture(SOIL_SENSOR_2);
    sensors["water_volume"] = readWaterVolume();
    
    JsonObject actuators = doc.createNestedObject("actuators");
    actuators["pump_1_status"] = pump1_status;
    actuators["pump_2_status"] = pump2_status;
    
    doc["timestamp"] = WiFi.getTime();
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Sending sensor data: " + jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error sending data: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

void checkForCommands() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = COMMAND_ENDPOINT + "?device_id=" + DEVICE_ID;
    http.begin(url);
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, response);
      
      JsonArray commands = doc["commands"];
      
      for (JsonObject command : commands) {
        String action = command["action"];
        int pumpId = command["pump_id"];
        int duration = command["duration_minutes"];
        
        executePumpCommand(pumpId, action, duration);
      }
    }
    
    http.end();
  }
}

void executePumpCommand(int pumpId, String action, int durationMinutes) {
  Serial.println("Executing command - Pump " + String(pumpId) + ": " + action);
  
  int relayPin = (pumpId == 1) ? PUMP_1_RELAY : PUMP_2_RELAY;
  bool* pumpStatus = (pumpId == 1) ? &pump1_status : &pump2_status;
  
  if (action == "start") {
    digitalWrite(relayPin, HIGH);
    *pumpStatus = true;
    
    // Auto-stop after duration (if specified)
    if (durationMinutes > 0) {
      delay(durationMinutes * 60 * 1000); // Convert to milliseconds
      digitalWrite(relayPin, LOW);
      *pumpStatus = false;
      Serial.println("Pump " + String(pumpId) + " stopped after " + String(durationMinutes) + " minutes");
    }
  } else if (action == "stop") {
    digitalWrite(relayPin, LOW);
    *pumpStatus = false;
  }
}
```

### 3. Calibration Instructions

#### Soil Moisture Sensors:
1. Insert sensor in completely dry soil → note reading (should be ~0%)
2. Insert sensor in water → note reading (should be ~100%)
3. Adjust the `map()` function values in `readSoilMoisture()`

#### Ultrasonic Sensor:
1. Measure your water tank dimensions
2. Update `tankRadius` and `maxHeight` in `readWaterVolume()`
3. Test with known water levels to verify accuracy

## API Integration

### Your Supabase Edge Function is ready at:
```
https://zyyjukmesxgnrikayeyk.supabase.co/functions/v1/esp32-data/
```

### Endpoints:
- `POST /sensor-data` - Send sensor readings
- `GET /commands?device_id=your_device_id` - Poll for pump commands
- `POST /pump-command` - Send pump commands (from web app)

## Web App Integration

The web application now automatically:
- ✅ Displays real-time data from your ESP32
- ✅ Shows 2 soil moisture sensors
- ✅ Shows water tank volume
- ✅ Controls 2 water pumps
- ✅ Logs all operations

## Testing Setup

1. **Flash the ESP32 code**
2. **Update WiFi credentials** in the code
3. **Monitor Serial output** to verify connectivity
4. **Check the web app** - sensor data should appear within 30 seconds
5. **Test pump control** from the Controls page

## Troubleshooting

### Common Issues:
- **No data appearing**: Check WiFi connection and serial output
- **Sensors reading incorrectly**: Calibrate as described above
- **Pumps not responding**: Verify relay connections and power supply
- **API errors**: Check internet connection and Supabase status

### Debug Commands:
```cpp
// Add to setup() for debugging
Serial.println("Device ID: " + DEVICE_ID);
Serial.println("API Endpoint: " + SENSOR_ENDPOINT);
```

## Security Notes
- Change the default `DEVICE_ID` to something unique
- Consider implementing device authentication
- Use HTTPS for all API calls (already configured)

## Next Steps
1. Deploy this ESP32 code to your device
2. Test connectivity with the web app
3. Calibrate your sensors
4. Set up automation rules in the web interface
5. Monitor your irrigation system remotely!