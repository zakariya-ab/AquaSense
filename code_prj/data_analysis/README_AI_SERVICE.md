# 🤖 AquaSense – Microservice Intelligence Artificielle
**Auteur :** [Votre nom]  
**Rôle :** Modèle de prédiction d'irrigation automatique  
**Port :** `8001`

---

## 📁 Fichiers à récupérer depuis ce repo

```
📁 api/
    └── main.py             ← Le microservice FastAPI IA (à lancer sur port 8001)
📁 ai_models/
    └── simple_model.py     ← Le modèle Random Forest d'irrigation
requirements.txt            ← Les dépendances Python à installer
```

> ⚠️ **NE PAS toucher** aux fichiers `database.py`, `main.py` (racine) – ce sont mes fichiers de test local.

---

## 🚀 Comment lancer le service IA

### 1. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 2. Lancer le microservice IA
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

Le service sera disponible sur : `http://localhost:8001`  
Documentation Swagger : `http://localhost:8001/docs`

---

## 🔌 Comment intégrer dans ton backend (Zakaria)

### Étape 1 – Ajouter l'import dans ton `main.py`
```python
import requests
```

### Étape 2 – Modifier ta route `/sensor-data`
Juste après avoir sauvegardé les données en base de données, ajoute cet appel :

```python
@app.post("/sensor-data")
@app.post("/sensor-data/")
async def receive_data(data: PlantData, db: Session = Depends(get_db)):
    # --- TON CODE ORIGINAL (sauvegarde en base) ---
    reading = SensorReading(**data.dict())
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # --- APPEL AU MODÈLE IA (ajouter ces lignes) ---
    try:
        response = requests.post("http://localhost:8001/predict", json={
            "soil_moisture": data.soil_moisture,
            "air_humidity":  data.air_humidity,
            "temperature":   data.temperature,
            "plant_type":    data.plant_type
        }, timeout=5)
        if response.status_code == 200:
            ai = response.json()
            cmd = PumpCommand(command=ai["pump_on"])
            db.add(cmd)
            db.commit()
            print(f"🤖 IA → {ai['decision']} | Pompe={'ON' if ai['pump_on'] else 'OFF'}")
    except Exception as e:
        print(f"⚠️ Service IA injoignable : {e}")  # Le backend continue sans IA si problème

    return {"message": "Data received successfully", "id": reading.id}
```

---

## 📡 Endpoint principal : `POST /predict`

**URL :** `http://localhost:8001/predict`

### Corps de la requête (JSON)
```json
{
  "soil_moisture": 30.0,
  "air_humidity":  45.0,
  "temperature":   25.5,
  "plant_type":    "tomate"
}
```

### Réponse du modèle (JSON)
```json
{
  "pump_on":            true,
  "decision":           "ARROSER",
  "confidence_percent": 97.0,
  "rain_expected":      false,
  "rain_mm_3h":         0.0,
  "reason":             "Sol tres sec (30.0% << 40% pour tomate)",
  "soil_moisture":      30.0,
  "plant_type":         "tomate",
  "threshold_low":      40.0,
  "threshold_high":     75.0,
  "timestamp":          "2026-04-16T23:19:32"
}
```

### Champ important pour la pompe
| Champ | Type | Description |
|---|---|---|
| `pump_on` | `bool` | `true` = activer la pompe / `false` = éteindre |
| `decision` | `str` | `"ARROSER"` / `"NE PAS ARROSER"` / `"ATTENDRE"` |
| `confidence_percent` | `float` | Confiance du modèle en % |

---

## 🌱 Plantes supportées

| Plante | Seuil bas (arroser si <) | Seuil haut (ne pas arroser si >) |
|---|---|---|
| tomate | 40% | 75% |
| laitue | 50% | 80% |
| carotte | 30% | 65% |
| poivron | 35% | 70% |
| courgette | 38% | 72% |
| concombre | 50% | 80% |
| pomme de terre | 45% | 75% |
| *(autres)* | 35% | 70% |

---

## 🏗️ Architecture complète du système

```
ESP32 (capteurs)
    │
    ▼ POST /sensor-data
Backend Zakaria (port 8000) ──► PostgreSQL (sauvegarde)
    │
    ▼ POST /predict
Microservice IA (port 8001)  ──► Modèle Random Forest
    │
    ▼ {pump_on: true/false}
Backend Zakaria (port 8000) ──► PumpCommand dans PostgreSQL
    │
    ▼ GET /pump-command
ESP32 active/éteint la pompe 🚿
```

---

## ✅ Vérifier que le service fonctionne

```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{"soil_moisture": 30, "air_humidity": 45, "temperature": 25, "plant_type": "tomate"}'
```

Réponse attendue : `{"pump_on": true, "decision": "ARROSER", ...}`
