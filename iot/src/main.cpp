// #include <Wire.h>
// #include <LiquidCrystal_I2C.h>
// #include <DHT.h>
// #include <WiFi.h>
// #include <HTTPClient.h>
// #include <ArduinoJson.h>

// #define DHTPIN 4
// #define DHTTYPE DHT22

// const char* ssid = "Wokwi-GUEST";
// const char* password = "";
// const char* serverUrl = "http://192.168.56.1:8000/sensor-data/";

// unsigned long lastTime = 0;
// unsigned long timerDelay = 10000;
// unsigned long lastPumpCheck = 0;
// unsigned long pumpCheckDelay = 5000;

// // ✅ Global pump state
// bool currentPumpStatus = false;

// // Plant state
// String currentPlantType = "tomate";

// DHT dht(DHTPIN, DHTTYPE);
// LiquidCrystal_I2C lcd(0x27, 16, 2);

// void setup() {
//   Serial.begin(115200);
//   pinMode(2, OUTPUT);
//   digitalWrite(2, LOW); // start with pump OFF
//   dht.begin();
//   lcd.init();
//   lcd.backlight();

//   WiFi.begin(ssid, password);
//   Serial.print("Connecting to WiFi");
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("\nWiFi Connected!");
//   Serial.print("IP Address: ");
//   Serial.println(WiFi.localIP());
// }

// void checkPumpCommand() {
//   HTTPClient http;
//   http.begin("http://192.168.56.1:8000/get-plant");
//   int httpCode = http.GET();
//   if (httpCode == 200) {
//     String response = http.getString();
//     StaticJsonDocument<64> doc;
//     deserializeJson(doc, response);

//     bool pump_on = doc["pump_on"];

//     // ✅ Update global state
//     currentPumpStatus = pump_on;

//     // ✅ Actually drive the relay
//     digitalWrite(2, pump_on ? HIGH : LOW);

//     Serial.printf("🔧 Pump command: %s\n", pump_on ? "ON" : "OFF");
//   } else {
//     Serial.printf("⚠️ Pump check failed, HTTP: %d\n", httpCode);
//   }
//   http.end();
// }

// void checkPlantType() {
//   HTTPClient http;
//   http.begin("http://192.168.56.1:8000/get-plant");
//   int httpCode = http.GET();
//   if (httpCode == 200) {
//     StaticJsonDocument<64> doc;
//     deserializeJson(doc, http.getString());
//     currentPlantType = doc["plant_type"].as<String>();
//   }
//   http.end();
// }

// void loop() {

//   if ((millis() - lastPumpCheck) > pumpCheckDelay) {
//     checkPumpCommand();
//     checkPlantType();
//     lastPumpCheck = millis();
//   }

//   if ((millis() - lastTime) > timerDelay) {
//     if (WiFi.status() == WL_CONNECTED) {

//       HTTPClient http;
//       http.begin(serverUrl);
//       http.addHeader("Content-Type", "application/json");

//       float temperature = dht.readTemperature();
//       float air_humidity = dht.readHumidity();
//       if (isnan(temperature)) temperature = 22.5;
//       if (isnan(air_humidity)) air_humidity = 55.0;

//       int rawSoil = analogRead(34);
//       int soil_moisture = map(rawSoil, 0, 4095, 0, 100);

//       StaticJsonDocument<256> doc;
//       doc["plant_type"] = currentPlantType;
//       doc["soil_moisture"] = soil_moisture;
//       doc["temperature"]   = temperature;
//       doc["air_humidity"]  = air_humidity;
//       doc["pump_status"]   = currentPumpStatus; // ✅ use real state

//       String json;
//       serializeJson(doc, json);

//       Serial.println(">>> Sending POST...");
//       Serial.println("Payload: " + json);

//       int httpCode = http.POST(json);

//       if (httpCode > 0) {
//         Serial.printf("✅ Success! HTTP Code: %d\n", httpCode);
//         Serial.println("Response: " + http.getString());
//       } else {
//         Serial.printf("❌ Error: %s\n", http.errorToString(httpCode).c_str());
//       }

//       http.end();

//       // ✅ Show pump status on LCD too
//       lcd.clear();
//       lcd.setCursor(0, 0);
//       lcd.print("T:" + String(temperature, 1) + "C H:" + String(air_humidity, 1) + "%");
//       lcd.setCursor(0, 1);
//       lcd.print("Soil:" + String(soil_moisture) + "% P:" + (currentPumpStatus ? "ON" : "OFF"));

//     } else {
//       Serial.println("WiFi disconnected, reconnecting...");
//       WiFi.begin(ssid, password);
//     }

//     lastTime = millis();
//   }
// }

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define DHTPIN 4
#define DHTTYPE DHT22

const char* ssid      = "Wokwi-GUEST";
const char* password  = "";
const char* BASE_URL  = "http://192.168.56.1:8000";

// ── Timers ───────────────────────────────────────────────
unsigned long lastSensorSend  = 0;
unsigned long lastPumpCheck   = 0;
unsigned long lastPlantCheck  = 0;
const unsigned long SENSOR_INTERVAL = 10000; // 10s
const unsigned long PUMP_INTERVAL   = 5000;  // 5s
const unsigned long PLANT_INTERVAL  = 15000; // 15s (no need to poll this fast)

// ── State ────────────────────────────────────────────────
bool   currentPumpStatus = false;
bool   manualOverride    = false;
String currentPlantType  = "tomate";

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ── Setup ────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  dht.begin();
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (++attempts > 40) {
      Serial.println("\n❌ WiFi failed — rebooting");
      ESP.restart();
    }
  }
  Serial.println("\n✅ WiFi Connected! IP: " + WiFi.localIP().toString());
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("IP:");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  delay(2000);
}

// ── Check pump command ───────────────────────────────────
void checkPumpCommand() {
  HTTPClient http;
  // ✅ FIXED: was wrongly pointing to /get-plant before
  http.begin(String(BASE_URL) + "/pump-command");
  int httpCode = http.GET();

  if (httpCode == 200) {
    StaticJsonDocument<128> doc;
    deserializeJson(doc, http.getString());

    bool pump_on   = doc["pump_on"];
    manualOverride = doc["manual_override"];

    if (pump_on != currentPumpStatus) {
      currentPumpStatus = pump_on;
      digitalWrite(2, pump_on ? HIGH : LOW);
      Serial.printf("🔧 Pump → %s | Mode: %s\n",
        pump_on ? "ON" : "OFF",
        manualOverride ? "MANUAL" : "AUTO"
      );
    }
  } else {
    Serial.printf("⚠️ Pump check failed | HTTP: %d\n", httpCode);
  }
  http.end();
}

// ── Check plant type ─────────────────────────────────────
void checkPlantType() {
  HTTPClient http;
  http.begin(String(BASE_URL) + "/get-plant");
  int httpCode = http.GET();

  if (httpCode == 200) {
    StaticJsonDocument<64> doc;
    deserializeJson(doc, http.getString());
    String newPlant = doc["plant_type"].as<String>();
    if (newPlant != currentPlantType) {
      Serial.println("🌱 Plant changed: " + currentPlantType + " → " + newPlant);
      currentPlantType = newPlant;
    }
  } else {
    Serial.printf("⚠️ Plant check failed | HTTP: %d\n", httpCode);
  }
  http.end();
}

// ── Send sensor data ─────────────────────────────────────
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected, skipping send");
    return;
  }

  float temperature  = dht.readTemperature();
  float air_humidity = dht.readHumidity();
  if (isnan(temperature))  { temperature  = 22.5; Serial.println("⚠️ DHT temp failed, using fallback"); }
  if (isnan(air_humidity)) { air_humidity = 55.0; Serial.println("⚠️ DHT humidity failed, using fallback"); }

  int soil_moisture = map(analogRead(34), 0, 4095, 0, 100);

  StaticJsonDocument<256> doc;
  doc["plant_type"]    = currentPlantType;
  doc["soil_moisture"] = soil_moisture;
  doc["temperature"]   = temperature;
  doc["air_humidity"]  = air_humidity;
  doc["pump_status"]   = currentPumpStatus;

  String json;
  serializeJson(doc, json);

  HTTPClient http;
  http.begin(String(BASE_URL) + "/sensor-data/");
  http.addHeader("Content-Type", "application/json");

  Serial.println("📤 Sending → " + json);
  int httpCode = http.POST(json);

  if (httpCode == 200 || httpCode == 201) {
    Serial.printf("✅ Sent | HTTP:%d\n", httpCode);
  } else {
    Serial.printf("❌ Send failed | HTTP:%d | %s\n", httpCode, http.errorToString(httpCode).c_str());
  }
  http.end();

  // Update LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:" + String(temperature, 1) + "C H:" + String(air_humidity, 0) + "%");
  lcd.setCursor(0, 1);
  lcd.print((manualOverride ? "M:" : "A:") + String(soil_moisture) + "% P:" + (currentPumpStatus ? "ON" : "OFF"));
}

// ── Loop ─────────────────────────────────────────────────
void loop() {
  // WiFi watchdog
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi lost — reconnecting...");
    WiFi.begin(ssid, password);
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries++ < 20) delay(500);
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("❌ Reconnect failed — rebooting");
      ESP.restart();
    }
    Serial.println("✅ WiFi reconnected");
  }

  if (millis() - lastPumpCheck > PUMP_INTERVAL) {
    checkPumpCommand();
    lastPumpCheck = millis();
  }

  if (millis() - lastPlantCheck > PLANT_INTERVAL) {
    checkPlantType();
    lastPlantCheck = millis();
  }

  if (millis() - lastSensorSend > SENSOR_INTERVAL) {
    sendSensorData();
    lastSensorSend = millis();
  }
}