import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

class SimpleIrrigationModel:
    """
    Modèle prédictif simple basé EXACTEMENT sur les features demandées :
    - plant_type
    - temperature
    - soil_humidity
    - air_humidity
    Cible (Target) :
    - pump (0 = NE PAS ARROSER, 1 = ARROSER)
    """
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "simple_model.joblib")
        self.pipeline = None
        
        # Essayer de charger le modèle s'il existe
        if os.path.exists(self.model_path):
            self.pipeline = joblib.load(self.model_path)

    def _create_mock_data(self):
        """Génère des données d'entraînement bidons mais logiques si aucun dataset n'est fourni"""
        np.random.seed(42)
        n = 1500
        plant_types = np.random.choice(["tomate", "laitue", "carotte", "courgette", "default"], size=n)
        temp = np.random.uniform(15, 45, size=n)
        air_hum = np.random.uniform(30, 80, size=n)
        soil_hum = np.random.uniform(20, 80, size=n)
        
        pump = np.zeros(n, dtype=int)
        for i in range(n):
            p = plant_types[i]
            sh = soil_hum[i]
            t = temp[i]
            
            # Seuils d'humidité bas ajustés selon la plante
            threshold = 35
            if p == "tomate": threshold = 40
            elif p == "laitue": threshold = 50
            elif p == "carotte": threshold = 30
            elif p == "courgette": threshold = 38
            
            # Si la température est haute, la plante a besoin d'eau plus vite
            if t > 35:
                threshold += 5
                
            if sh < threshold:
                pump[i] = 1 # ARROSER
            else:
                pump[i] = 0 # NE PAS ARROSER
                
        df = pd.DataFrame({
            "plant_type": plant_types,
            "temperature": temp,
            "soil_humidity": soil_hum,
            "air_humidity": air_hum,
            "pump": pump
        })
        return df

    def train(self, df_custom=None):
        """Entraîne le modèle avec un DataFrame fourni, sinon génère le sien."""
        print("Entraînement du modèle simple...")
        if df_custom is not None:
            df = df_custom
        else:
            df = self._create_mock_data()
            
        X = df[["plant_type", "temperature", "soil_humidity", "air_humidity"]]
        y = df["pump"]
        
        # Pipeline de traitement des données
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), ["temperature", "soil_humidity", "air_humidity"]),
                ("cat", OneHotEncoder(handle_unknown="ignore"), ["plant_type"])
            ]
        )
        
        self.pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        # Entraînement
        self.pipeline.fit(X, y)
        
        # Sauvegarde
        joblib.dump(self.pipeline, self.model_path)
        print(f"Modèle sauvegardé dans {self.model_path}")
        return True

    def predict(self, plant_type: str, temperature: float, soil_humidity: float, air_humidity: float) -> dict:
        """
        Prédit s'il faut arroser basé sur les 4 données exactes.
        """
        # Auto-train si premier lancement
        if self.pipeline is None:
            self.train()
            
        X_new = pd.DataFrame([{
            "plant_type": str(plant_type).lower().strip(),
            "temperature": float(temperature),
            "soil_humidity": float(soil_humidity),
            "air_humidity": float(air_humidity)
        }])
        
        pred = self.pipeline.predict(X_new)[0]
        proba = self.pipeline.predict_proba(X_new)[0]
        
        pump_on = bool(pred == 1)
        decision = "ARROSER" if pump_on else "NE PAS ARROSER"
        
        return {
            "decision": decision,
            "confidence_%": round(proba[pred] * 100, 1),
            "pump_on": pump_on,
            "reason": f"Modèle IA ({self.pipeline['classifier'].__class__.__name__})"
        }

# Test direct
if __name__ == "__main__":
    model = SimpleIrrigationModel()
    model.train() # Force train
    res = model.predict(plant_type="tomate", temperature=30, soil_humidity=35, air_humidity=50)
    print(res)
