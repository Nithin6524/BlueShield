from beanie import Document
from pydantic import Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum

class PredictionType(str, Enum):
    MP_CONCENTRATION = "mp_concentration"

class PredictionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class Prediction(Document):
    # Basic info
    user_id: str = Field(..., description="ID of user who requested prediction")
    prediction_type: PredictionType
    status: PredictionStatus = PredictionStatus.PENDING
    
    # Location data
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
    # Input data
    input_data: Dict[str, Any] = Field(default_factory=dict)
    
    # Results
    prediction_result: Optional[Dict[str, Any]] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    
    # Metadata
    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)
    
    class Settings:
        name = "predictions"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
