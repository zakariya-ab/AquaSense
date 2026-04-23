# Aquasence

An intelligent IoT-based plant watering system built on ESP32 that automatically monitors and controls plant hydration using environmental sensors and cloud connectivity.

## Overview

Aquasence is a smart gardening solution that combines hardware sensors with cloud connectivity to provide automated plant watering. The system monitors temperature and humidity levels in real-time and communicates with a backend server to optimize watering schedules based on plant type.

## Features

- **Automated Watering Control**: Relay-based pump control for precise watering management
- **Environmental Monitoring**: DHT22 temperature and humidity sensor readings
- **WiFi Connectivity**: Real-time data transmission to cloud backend
- **LCD Display**: 16x2 character display for local information display
- **Multi-Plant Support**: Adapts watering logic based on plant type (e.g., tomato)
- **Remote Control**: Backend server integration for pump command and configuration
- **Data Logging**: Continuous sensor data collection via HTTP API

## Hardware Requirements

- **Microcontroller**: ESP32 Development Board
- **Sensors**: DHT22 temperature/humidity sensor
- **Display**: 16x2 LCD with I2C interface
- **Actuator**: Water pump with relay module
- **Connectivity**: WiFi (2.4GHz)

## Pin Configuration

- **GPIO 4**: DHT22 data pin
- **GPIO 2**: Pump relay control
- **I2C**: LCD display (default address: 0x27)

## Software Dependencies

The project uses the following libraries:
- **PubSubClient** - MQTT messaging protocol
- **ArduinoJson** - JSON parsing for API responses
- **DHT Sensor Library** - Temperature and humidity sensor support
- **LiquidCrystal_I2C** - LCD display control

## Getting Started

### Prerequisites

- [PlatformIO](https://platformio.org/) installed
- ESP32 board support configured
- WiFi network access (tested with Wokwi-GUEST)

### Installation

1. Clone or download this repository
2. Open the project in PlatformIO
3. Update WiFi credentials in `src/main.cpp`:
   ```cpp
   const char* ssid = "YOUR_SSID";
   const char* password = "YOUR_PASSWORD";
   ```
4. Configure the backend server URL:
   ```cpp
   const char* serverUrl = "http://YOUR_SERVER:PORT/sensor-data/";
   ```
5. Build and upload to ESP32:
   ```bash
   platformio run --target upload
   ```

## API Integration

### Sensor Data Upload
The device sends sensor readings to the backend:
```
POST /sensor-data/
Content-Type: application/json

{
  "temperature": 25.5,
  "humidity": 65.0,
  "plant_type": "tomate"
}
```

### Pump Control Commands
The device polls for pump control commands:
```
GET /get-plant
Response:
{
  "pump_on": true|false,
  "plant_type": "tomate"
}
```

## Operation

1. **Startup**: Device connects to WiFi and initializes sensors
2. **Monitoring**: Reads temperature and humidity every 10 seconds
3. **Polling**: Checks for pump commands every 5 seconds
4. **Data Transmission**: Sends sensor data to backend server every 10 seconds
5. **Pump Control**: Receives commands from backend and controls relay accordingly

## Configuration

Key timing parameters in `src/main.cpp`:
- `timerDelay = 10000` - Sensor reading interval (10 seconds)
- `pumpCheckDelay = 5000` - Pump command check interval (5 seconds)

## Testing & Simulation

The project includes Wokwi simulation configuration for virtual testing:
- Use `wokwi.toml` for circuit simulation
- `diagram.json` defines the virtual hardware setup

## Project Structure

```
aquasence/
├── src/
│   └── main.cpp          # Main firmware code
├── include/              # Header files
├── lib/                  # Custom libraries
├── test/                 # Test files
├── platformio.ini        # PlatformIO configuration
├── wokwi.toml           # Wokwi simulator config
├── diagram.json         # Wokwi circuit diagram
└── README.md            # This file
```

## Future Enhancements

- [ ] MQTT integration for pub/sub messaging
- [ ] Machine learning-based watering predictions
- [ ] Multiple plant support with independent zones
- [ ] Mobile app integration
- [ ] Soil moisture sensor support
- [ ] Battery backup and monitoring
- [ ] Enhanced error handling and recovery

## Troubleshooting

### WiFi Connection Issues
- Verify SSID and password are correct
- Check WiFi network is 2.4GHz compatible
- Increase WiFi timeout if connection is slow

### Sensor Not Reading
- Verify DHT22 is properly connected to GPIO 4
- Check sensor is not damaged (fan test with a simple sketch)
- Ensure proper pull-up resistors on data line

### Pump Not Responding
- Test relay directly with a multimeter
- Check GPIO 2 output with Serial.println()
- Verify backend server is running and responding

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

## Support

For issues, questions, or suggestions, please refer to the project documentation or contact the development team.
