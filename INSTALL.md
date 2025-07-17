# Installation Guide

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 18.x or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for dependencies

### For Hardware Integration
- **ESP32-S3**: For mesh networking features
- **Rust**: Latest stable version for WASM compilation
- **Python 3.8+**: For hardware communication scripts

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/cma-neural-os.git
cd cma-neural-os
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Detailed Installation

### Development Environment Setup

#### 1. Install Node.js
Download and install from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

#### 2. Install Rust (for WASM modules)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

#### 3. Clone and Setup Project
```bash
git clone https://github.com/your-org/cma-neural-os.git
cd cma-neural-os
npm install
```

#### 4. Build WASM Modules
```bash
cd src/rust/reasoning_engine
wasm-pack build --target web --release
mkdir -p ../../../public/wasm/
cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm
cd ../../..
```

#### 5. Start Development
```bash
npm run dev
```

## Hardware Integration Setup

### ESP32 Configuration

#### 1. Install ESP32 Development Tools
```bash
# Install ESP-IDF
mkdir -p ~/esp
cd ~/esp
git clone --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
./install.sh
source ./export.sh
```

#### 2. Flash ESP32 Firmware
```bash
cd hardware/esp32
idf.py build
idf.py -p /dev/ttyUSB0 flash  # Adjust port as needed
```

#### 3. Configure Network
Update `hardware/esp32/main/wifi_config.h` with your network settings:
```c
#define WIFI_SSID "your_network"
#define WIFI_PASS "your_password"
#define MESH_ID "cma_mesh_001"
```

## Production Deployment

### Docker Deployment
```bash
docker build -t cma-neural-os .
docker run -p 3000:3000 cma-neural-os
```

### Using Docker Compose
```bash
docker-compose up -d
```

### Manual Deployment
```bash
npm run build
npm run preview
```

## Platform-Specific Instructions

### Windows

#### Prerequisites
- Install Visual Studio Build Tools
- Install Git for Windows
- Install Windows Subsystem for Linux (WSL) recommended

#### Setup
```powershell
# Install dependencies
npm install --production-windows-build-tools
npm install

# Build WASM (requires WSL or Git Bash)
wsl bash -c "cd src/rust/reasoning_engine && wasm-pack build --target web --release"
```

### macOS

#### Prerequisites
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Setup
```bash
brew install node rust
npm install
```

### Linux (Ubuntu/Debian)

#### Prerequisites
```bash
sudo apt update
sudo apt install -y curl build-essential git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Setup
```bash
npm install
```

## Configuration

### Environment Variables
Create a `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_HARDWARE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Hardware Configuration
Edit `src/config/hardware.json`:
```json
{
  "esp32": {
    "mesh_id": "cma_mesh_001",
    "channel": 6,
    "max_nodes": 50
  },
  "coordination": {
    "heartbeat_interval": 5000,
    "discovery_timeout": 30000
  }
}
```

## Verification

### 1. Check Installation
```bash
npm run test
npm run build
```

### 2. Verify WASM Modules
Visit `http://localhost:5173/developer` and run the WASM module tests.

### 3. Test Hardware Integration
```bash
npm run test:hardware
```

## Troubleshooting

### Common Issues

#### WASM Module Errors
```bash
# Rebuild WASM modules
cd src/rust/reasoning_engine
wasm-pack build --target web --release --dev
```

#### Port Conflicts
```bash
# Use different port
npm run dev -- --port 3001
```

#### Permission Errors (Linux/macOS)
```bash
sudo chown -R $(whoami) ~/.npm
```

### Hardware Issues

#### ESP32 Not Detected
1. Check USB cable and drivers
2. Verify port permissions: `sudo usermod -a -G dialout $USER`
3. Restart terminal/computer

#### Network Issues
1. Check WiFi credentials in ESP32 config
2. Verify network firewall settings
3. Test mesh connectivity with debug tools

## Getting Help

📧 **Contact**: arthur@aurixlabs.ai

For installation issues, questions, or support.

## Next Steps

After successful installation:
1. Read the [Quick Start Guide](QUICK_START_GUIDE.md)
2. Follow the [Tutorial](docs/tutorial.md)
3. Explore [Example Applications](docs/examples/)
4. Contact arthur@aurixlabs.ai for community information