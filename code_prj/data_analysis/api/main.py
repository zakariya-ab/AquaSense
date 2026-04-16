"""
AquaSense – Microservice FastAPI IA
=====================================
Auteur  : Abdellah (Data/IA Specialist)
Port    : 8001
Rôle    : Exposer le modèle d'irrigation intelligent comme une API REST.

Flux :
    ESP32 → Backend FastAPI (port 8000)
        → POST /predict (ce service, port 8001)
        → smart_irrigation_decision()
        → {"pump_on": true/false, "decision": "ARROSER", ...}
    → Backend → ESP32

Endpoints :
    POST /predict      → Prédiction d'irrigation (principal)
    GET  /health       → Vérifier que le service est vivant
    GET  /model-info   → Informations sur le modèle
"""

import sys
import os

# ── Permettre les imports depuis le dossier parent ─────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import logging

# ── Import du modèle IA ────────────────────────────────────────────────────────
try:
    from ai_models.simple_model import SimpleIrrigationModel
    ai_predictor = SimpleIrrigationModel()
    MODEL_AVAILABLE = True
except Exception as e:
    MODEL_AVAILABLE = False
    print(f"[WARN] Modèle IA non disponible : {e}. Mode règles métier seulement.")

# ── Configuration du logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s – %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("aquasense-ai")

# ── Seuils par type de plante ──────────────────────────────────────────────────
# Chaque plante a un seuil d'humidité minimum différent
PLANT_THRESHOLDS = {
    "tomate":      {"low": 40, "high": 75},
    "tomato":      {"low": 40, "high": 75},
    "laitue":      {"low": 50, "high": 80},
    "lettuce":     {"low": 50, "high": 80},
    "poivron":     {"low": 35, "high": 70},
    "bell pepper": {"low": 35, "high": 70},
    "courgette":   {"low": 38, "high": 72},
    "zucchini":    {"low": 38, "high": 72},
    "carotte":     {"low": 30, "high": 65},
    "carrot":      {"low": 30, "high": 65},
    "oignon":      {"low": 30, "high": 65},
    "onion":       {"low": 30, "high": 65},
    "pomme de terre": {"low": 45, "high": 75},
    "potato":      {"low": 45, "high": 75},
    "concombre":   {"low": 50, "high": 80},
    "cucumber":    {"low": 50, "high": 80},
    "default":     {"low": 35, "high": 70},
}


# ═════════════════════════════════════════════════════════════════════════════
# Modèles Pydantic (validation des données)
# ═════════════════════════════════════════════════════════════════════════════

class SensorData(BaseModel):
    """Données reçues de l'ESP32 (via le backend)."""
    soil_moisture: float = Field(..., ge=0, le=100, description="Humidité du sol (%)")
    air_humidity: float  = Field(..., ge=0, le=100, description="Humidité de l'air (%)")
    temperature: float   = Field(..., ge=-10, le=60, description="Température (°C)")
    plant_type: Optional[str] = Field(default="default", description="Type de plante")

    @validator("plant_type", pre=True, always=True)
    def normalize_plant(cls, v):
        return (v or "default").lower().strip()

    class Config:
        schema_extra = {
            "example": {
                "soil_moisture": 28.5,
                "air_humidity": 40.0,
                "temperature": 24.0,
                "plant_type": "tomate"
            }
        }


class PredictionResponse(BaseModel):
    """Réponse envoyée au backend avec la décision d'irrigation."""
    pump_on: bool                    # True = activer la pompe
    decision: str                    # "ARROSER" | "NE PAS ARROSER" | "ATTENDRE"
    confidence_percent: float        # Confiance du modèle (%)
    rain_expected: bool              # Pluie prévue dans les 3 prochaines heures
    rain_mm_3h: float                # Quantité de pluie prévue (mm)
    reason: str                      # Explication de la décision
    soil_moisture: float             # Valeur reçue du capteur
    plant_type: str                  # Type de plante
    threshold_low: float             # Seuil bas utilisé pour cette plante
    threshold_high: float            # Seuil haut utilisé pour cette plante
    timestamp: str                   # Horodatage de la décision


# ═════════════════════════════════════════════════════════════════════════════
# Initialisation FastAPI
# ═════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="AquaSense AI Service",
    description="Microservice d'intelligence artificielle pour le système d'irrigation AquaSense",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI → http://localhost:8001/docs
    redoc_url="/redoc",
)

# ── CORS : allow backend (port 8000) and frontend (port 5173) ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # En production, limiter aux IP du backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═════════════════════════════════════════════════════════════════════════════
# Endpoint principal : Prédiction d'irrigation
# ═════════════════════════════════════════════════════════════════════════════

@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Décision d'irrigation",
    description="Reçoit les données des capteurs ESP32 et retourne si la pompe doit être activée."
)
async def predict_irrigation(data: SensorData):
    """
    Point d'entrée principal appelé par le Backend FastAPI.

    Le backend appelle cet endpoint juste après avoir reçu les données de l'ESP32.
    La réponse `pump_on` est ensuite renvoyée à l'ESP32.
    """
    logger.info(
        f"Requête reçue → sol={data.soil_moisture}% | "
        f"air={data.air_humidity}% | temp={data.temperature}°C | "
        f"plante={data.plant_type}"
    )

    # ── Seuils adaptés au type de plante ──────────────────────────────────────
    thresholds = PLANT_THRESHOLDS.get(data.plant_type, PLANT_THRESHOLDS["default"])
    threshold_low  = thresholds["low"]
    threshold_high = thresholds["high"]

    try:
        # ── Règles plante prioritaires (seuils clairs) ─────────────────────────
        # Si le sol est CLAIREMENT sec ou CLAIREMENT humide → on ne laisse pas
        # le modèle ML (entraîné sur données génériques) contredire les seuils.
        if data.soil_moisture >= threshold_high:
            result = {
                "decision": "NE PAS ARROSER",
                "reason": f"Sol bien humide ({data.soil_moisture}% >= {threshold_high}% pour {data.plant_type})",
                "confidence_%": 98.0,
                "rain_info": {"rain_expected": False, "total_mm": 0.0},
            }
        elif data.soil_moisture < threshold_low * 0.7:
            # Sol très sec (< 70% du seuil bas) → arroser sans hésiter
            result = {
                "decision": "ARROSER",
                "reason": f"Sol tres sec ({data.soil_moisture}% << {threshold_low}% pour {data.plant_type})",
                "confidence_%": 97.0,
                "rain_info": {"rain_expected": False, "total_mm": 0.0},
            }
        elif MODEL_AVAILABLE:
            # ── Zone intermédiaire : laisser le modèle ML décider ─────────────
            result = ai_predictor.predict(
                plant_type=data.plant_type,
                temperature=data.temperature,
                soil_humidity=data.soil_moisture,
                air_humidity=data.air_humidity
            )
        else:
            result = _rule_based_decision(data, threshold_low, threshold_high)

    except Exception as e:
        logger.error(f"Erreur modele IA : {e} - Basculement sur regles metier")
        result = _rule_based_decision(data, threshold_low, threshold_high)

    # ── Construction de la réponse ────────────────────────────────────────────
    decision    = result.get("decision", "ATTENDRE")
    pump_on     = decision == "ARROSER"
    rain_info   = result.get("rain_info", {})
    confidence  = result.get("confidence_%", 100.0 if not MODEL_AVAILABLE else 0.0)
    reason      = result.get("reason", result.get("message", "Décision automatique"))

    logger.info(f"Décision → {decision} | Pompe={'ON' if pump_on else 'OFF'} | Confiance={confidence}%")

    return PredictionResponse(
        pump_on            = pump_on,
        decision           = decision,
        confidence_percent = round(confidence, 1),
        rain_expected      = rain_info.get("rain_expected", result.get("rain_expected", False)),
        rain_mm_3h         = rain_info.get("total_mm",      result.get("rain_mm_3h", 0.0)),
        reason             = reason,
        soil_moisture      = data.soil_moisture,
        plant_type         = data.plant_type,
        threshold_low      = threshold_low,
        threshold_high     = threshold_high,
        timestamp          = datetime.now().isoformat(),
    )


# ═════════════════════════════════════════════════════════════════════════════
# Règles métier (fallback sans modèle)
# ═════════════════════════════════════════════════════════════════════════════

def _rule_based_decision(data: SensorData, low: float, high: float) -> dict:
    """Décision simple basée sur des seuils quand le modèle n'est pas disponible."""
    if data.soil_moisture >= high:
        return {
            "decision": "NE PAS ARROSER",
            "reason": f"Sol bien humide ({data.soil_moisture}% ≥ {high}%)",
            "confidence_%": 95.0,
            "rain_info": {"rain_expected": False, "total_mm": 0.0},
        }
    elif data.soil_moisture < low:
        return {
            "decision": "ARROSER",
            "reason": f"Sol trop sec ({data.soil_moisture}% < {low}% pour {data.plant_type})",
            "confidence_%": 90.0,
            "rain_info": {"rain_expected": False, "total_mm": 0.0},
        }
    else:
        return {
            "decision": "ATTENDRE",
            "reason": f"Humidité intermédiaire ({data.soil_moisture}%) – surveillance",
            "confidence_%": 70.0,
            "rain_info": {"rain_expected": False, "total_mm": 0.0},
        }


# ═════════════════════════════════════════════════════════════════════════════
# Endpoints auxiliaires
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/health", summary="Vérification du service")
async def health_check():
    """Vérifie que le service IA est opérationnel."""
    return {
        "status": "ok",
        "service": "AquaSense AI Microservice",
        "model_loaded": MODEL_AVAILABLE,
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/model-info", summary="Informations sur le modèle")
async def model_info():
    """Retourne les informations sur le modèle et les seuils configurés."""
    return {
        "model_type": "Random Forest Classifier" if MODEL_AVAILABLE else "Rule-Based",
        "model_available": MODEL_AVAILABLE,
        "features": [
            "soil_humidity", "air_humidity", "temperature",
            "hour_of_day", "rain_1h", "rain_3h", "rain_6h",
            "temp_max_6h", "et0_next_6h"
        ],
        "decisions": ["ARROSER", "NE PAS ARROSER", "ATTENDRE"],
        "plant_thresholds": PLANT_THRESHOLDS,
        "weather_api": "Open-Meteo (gratuite, sans clé)",
        "version": "1.0.0",
    }


# ═════════════════════════════════════════════════════════════════════════════
# Point d'entrée direct
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    print("=" * 55)
    print("  AquaSense AI Microservice")
    print("  Port    : 8001")
    print("  Swagger : http://localhost:8001/docs")
    print("=" * 55)
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
