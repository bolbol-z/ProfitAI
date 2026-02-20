import os
from pathlib import Path
from typing import Optional
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Startup Profit Predictor", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODEL LOADING LOGIC ---
# This finds the absolute path to your root folder
BASE_DIR = Path(__file__).resolve().parent.parent

print("🔄 Chargement des modèles...")
try:
    model_path = os.path.join(BASE_DIR, 'startup_model.pkl')
    encoder_path = os.path.join(BASE_DIR, 'encoder.pkl')
    
    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)
    print("✅ Modèles chargés avec succès!")
except Exception as e:
    print(f"❌ Erreur lors du chargement des modèles: {e}")
    model = None
    encoder = None

STATE_MAPPING = {
    "New York": 0,
    "California": 1,
    "Florida": 2
}

class PredictionRequest(BaseModel):
    rd_spend: float
    administration: float
    marketing_spend: float
    state: str

class PredictionResponse(BaseModel):
    predicted_profit: float
    confidence: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API en ligne"}

@app.post("/api/predict")
def predict(request: PredictionRequest) -> PredictionResponse:
    if model is None or encoder is None:
        return PredictionResponse(predicted_profit=0, confidence="error: models not loaded")
    
    try:
        if request.state not in STATE_MAPPING:
            return PredictionResponse(predicted_profit=0, confidence="error: invalid state")
        
        # Create DataFrame
        input_data = pd.DataFrame({
            'R&D Spend': [request.rd_spend],
            'Administration': [request.administration],
            'Marketing Spend': [request.marketing_spend],
            'State': [STATE_MAPPING[request.state]]
        })
        
        # Transform and Predict
        transformed_data = encoder.transform(input_data)
        transformed_df = pd.DataFrame(transformed_data, columns=encoder.get_feature_names_out())
        transformed_df = transformed_df.drop(columns=[transformed_df.columns[0]])
        
        profit = model.predict(transformed_df)[0]
        
        return PredictionResponse(predicted_profit=float(profit), confidence="high")
    except Exception as e:
        return PredictionResponse(predicted_profit=0, confidence=f"error: {str(e)}")