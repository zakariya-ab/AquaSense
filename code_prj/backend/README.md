# AquaSense Backend

This is the backend API for the AquaSense IoT system, built with FastAPI. It handles sensor data from ESP32 devices, stores readings in a PostgreSQL database, and provides endpoints for pump control and data retrieval for the dashboard.

## Technologies

- **FastAPI**: Web framework for building APIs
- **SQLAlchemy**: ORM for database interactions
- **PostgreSQL**: Database for storing sensor readings and pump commands
- **Pydantic**: Data validation and serialization

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up PostgreSQL database:
   - Create a database named `aquasence`
   - Update the `DATABASE_URL` in `database.py` if needed

3. Run the database migrations (tables are created automatically on startup)

## Running the Server

Start the server with uvicorn:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Sensor Data

- `POST /sensor-data`: Receive sensor data from ESP32 (plant_type, soil_moisture, temperature, air_humidity, pump_status)
- `GET /readings`: Fetch historical sensor readings (limit parameter)
- `GET /readings/latest`: Get the latest sensor reading

### Pump Control

- `GET /pump-command`: ESP32 polls for pump command (ON/OFF)
- `POST /pump-control`: Dashboard sends pump control command

### Models

- **SensorReading**: Stores sensor data with timestamp
- **PumpCommand**: Stores pump control commands with timestamp

## Database Schema

- `sensor_readings`: id, plant_type, soil_moisture, temperature, air_humidity, pump_status, timestamp
- `pump_commands`: id, command, timestamp

## Development

- The database tables are created automatically when the app starts
- CORS is enabled for all origins for development
- Logs sensor data reception to console