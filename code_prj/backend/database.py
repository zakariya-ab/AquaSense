from sqlalchemy import create_engine, Column, Integer, Float, Boolean, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "postgresql://postgres:postgres@localhost/aquasence"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id            = Column(Integer, primary_key=True, index=True)
    plant_type    = Column(String)
    soil_moisture = Column(Integer)
    temperature   = Column(Float)
    air_humidity  = Column(Float)
    pump_status   = Column(Boolean)
    timestamp     = Column(DateTime, default=datetime.utcnow)

class PumpCommand(Base):
    __tablename__ = "pump_commands"
    id         = Column(Integer, primary_key=True, index=True)
    command    = Column(Boolean)  # True = ON, False = OFF
    timestamp  = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()