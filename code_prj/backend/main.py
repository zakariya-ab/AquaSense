# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

# app = FastAPI(redirect_slashes=False)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class PlantData(BaseModel):
#     plant_type: str
#     soil_moisture: int
#     temperature: float
#     air_humidity: float
#     pump_status: bool

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}

# @app.post("/sensor-data")
# @app.post("/sensor-data/")
# async def receive_data(data: PlantData):
#     print(f"Received → Plant: {data.plant_type} | Soil: {data.soil_moisture}% | Temp: {data.temperature}°C | Humidity: {data.air_humidity}% | Pump: {data.pump_status}")
#     return {"message": "Data received successfully"}

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SensorReading, PumpCommand, get_db
from datetime import datetime

app = FastAPI(redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────
class PlantData(BaseModel):
    plant_type: str
    soil_moisture: int
    temperature: float
    air_humidity: float
    pump_status: bool

class PumpControl(BaseModel):
    command: bool  # True = ON, False = OFF

class PlantConfig(BaseModel):
    plant_type: str

current_plant = {"plant_type": "tomate"}  # in-memory default

# ── ESP32 sends sensor data ──────────────────────────────
@app.post("/sensor-data")
@app.post("/sensor-data/")
async def receive_data(data: PlantData, db: Session = Depends(get_db)):
    reading = SensorReading(**data.dict())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    print(f"💾 Saved → {data.plant_type} | Soil: {data.soil_moisture}% | Temp: {data.temperature}°C")
    return {"message": "Data received successfully", "id": reading.id}

# ── ESP32 polls this to get pump command ─────────────────
@app.get("/pump-command")
async def get_pump_command(db: Session = Depends(get_db)):
    latest = db.query(PumpCommand).order_by(PumpCommand.id.desc()).first()
    if latest:
        return {"pump_on": latest.command}
    return {"pump_on": False}  # default OFF

# ── Dashboard sends pump ON/OFF ──────────────────────────
@app.post("/pump-control")
async def control_pump(cmd: PumpControl, db: Session = Depends(get_db)):
    command = PumpCommand(command=cmd.command)
    db.add(command)
    db.commit()
    return {"message": f"Pump {'ON' if cmd.command else 'OFF'} command sent"}

# ── Dashboard fetches historical data ────────────────────
@app.get("/readings")
async def get_readings(limit: int = 50, db: Session = Depends(get_db)):
    readings = db.query(SensorReading).order_by(SensorReading.id.desc()).limit(limit).all()
    return readings

# ── Latest reading (for dashboard live view) ─────────────
@app.get("/readings/latest")
async def get_latest(db: Session = Depends(get_db)):
    latest = db.query(SensorReading).order_by(SensorReading.id.desc()).first()
    return latest

# ── Plant endpoints ─────────────
@app.post("/set-plant")
async def set_plant(config: PlantConfig):
    current_plant["plant_type"] = config.plant_type
    return {"message": f"Plant set to {config.plant_type}"}

@app.get("/get-plant")
async def get_plant():
    return current_plant