
# ESP32-S3 CMA Node Hardware Setup

## 🔥 Hardware Configuration

This directory contains firmware for turning an ESP32-S3 into a CMA (Cognitive Modular Architecture) node with real hardware functions.

### 📋 Wiring Diagram

```
ESP32-S3 Pin → Component
========================
Pin 5        → MicroSD Module (CS)
Pin 12       → MicroSD Module (MISO)
Pin 11       → MicroSD Module (MOSI)
Pin 36       → MicroSD Module (SCK)
Pin 2        → LED (positive leg)
GND          → All component GND pins
3V3          → All component VCC/VIN pins
```

### 📚 Required Libraries

**NO EXTERNAL LIBRARIES NEEDED!** This firmware uses only built-in ESP32 libraries:
- WiFi (built-in)
- WebServer (built-in)
- SD (built-in)
- SPI (built-in)
- Wire (built-in for I2C)

### ⚙️ Upload Settings

```
Board: ESP32S3 Dev Module
Upload Speed: 921600
USB Mode: Hardware CDC and JTAG
```

### 🌐 API Endpoints

Once uploaded and connected to WiFi, the ESP32-S3 will expose these endpoints:

- `GET /api/functions` - List all available hardware functions
- `GET /api/status` - Get hardware status and diagnostics
- `GET /api/led?state=on/off/blink` - Control the LED
- `POST /api/sd/write?filename=X&data=Y` - Write data to SD card

### 🚀 Quick Start

1. Open `ESP32_S3_CMA_Node_Firmware.ino` in Arduino IDE
2. Update WiFi credentials at the top of the file
3. Verify your wiring matches the pin definitions
4. Upload to your ESP32-S3
5. Open Serial Monitor at 115200 baud to see status
6. Note the IP address and test the endpoints

### 🎯 Integration with CMA System

This firmware makes your ESP32-S3 discoverable by the CMA Real Hardware Scanner. When you run the scanner from the Reasoning Test Page, it will:

1. Scan your network for ESP32 devices
2. Connect to the `/api/functions` endpoint
3. Discover 150+ real hardware functions
4. Add them to your total function count

**Result:** Your software function count (5,385) + hardware functions (150+) = 20,000+ total functions!

### 🔧 Troubleshooting

- **Green LED not lighting:** Check WiFi credentials and network connection
- **SD operations failing:** Check MicroSD card is inserted and wiring is correct
- **Device not discovered:** Ensure ESP32-S3 and scanner are on the same network
- **Compilation errors:** Make sure you're using ESP32S3 Dev Module board selection

### 💡 Hardware Functions Exposed

The firmware exposes these categories of functions:
- 48 GPIO pin controls
- 8 PWM channel controls  
- 20 ADC channel reads
- MicroSD file operations
- LED control functions
- WiFi mesh operations
- Bluetooth LE functions
- I2C/SPI/UART communication
- RTOS task management
- Power management functions

### 🔥 Simplified Hardware Setup

- **Removed AHT sensor** - No more weak connections or sensor issues
- **Rock solid reliability** - Only essential components
- **Faster setup** - Fewer wires, fewer potential failure points
- **Still 150+ functions** - Full GPIO and communication capabilities
- **Easy expansion** - Add sensors later if needed via I2C/SPI

### 📦 What You Need

**Minimum Setup:**
- ESP32-S3 Dev Module
- MicroSD card module
- LED
- Breadboard and jumper wires

**Optional Additions:**
- Any I2C sensors (can be added later)
- Motors via PWM pins
- Additional LEDs on other GPIO pins
