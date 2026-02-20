"""
FastAPI Backend pour le modèle de prédiction de profit des startups
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from typing import Optional

app = FastAPI(title="Startup Profit Predictor", version="1.0.0")

# CORS pour permettre les requêtes depuis le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger les modèles au démarrage
print("🔄 Chargement des modèles...")
try:
    model = joblib.load('startup_model.pkl')
    encoder = joblib.load('encoder.pkl')
    print("✅ Modèles chargés avec succès!")
except Exception as e:
    print(f"❌ Erreur lors du chargement des modèles: {e}")
    model = None
    encoder = None

# Mapping des états (le notebook utilise: New York=0, California=1, Florida=2)
STATE_MAPPING = {
    "New York": 0,
    "California": 1,
    "Florida": 2
}

class PredictionRequest(BaseModel):
    """Format de la requête de prédiction"""
    rd_spend: float
    administration: float
    marketing_spend: float
    state: str

class PredictionResponse(BaseModel):
    """Format de la réponse"""
    predicted_profit: float
    confidence: Optional[str] = None

@app.get("/health")
def health_check():
    """Vérifier que l'API est en ligne"""
    return {"status": "ok", "message": "API en ligne"}

@app.post("/predict")
def predict(request: PredictionRequest) -> PredictionResponse:
    """
    Prédire le profit d'une startup
    
    Paramètres:
    - rd_spend: Dépenses en R&D
    - administration: Dépenses d'administration
    - marketing_spend: Dépenses en marketing
    - state: État (New York, California, Florida)
    """
    
    if model is None or encoder is None:
        return PredictionResponse(
            predicted_profit=0,
            confidence="error: models not loaded"
        )
    
    try:
        # Valider l'état
        if request.state not in STATE_MAPPING:
            return PredictionResponse(
                predicted_profit=0,
                confidence=f"error: invalid state. Choose from: {list(STATE_MAPPING.keys())}"
            )
        
        # Créer un DataFrame avec les données d'entrée
        input_data = pd.DataFrame({
            'R&D Spend': [request.rd_spend],
            'Administration': [request.administration],
            'Marketing Spend': [request.marketing_spend],
            'State': [STATE_MAPPING[request.state]]
        })
        
        # Appliquer les mêmes transformations que le notebook
        # Le ColumnTransformer s'attend à [3] colonnes avant la transformation
        transformed_data = encoder.transform(input_data)
        
        # Convertir en DataFrame pour supprimer la première colonne (comme dans le notebook)
        transformed_df = pd.DataFrame(transformed_data, columns=encoder.get_feature_names_out())
        transformed_df = transformed_df.drop(columns=[transformed_df.columns[0]])
        
        # Faire la prédiction
        profit = model.predict(transformed_df)[0]
        
        # Formater la réponse
        return PredictionResponse(
            predicted_profit=float(profit),
            confidence="high"
        )
    
    except Exception as e:
        print(f"❌ Erreur lors de la prédiction: {e}")
        return PredictionResponse(
            predicted_profit=0,
            confidence=f"error: {str(e)}"
        )

@app.get("/")
def root():
    """Page d'accueil de l'API"""
    return {
        "name": "Startup Profit Predictor API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
