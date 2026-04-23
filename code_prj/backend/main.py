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

# from fastapi import FastAPI, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from database import SensorReading, PumpCommand, get_db
# from datetime import datetime

# app = FastAPI(redirect_slashes=False)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ── Models ──────────────────────────────────────────────
# class PlantData(BaseModel):
#     plant_type: str
#     soil_moisture: int
#     temperature: float
#     air_humidity: float
#     pump_status: bool

# class PumpControl(BaseModel):
#     command: bool  # True = ON, False = OFF

# class PlantConfig(BaseModel):
#     plant_type: str

# current_plant = {"plant_type": "tomate"}  # in-memory default

# # ── ESP32 sends sensor data ──────────────────────────────
# @app.post("/sensor-data")
# @app.post("/sensor-data/")
# async def receive_data(data: PlantData, db: Session = Depends(get_db)):
#     reading = SensorReading(**data.dict())
#     db.add(reading)
#     db.commit()
#     db.refresh(reading)
#     print(f"💾 Saved → {data.plant_type} | Soil: {data.soil_moisture}% | Temp: {data.temperature}°C")
#     return {"message": "Data received successfully", "id": reading.id}

# # ── ESP32 polls this to get pump command ─────────────────
# @app.get("/pump-command")
# async def get_pump_command(db: Session = Depends(get_db)):
#     latest = db.query(PumpCommand).order_by(PumpCommand.id.desc()).first()
#     if latest:
#         return {"pump_on": latest.command}
#     return {"pump_on": False}  # default OFF

# # ── Dashboard sends pump ON/OFF ──────────────────────────
# @app.post("/pump-control")
# async def control_pump(cmd: PumpControl, db: Session = Depends(get_db)):
#     command = PumpCommand(command=cmd.command)
#     db.add(command)
#     db.commit()
#     return {"message": f"Pump {'ON' if cmd.command else 'OFF'} command sent"}

# # ── Dashboard fetches historical data ────────────────────
# @app.get("/readings")
# async def get_readings(limit: int = 50, db: Session = Depends(get_db)):
#     readings = db.query(SensorReading).order_by(SensorReading.id.desc()).limit(limit).all()
#     return readings

# # ── Latest reading (for dashboard live view) ─────────────
# @app.get("/readings/latest")
# async def get_latest(db: Session = Depends(get_db)):
#     latest = db.query(SensorReading).order_by(SensorReading.id.desc()).first()
#     return latest

# # ── Plant endpoints ─────────────
# @app.post("/set-plant")
# async def set_plant(config: PlantConfig):
#     current_plant["plant_type"] = config.plant_type
#     return {"message": f"Plant set to {config.plant_type}"}

# @app.get("/get-plant")
# async def get_plant():
#     return current_plant


from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SensorReading, PumpCommand, get_db
from datetime import datetime, timedelta
import requests

app = FastAPI(redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory state ──────────────────────────────────────
current_plant = {"plant_type": "tomate"}
pump_state = {"command": False, "manual_override": False, "override_until": None}

# ── Models ───────────────────────────────────────────────
class PlantData(BaseModel):
    plant_type: str
    soil_moisture: int
    temperature: float
    air_humidity: float
    pump_status: bool

class PumpControl(BaseModel):
    command: bool
    manual: bool = True

class PlantConfig(BaseModel):
    plant_type: str

# ── ESP32 sends sensor data ──────────────────────────────
@app.post("/sensor-data")
@app.post("/sensor-data/")
async def receive_data(data: PlantData, db: Session = Depends(get_db)):
    # 1. Save to DB
    reading = SensorReading(**data.dict())
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # 2. Only call AI if user hasn't manually overridden
    if not pump_state["manual_override"]:
        try:
            response = requests.post("http://localhost:8001/predict", json={
                "soil_moisture": data.soil_moisture,
                "air_humidity":  data.air_humidity,
                "temperature":   data.temperature,
                "plant_type":    data.plant_type
            }, timeout=5)

            if response.status_code == 200:
                ai = response.json()
                new_cmd = ai["pump_on"]

                # Only write to DB if state actually changed
                if new_cmd != pump_state["command"]:
                    pump_state["command"] = new_cmd
                    db.add(PumpCommand(command=new_cmd))
                    db.commit()

                print(f"🤖 AI → {ai['decision']} | Confidence: {ai['confidence_percent']}% | Pump: {'ON' if new_cmd else 'OFF'} | Reason: {ai['reason']}")

        except Exception as e:
            print(f"⚠️ AI service unreachable: {e} — continuing without AI")
    else:
        print(f"🔒 Manual override active until {pump_state['override_until']}, skipping AI")

    print(f"💾 {data.plant_type} | Soil:{data.soil_moisture}% | Temp:{data.temperature}°C | Pump:{pump_state['command']}")
    return {"message": "Data received successfully", "id": reading.id}

# ── ESP32 polls for pump command ─────────────────────────
@app.get("/pump-command")
async def get_pump_command():
    # Check if manual override expired
    if pump_state["manual_override"] and pump_state["override_until"]:
        if datetime.utcnow() > pump_state["override_until"]:
            pump_state["manual_override"] = False
            pump_state["override_until"] = None
            print("⏱️ Manual override expired, AI resumes")

    return {
        "pump_on": pump_state["command"],
        "manual_override": pump_state["manual_override"],
    }

# ── Dashboard controls pump manually ────────────────────
@app.post("/pump-control")
async def control_pump(cmd: PumpControl, db: Session = Depends(get_db)):
    if cmd.manual:
        pump_state["manual_override"] = True
        # pump_state["override_until"] = datetime.utcnow() + timedelta(minutes=30)
        pump_state["override_until"] = datetime.utcnow() + timedelta(seconds=10)
    pump_state["command"] = cmd.command
    db.add(PumpCommand(command=cmd.command))
    db.commit()
    return {
        "message": f"Pump {'ON' if cmd.command else 'OFF'}",
        "manual_override": pump_state["manual_override"],
        "override_until": pump_state["override_until"],
    }

# ── Plant type ───────────────────────────────────────────
@app.post("/set-plant")
async def set_plant(config: PlantConfig):
    current_plant["plant_type"] = config.plant_type
    return {"message": f"Plant set to {config.plant_type}"}

@app.get("/get-plant")
async def get_plant():
    return current_plant

# ── Dashboard data ───────────────────────────────────────
@app.get("/readings")
async def get_readings(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(SensorReading).order_by(SensorReading.id.desc()).limit(limit).all()

@app.get("/readings/latest")
async def get_latest(db: Session = Depends(get_db)):
    return db.query(SensorReading).order_by(SensorReading.id.desc()).first()

# ── AI prediction passthrough (for dashboard) ────────────
@app.get("/ai-status")
async def ai_status():
    """Dashboard can call this to show last AI decision"""
    try:
        r = requests.get("http://localhost:8001/docs", timeout=2)
        return {"ai_online": r.status_code == 200}
    except:
        return {"ai_online": False}