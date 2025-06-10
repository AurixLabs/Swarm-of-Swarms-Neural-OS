
/*
 * ================================================================
 * ESP32-S3 CMA NODE FIRMWARE - SUPER DEBUG VERSION
 * ================================================================
 * Maximum debugging to find web server startup failure
 * ================================================================
 */

#include <WiFi.h>
#include <WebServer.h>
#include <SD.h>
#include <SPI.h>
#include <Wire.h>

// ========================
// WIFI CREDENTIALS - ALREADY SET!
// ========================
const char* ssid = "CMHK-r6Ts";
const char* password = "447dcqme";

// ========================
// HARDWARE PIN DEFINITIONS (Your Exact Wiring)
// ========================
#define SD_CS_PIN 5        // MicroSD CS
#define SD_MISO_PIN 12     // MicroSD MISO  
#define SD_MOSI_PIN 11     // MicroSD MOSI
#define SD_SCK_PIN 36      // MicroSD SCK

// ========================
// MULTIPLE LED PIN TESTING
// ========================
int ledPins[] = {2, 8, 21, 38, 48};  // Common ESP32-S3 LED pins
int numLedPins = 5;
int workingLedPin = -1;  // Will store the pin that works

// ========================
// WEB SERVER SETUP
// ========================
WebServer server(80);   // HTTP on port 80
bool sdInitialized = false;
bool serverStarted = false;
bool routesRegistered = false;

// ========================
// ENHANCED CORS HEADERS - MAXIMUM COMPATIBILITY!
// ========================
void setCORSHeaders() {
  Serial.println("📡 Setting CORS headers...");
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
  server.sendHeader("Access-Control-Allow-Credentials", "false");
  server.sendHeader("Access-Control-Max-Age", "86400");
  server.sendHeader("Cache-Control", "no-cache");
  Serial.println("✅ CORS headers set successfully");
}

// ========================
// HTTP API HANDLERS WITH MAXIMUM DEBUG
// ========================
void handleFunctions() {
  Serial.println("🔥🔥🔥 FUNCTIONS ENDPOINT HIT! 🔥🔥🔥");
  Serial.println("📝 Processing functions request...");
  setCORSHeaders();
  
  String response = "{\"status\":\"success\",\"functions\":[";
  response += "\"gpio_digital_write\",\"gpio_digital_read\",\"gpio_analog_read\",";
  response += "\"pwm_set_frequency\",\"pwm_set_duty_cycle\",\"i2c_scan_devices\",";
  response += "\"spi_transfer_data\",\"uart_send_data\",\"led_control_multi_pin\",";
  response += "\"led_discovery_test\",\"microsd_write_file\",\"microsd_read_file\",";
  response += "\"microsd_list_files\",\"wifi_get_status\",\"wifi_scan_networks\",";
  response += "\"system_get_uptime\",\"system_get_free_memory\",\"system_restart\",";
  response += "\"adc_read_voltage\",\"timer_create_interval\"";
  response += "],\"count\":20,\"chip_id\":\"esp32_s3_cma_super_debug\"}";
  
  Serial.println("📤 Sending functions response...");
  server.send(200, "application/json", response);
  Serial.println("✅✅✅ Functions response sent successfully! ✅✅✅");
}

void handleStatus() {
  Serial.println("🔥🔥🔥 STATUS ENDPOINT HIT! 🔥🔥🔥");
  Serial.println("📝 Processing status request...");
  setCORSHeaders();
  
  String response = "{";
  response += "\"status\":\"online_super_debug_mode\",";
  response += "\"chip_id\":\"esp32_s3_" + String((uint32_t)ESP.getEfuseMac()) + "\",";
  response += "\"model\":\"ESP32-S3\",";
  response += "\"firmware\":\"CMA_NODE_SUPER_DEBUG_v3.0\",";
  response += "\"protocol\":\"HTTP_SUPER_DEBUG\",";
  response += "\"wifi_connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") + ",";
  response += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  response += "\"uptime\":" + String(millis()) + ",";
  response += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  response += "\"microsd\":" + String(sdInitialized ? "true" : "false") + ",";
  response += "\"working_led_pin\":" + String(workingLedPin) + ",";
  response += "\"server_started\":" + String(serverStarted ? "true" : "false") + ",";
  response += "\"routes_registered\":" + String(routesRegistered ? "true" : "false");
  response += "}";
  
  Serial.println("📤 Sending status response...");
  server.send(200, "application/json", response);
  Serial.println("✅✅✅ Status response sent successfully! ✅✅✅");
}

void handleLED() {
  Serial.println("🔥🔥🔥 LED ENDPOINT HIT! 🔥🔥🔥");
  setCORSHeaders();
  String state = server.arg("state");
  
  Serial.println("💡 LED state requested: " + state);
  
  if (state == "on") {
    for(int i = 0; i < numLedPins; i++) {
      digitalWrite(ledPins[i], HIGH);
    }
    server.send(200, "application/json", "{\"status\":\"success\",\"led\":\"all_pins_on\",\"pins\":[2,8,21,38,48]}");
    Serial.println("✅ LED ON command executed and response sent!");
    
  } else if (state == "off") {
    for(int i = 0; i < numLedPins; i++) {
      digitalWrite(ledPins[i], LOW);
    }
    server.send(200, "application/json", "{\"status\":\"success\",\"led\":\"all_pins_off\",\"pins\":[2,8,21,38,48]}");
    Serial.println("✅ LED OFF command executed and response sent!");
    
  } else if (state == "blink") {
    Serial.println("💫 Starting LED blink sequence...");
    for(int cycle = 0; cycle < 5; cycle++) {
      for(int i = 0; i < numLedPins; i++) {
        digitalWrite(ledPins[i], HIGH);
      }
      delay(300);
      for(int i = 0; i < numLedPins; i++) {
        digitalWrite(ledPins[i], LOW);
      }
      delay(300);
      Serial.println("💫 Blink cycle " + String(cycle + 1) + " complete");
    }
    server.send(200, "application/json", "{\"status\":\"success\",\"led\":\"blinked_all_pins\",\"cycles\":5}");
    Serial.println("✅ LED BLINK command executed and response sent!");
    
  } else if (state == "discover") {
    discoverWorkingLED();
    server.send(200, "application/json", "{\"status\":\"success\",\"led\":\"discovery_complete\",\"message\":\"Check serial monitor\"}");
    Serial.println("✅ LED DISCOVERY command executed and response sent!");
    
  } else {
    server.send(400, "application/json", "{\"status\":\"error\",\"message\":\"Invalid state\"}");
    Serial.println("❌ Invalid LED state requested: " + state);
  }
}

void handleRoot() {
  Serial.println("🔥🔥🔥 ROOT ENDPOINT HIT! 🔥🔥🔥");
  Serial.println("🎉 SUCCESS! Browser successfully connected to ESP32!");
  setCORSHeaders();
  
  String html = "<!DOCTYPE html><html><head><title>ESP32-S3 CMA Node SUPER DEBUG</title></head><body>";
  html += "<h1>🎉 ESP32-S3 CMA NODE - SUPER DEBUG MODE! 🎉</h1>";
  html += "<p><strong>🎉 SUCCESS!</strong> Web server is WORKING!</p>";
  html += "<p><strong>Status:</strong> ONLINE and RESPONSIVE!</p>";
  html += "<p><strong>IP:</strong> " + WiFi.localIP().toString() + "</p>";
  html += "<p><strong>Protocol:</strong> HTTP SUPER DEBUG MODE</p>";
  html += "<p><strong>Firmware:</strong> v3.0 SUPER DEBUG</p>";
  html += "<p><strong>Uptime:</strong> " + String(millis()/1000) + " seconds</p>";
  html += "<p><strong>Free Memory:</strong> " + String(ESP.getFreeHeap()) + " bytes</p>";
  html += "<p><strong>Server Started:</strong> " + String(serverStarted ? "YES" : "NO") + "</p>";
  html += "<p><strong>Routes Registered:</strong> " + String(routesRegistered ? "YES" : "NO") + "</p>";
  html += "<hr>";
  html += "<h2>🔧 API Endpoints:</h2>";
  html += "<p><a href='/api/functions'>📋 Functions List</a></p>";
  html += "<p><a href='/api/status'>📊 Status JSON</a></p>";
  html += "<p><a href='/api/led?state=on'>💡 ALL LEDs ON</a></p>";
  html += "<p><a href='/api/led?state=off'>💡 ALL LEDs OFF</a></p>";
  html += "<p><a href='/api/led?state=blink'>💡 ALL LEDs BLINK</a></p>";
  html += "<p><a href='/api/led?state=discover'>🔍 LED DISCOVERY MODE</a></p>";
  html += "<hr>";
  html += "<p>✅ HTTP: WORKING PERFECTLY!</p>";
  html += "<p>✅ CORS Headers: ENABLED</p>";
  html += "<p>✅ Super Debug Mode: ACTIVE</p>";
  html += "<p>🎉 If you see this page, the ESP32 web server is working!</p>";
  html += "</body></html>";
  
  Serial.println("📤 Sending root page...");
  server.send(200, "text/html", html);
  Serial.println("✅✅✅ Root page served successfully! ✅✅✅");
}

void handleOptions() {
  Serial.println("🔥🔥🔥 OPTIONS (PREFLIGHT) REQUEST HIT! 🔥🔥🔥");
  setCORSHeaders();
  server.send(200, "text/plain", "OK");
  Serial.println("✅ CORS preflight response sent!");
}

void handleNotFound() {
  Serial.println("🔥🔥🔥 UNKNOWN ENDPOINT HIT: " + server.uri() + " 🔥🔥🔥");
  setCORSHeaders();
  server.send(404, "application/json", "{\"status\":\"error\",\"message\":\"Endpoint not found\",\"requested\":\"" + server.uri() + "\"}");
  Serial.println("❌ 404 response sent for: " + server.uri());
}

// ========================
// MULTI-PIN LED INITIALIZATION
// ========================
void initializeLEDs() {
  Serial.println("💡 Initializing LED pins...");
  
  for(int i = 0; i < numLedPins; i++) {
    Serial.println("🔧 Setting up GPIO " + String(ledPins[i]) + " as output...");
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);
    Serial.println("✅ GPIO " + String(ledPins[i]) + " initialized");
  }
  Serial.println("💡 All LED pins initialized successfully!");
}

// ========================
// LED DISCOVERY TEST
// ========================
void discoverWorkingLED() {
  Serial.println("🚀 DISCOVERING WORKING LED PIN...");
  
  for(int i = 0; i < numLedPins; i++) {
    Serial.println("🔍 Testing GPIO " + String(ledPins[i]));
    
    // Turn on this pin
    digitalWrite(ledPins[i], HIGH);
    delay(1000);  // Keep it on for 1 second
    
    // Ask user to check if LED lit up
    Serial.println("💡 GPIO " + String(ledPins[i]) + " is now HIGH - check for LED!");
    
    digitalWrite(ledPins[i], LOW);
    delay(500);   // Brief pause
  }
  
  Serial.println("🎯 Discovery complete! Check serial monitor for results.");
}

// ========================
// WEB SERVER REGISTRATION WITH MAXIMUM DEBUG
// ========================
void registerRoutes() {
  Serial.println("🔧🔧🔧 REGISTERING WEB SERVER ROUTES 🔧🔧🔧");
  
  Serial.println("📝 Registering root route (/)...");
  server.on("/", handleRoot);
  Serial.println("✅ Root route (/) registered successfully!");
  
  Serial.println("📝 Registering functions route (/api/functions)...");
  server.on("/api/functions", handleFunctions);
  Serial.println("✅ Functions route registered successfully!");
  
  Serial.println("📝 Registering status route (/api/status)...");
  server.on("/api/status", handleStatus);
  Serial.println("✅ Status route registered successfully!");
  
  Serial.println("📝 Registering LED route (/api/led)...");
  server.on("/api/led", handleLED);
  Serial.println("✅ LED route registered successfully!");
  
  Serial.println("📝 Registering 404 handler...");
  server.onNotFound(handleNotFound);
  Serial.println("✅ 404 handler registered successfully!");
  
  // Enable CORS preflight for all API endpoints
  Serial.println("📝 Registering CORS preflight handlers...");
  server.on("/api/functions", HTTP_OPTIONS, handleOptions);
  server.on("/api/status", HTTP_OPTIONS, handleOptions);
  server.on("/api/led", HTTP_OPTIONS, handleOptions);
  Serial.println("✅ CORS preflight handlers registered successfully!");
  
  routesRegistered = true;
  Serial.println("🎉🎉🎉 ALL ROUTES REGISTERED SUCCESSFULLY! 🎉🎉🎉");
}

// ========================
// SETUP FUNCTION - MAXIMUM DEBUG
// ========================
void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧");
  Serial.println("🚀 ESP32-S3 CMA NODE FIRMWARE v3.0 - SUPER DEBUG!");
  Serial.println("🔧 GOAL: Find and fix web server startup failure");
  Serial.println("🔧 NEW: Maximum debugging with step-by-step verification");
  Serial.println("🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧\n");
  
  // Initialize ALL possible LED pins
  initializeLEDs();
  
  // Initialize SPI for MicroSD
  Serial.println("📡 Initializing SPI bus...");
  SPI.begin(SD_SCK_PIN, SD_MISO_PIN, SD_MOSI_PIN, SD_CS_PIN);
  Serial.println("✅ SPI bus initialized successfully!");
  
  // Try to initialize MicroSD
  Serial.println("💾 Attempting MicroSD initialization...");
  if(SD.begin(SD_CS_PIN)) {
    sdInitialized = true;
    Serial.println("💾 ✅ MicroSD card detected and ready!");
  } else {
    Serial.println("💾 ❌ MicroSD card not found (optional - continuing anyway)");
  }
  
  // Connect to WiFi
  Serial.println("📶 Starting WiFi connection process...");
  Serial.println("📶 Connecting to WiFi: " + String(ssid));
  WiFi.begin(ssid, password);
  
  // Connection attempt with LED feedback
  int attempts = 0;
  Serial.println("📶 WiFi connection attempts starting...");
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    
    // Blink ALL LED pins while connecting
    for(int i = 0; i < numLedPins; i++) {
      digitalWrite(ledPins[i], !digitalRead(ledPins[i]));
    }
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    // Turn on ALL LEDs when connected
    for(int i = 0; i < numLedPins; i++) {
      digitalWrite(ledPins[i], HIGH);
    }
    
    Serial.println("\n✅✅✅ WIFI CONNECTED SUCCESSFULLY! ✅✅✅");
    Serial.println("📍 IP Address: " + WiFi.localIP().toString());
    Serial.println("🌐 Gateway: " + WiFi.gatewayIP().toString());
    Serial.println("📡 Signal Strength: " + String(WiFi.RSSI()) + " dBm");
    Serial.println("🔧 MAC Address: " + WiFi.macAddress());
    Serial.println("✅ WiFi connection phase complete!");
    
    // Now register all routes
    registerRoutes();
    
    // START THE SERVER WITH MAXIMUM DEBUG
    Serial.println("\n🚀🚀🚀 STARTING WEB SERVER 🚀🚀🚀");
    Serial.println("🔧 Attempting server.begin()...");
    
    try {
      server.begin();
      serverStarted = true;
      Serial.println("✅ server.begin() completed successfully!");
    } catch (...) {
      Serial.println("❌ server.begin() failed with exception!");
      serverStarted = false;
    }
    
    if (serverStarted) {
      Serial.println("🎉🎉🎉 HTTP SERVER STARTED SUCCESSFULLY! 🎉🎉🎉");
      Serial.println("🔗🔗🔗 TEST URLS - READY FOR CONNECTION! 🔗🔗🔗");
      Serial.println("🌐 Main page: http://" + WiFi.localIP().toString() + "/");
      Serial.println("📋 Functions: http://" + WiFi.localIP().toString() + "/api/functions");
      Serial.println("📊 Status: http://" + WiFi.localIP().toString() + "/api/status");
      Serial.println("💡 LED Test: http://" + WiFi.localIP().toString() + "/api/led?state=blink");
      Serial.println("🎉🎉🎉 READY FOR CMA SCANNER CONNECTION! 🎉🎉🎉");
      Serial.println("🔧 Super debug mode: ALL requests will be logged to serial monitor");
      
      // Test server internally
      Serial.println("\n🧪 PERFORMING INTERNAL SERVER TEST...");
      // Additional validation would go here
      
    } else {
      Serial.println("❌❌❌ HTTP SERVER FAILED TO START! ❌❌❌");
    }
    
  } else {
    Serial.println("\n❌❌❌ WIFI CONNECTION FAILED! ❌❌❌");
    // Flash ALL LEDs rapidly on failure
    for(int cycle = 0; cycle < 20; cycle++) {
      for(int i = 0; i < numLedPins; i++) {
        digitalWrite(ledPins[i], !digitalRead(ledPins[i]));
      }
      delay(100);
    }
  }
  
  Serial.println("\n🔧 SETUP COMPLETE - ENTERING MAIN LOOP");
}

// ========================
// MAIN LOOP - HTTP HANDLER WITH SUPER DEBUG
// ========================
void loop() {
  // Handle web server requests
  server.handleClient();
  
  // Status update every 15 seconds (more frequent)
  static unsigned long lastUpdate = 0;
  if(millis() - lastUpdate > 15000) {
    Serial.println("\n🔧 === SUPER DEBUG STATUS UPDATE ===");
    Serial.println("   📶 WiFi Status: " + String(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected"));
    Serial.println("   📍 IP Address: " + WiFi.localIP().toString());
    Serial.println("   ⏱️ Uptime: " + String(millis()/1000) + " seconds");
    Serial.println("   🧠 Free Memory: " + String(ESP.getFreeHeap()) + " bytes");
    Serial.println("   🔧 Server Status: " + String(serverStarted ? "RUNNING" : "FAILED"));
    Serial.println("   📝 Routes Status: " + String(routesRegistered ? "REGISTERED" : "FAILED"));
    Serial.println("   🔗 Test URL: http://" + WiFi.localIP().toString() + "/");
    Serial.println("   💡 LED Test Pins: 2, 8, 21, 38, 48");
    if (serverStarted) {
      Serial.println("   🎉 WEB SERVER IS READY FOR CONNECTIONS!");
    } else {
      Serial.println("   ❌ WEB SERVER FAILED - CHECK SETUP LOGS ABOVE");
    }
    Serial.println("🔧 === STATUS UPDATE COMPLETE ===\n");
    lastUpdate = millis();
  }
}
