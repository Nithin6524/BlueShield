from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timezone
import random
import asyncio
import tensorflow as tf
from app.models.prediction import Prediction, PredictionType, PredictionStatus
from app.models.user import User
from app.api.dependencies import get_current_user
import os
import torch
import torch.nn as nn
import keras

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# BASE_DIR now points to: BlueShield-backend/app
MODEL_PATH = "../../../services/ml/models/lstm/best_conv_lstm.keras"


print("Loading model from:", MODEL_PATH)
# model = tf.keras.models.load_model(MODEL_PATH)
router = APIRouter()

class MicroplasticPredictionRequest(BaseModel):
    latitude: float
    longitude: float
    prediction_type: str = "mp_concentration"

class MicroplasticPredictionResponse(BaseModel):
    concentration: float
    confidence: float
    risk_level: str
    timestamp: str
    location: Dict[str, float]

@router.post("/microplastic", response_model=MicroplasticPredictionResponse)
async def predict_microplastic_concentration(
    request: MicroplasticPredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Predict microplastic concentration at a given location in the Bay of Bengal.
    """
    try:
        # Validate coordinates are within Bay of Bengal bounds
        bay_of_bengal_bounds = {
            "north": 25.0,
            "south": 5.0,
            "east": 100.0,
            "west": 80.0
        }
        
        if not (bay_of_bengal_bounds["south"] <= request.latitude <= bay_of_bengal_bounds["north"] and
                bay_of_bengal_bounds["west"] <= request.longitude <= bay_of_bengal_bounds["east"]):
            raise HTTPException(
                status_code=400,
                detail="Coordinates must be within the Bay of Bengal region"
            )

        # Simulate ML model prediction
        # In a real implementation, this would call your trained LSTM model
        prediction_result = await Predict_microplastic_concentration(
            request.latitude, 
            request.longitude
        )

        # Create prediction record in database
        prediction = Prediction(
            user_id=str(current_user.id),
            prediction_type=PredictionType.MP_CONCENTRATION,
            status=PredictionStatus.COMPLETED,
            latitude=request.latitude,
            longitude=request.longitude,
            input_data={
                "latitude": request.latitude,
                "longitude": request.longitude,
                "region": "bay_of_bengal"
            },
            prediction_result=prediction_result,
            confidence_score=prediction_result["confidence"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Save to database (in a real implementation)
        # await prediction.insert()

        return MicroplasticPredictionResponse(
            concentration=prediction_result["concentration"],
            confidence=prediction_result["confidence"],
            risk_level=prediction_result["risk_level"],
            timestamp=datetime.now(timezone.utc).isoformat(),
            location={
                "lat": request.latitude,
                "lng": request.longitude
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

def load_model(model_path: str, device: str = "cpu") -> nn.Module:
    # Assuming input_size=5, hidden_size=32, num_layers=2; change if different
    model = keras.models.load_model("../../../services/ml/models/lstm/best_conv_lstm.keras")
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    return model

# Feature extraction for inference
def extract_features(lat: float, lon: float) -> np.ndarray:
    """
    Example: features could include:
      - Latitude, longitude
      - Distance from major rivers
      - Seasonal factor (month)
      - Ocean current factor, temperature, etc.
    """
    ganges_mouth = (21.5, 89.0)
    distance_from_river = ((lat - ganges_mouth[0])**2 + (lon - ganges_mouth[1])**2)**0.5
    month_factor = (pd.Timestamp.now().month / 12.0)  # simple seasonal factor

    # Example: 5 features
    features = np.array([lat, lon, distance_from_river, month_factor, 1.0], dtype=np.float32)
    return features

async def Predict_microplastic_Concentration(latitude: float, longitude: float) -> Dict[str, Any]:
    device = "cpu"
    model = load_model(MODEL_PATH, device=device)
    
    # Extract features
    features = extract_features(latitude, longitude)
    features_tensor = torch.tensor(features).unsqueeze(0).unsqueeze(0)  # shape: (1, 1, input_size)
    
    # Run inference
    with torch.no_grad():
        output = model(features_tensor.to(device))
    
    concentration = float(output.item())
    
    # Map concentration to risk
    if concentration >= 2.5:
        risk_level = "high"
        risk_description = "High microplastic concentration - significant marine life risk"
    elif concentration >= 1.5:
        risk_level = "medium"
        risk_description = "Moderate microplastic concentration - moderate marine life risk"
    else:
        risk_level = "low"
        risk_description = "Low microplastic concentration - minimal marine life risk"
    
   
    
    # Simulate async delay for API consistency
    await asyncio.sleep(1)
    
    return {
        "concentration": round(concentration, 2),
        "risk_level": risk_level,
        "risk_description": risk_description,
        "region_factor": "real_model_inference",
        "model_version": "lstm_v2.1_real",
        "data_sources": ["trained_model_v2.1"],
        "seasonal_factor": round(features[3], 2),
    }













async def Predict_microplastic_concentration(latitude: float, longitude: float) -> Dict[str, Any]:
    
    print("Loading model from:", MODEL_PATH)
    ganges_mouth = (21.5, 89.0)  # Ganges-Brahmaputra-Meghna delta
    distance_from_river = ((latitude - ganges_mouth[0])**2 + (longitude - ganges_mouth[1])**2)**0.5
    
    
    if distance_from_river < 2.0:  
        base_concentration = 2.8
        region_factor = "coastal_high"
    elif distance_from_river < 5.0: 
        base_concentration = 2.2
        region_factor = "coastal_medium"
    elif latitude < 12.0:  
        base_concentration = 1.4
        region_factor = "southern_bay"
    elif latitude > 20.0: 
        base_concentration = 1.8
        region_factor = "northern_bay"
    else:  
        base_concentration = 1.6
        region_factor = "central_bay"
    
    seasonal_factor = random.uniform(0.8, 1.3)  
    
    
    noise = random.uniform(-0.3, 0.4)
    
    concentration = (base_concentration * seasonal_factor) + noise
    concentration = max(0.2, min(4.5, concentration))  
    
    if concentration >= 2.5:
        risk_level = "high"
        risk_description = "High microplastic concentration - significant marine life risk"
    elif concentration >= 1.5:
        risk_level = "medium"
        risk_description = "Moderate microplastic concentration - moderate marine life risk"
    else:
        risk_level = "low"
        risk_description = "Low microplastic concentration - minimal marine life risk"
    
    if region_factor in ["coastal_high", "coastal_medium"]:
        confidence = random.uniform(0.85, 0.95)  
    else:
        confidence = random.uniform(0.75, 0.90)  
    
    data_sources = ["satellite_imagery", "oceanographic_sensors", "historical_measurements", "river_discharge_data"]
    if region_factor.startswith("coastal"):
        data_sources.append("coastal_monitoring_stations")
    
    await asyncio.sleep(random.uniform(2, 5))
    
    return {
        "concentration": round(concentration, 2),
        "confidence": round(confidence, 3),
        "risk_level": risk_level,
        "risk_description": risk_description,
        "region_factor": region_factor,
        "model_version": "lstm_v2.1_bay_of_bengal",
        "data_sources": data_sources,
        "prediction_uncertainty": round(random.uniform(0.08, 0.25), 3),
        "seasonal_factor": round(seasonal_factor, 2),
        "distance_from_major_rivers_km": round(distance_from_river * 111, 1)  
    }

@router.get("/history")
async def get_prediction_history(
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """
    Get prediction history for the current user.
    """
    try:
        # In a real implementation, query the database
        # predictions = await Prediction.find(
        #     Prediction.user_id == str(current_user.id)
        # ).sort(-Prediction.created_at).limit(limit).to_list()
        
        # For now, return empty list
        return {"predictions": []}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch prediction history: {str(e)}"
        )
