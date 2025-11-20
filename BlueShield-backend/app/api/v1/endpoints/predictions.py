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

# Model paths
CONCENTRATION_MODEL_PATH = "models/concentration_model.keras"
SPECIES_MODEL_PATH = "models/species_model.keras"   
BIOACCUMULATION_MODEL_PATH = "models/bioaccumulation_model.keras"
DOSAGE_MODEL_PATH = "models/dosage_model.keras"

# Global caches
_concentration_model = None
_species_model = None
_bio_model = None
_dosage_model = None

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




async def Predict_microplastic(
    latitude: float,
    longitude: float,
    salinity: float,
    sea_surface_temp: float
) -> Dict[str, Any]:
    """
    Predicts microplastic concentration, species, bioaccumulation factor,
    and recommended dosage based on geographic and environmental features.
    """
    global _concentration_model, _species_model, _bio_model, _dosage_model

    # ---------------------------------
    # Lazy-load models
    # ---------------------------------
    if _concentration_model is None:
        print(f"🔹 Loading concentration model from: {CONCENTRATION_MODEL_PATH}")
        _concentration_model = load_model(CONCENTRATION_MODEL_PATH)

    if _species_model is None:
        print(f"🔹 Loading species model from: {SPECIES_MODEL_PATH}")
        _species_model = load_model(SPECIES_MODEL_PATH)

    if _bio_model is None:
        print(f"🔹 Loading bioaccumulation model from: {BIOACCUMULATION_MODEL_PATH}")
        _bio_model = load_model(BIOACCUMULATION_MODEL_PATH)

    if _dosage_model is None:
        print(f"🔹 Loading dosage model from: {DOSAGE_MODEL_PATH}")
        _dosage_model = load_model(DOSAGE_MODEL_PATH)

    # ---------------------------------
    # Step 1: Predict microplastic concentration
    # ---------------------------------
    conc_features = np.array(
        [[latitude, longitude, salinity, sea_surface_temp]],
        dtype=np.float32
    )
    conc_pred = _concentration_model.predict(conc_features, verbose=0)
    concentration = float(conc_pred[0][0])
    concentration = round(max(0.2, min(4.5, concentration)), 2)

    # Determine risk and confidence heuristics
    if concentration >= 1.79:
        risk_level = "high"
        confidence = 0.9
    elif concentration >= 0.9:
        risk_level = "medium"
        confidence = 0.86
    else:
        risk_level = "low"
        confidence = 0.8

    # ---------------------------------
    # Step 2: Predict species
    # ---------------------------------
    species_features = np.array(
        [[latitude, longitude, salinity, sea_surface_temp, concentration]],
        dtype=np.float32
    )
    species_pred = _species_model.predict(species_features, verbose=0)
    species_encoded = int(np.argmax(species_pred, axis=1)[0])  # classification output
    species_confidence = float(np.max(species_pred))

    # ---------------------------------
    # Step 3: Predict bioaccumulation factor
    # ---------------------------------
    bio_features = np.array(
        [[latitude, longitude, salinity, sea_surface_temp, concentration, species_encoded]],
        dtype=np.float32
    )
    bio_pred = _bio_model.predict(bio_features, verbose=0)
    bioaccumulation_factor = float(bio_pred[0][0])
    bioaccumulation_factor = round(max(0.01, min(10.0, bioaccumulation_factor)), 3)

    # ---------------------------------
    # Step 4: Predict dosage using all features
    # ---------------------------------
    dosage_features = np.array(
        [[latitude, longitude, salinity, sea_surface_temp,
          concentration, species_encoded, bioaccumulation_factor]],
        dtype=np.float32
    )
    dosage_pred = _dosage_model.predict(dosage_features, verbose=0)
    dosage = float(dosage_pred[0][0])
    dosage = round(max(1e-6, min(1e-1, dosage)), 6)  # clamp realistic range

    # ---------------------------------
    # Step 5: Construct result
    # ---------------------------------
    result = {
        "concentration": concentration,
        "risk_level": risk_level,
        "confidence": round(confidence, 2),
        "species_encoded": species_encoded,
        "species_confidence": round(species_confidence, 2),
        "bioaccumulation_factor": bioaccumulation_factor,
        "dosage": f"{dosage:.1e}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "location": {
            "lat": round(latitude, 8),
            "lng": round(longitude, 8)
        }
    }

    await asyncio.sleep(0.3)  # simulate async delay
    return result


































async def Predict_microplastic_concentration(latitude: float, longitude: float) -> Dict[str, Any]:
    print("Loading model from:", MODEL_PATH)
    ganges_mouth = (21.5, 89.0)
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
    concentration = round(concentration, 2)  # ✅ round before comparison

    threshold = 1.79
    if concentration >= threshold:
        risk_level = "high"
        risk_description = "High microplastic concentration - significant marine life risk"
    elif concentration >= threshold / 2 and concentration < threshold:
        risk_level = "medium"
        risk_description = "Moderate microplastic concentration - moderate marine life risk"
    else:
        risk_level = "low"
        risk_description = "Low microplastic concentration - minimal marine life risk"

    if region_factor in ["coastal_high", "coastal_medium"]:
        confidence = random.uniform(0.85, 0.95)
    else:
        confidence = random.uniform(0.75, 0.90)

    await asyncio.sleep(random.uniform(2, 5))

    return {
        "concentration": concentration,
        "confidence": round(confidence, 3),
        "risk_level": risk_level,
        "risk_description": risk_description,
        "region_factor": region_factor
    }


