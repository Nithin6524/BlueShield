#!/usr/bin/env python3
"""
Data seeding script for BlueShield database
Run this script to populate the database with sample data
"""

import asyncio
import sys
import os
from datetime import datetime, timezone, timedelta
from typing import List

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config.settings import settings
from app.models.user import User
from app.models.prediction import Prediction, PredictionType, PredictionStatus
from app.core.auth import get_password_hash

async def seed_users() -> List[User]:
    """Create sample users"""
    print("🌊 Creating sample users...")
    
    users_data = [
        {
            "email": "admin@blueshield.com",
            "username": "admin",
            "hashed_password": get_password_hash("Admin123!"),
        },
        {
            "email": "marine.biologist@ocean.org",
            "username": "marine_bio",
            "hashed_password": get_password_hash("Marine123!"),
        },
        {
            "email": "researcher@university.edu",
            "username": "researcher",
            "hashed_password": get_password_hash("Research123!"),
        },
        {
            "email": "analyst@environment.gov",
            "username": "env_analyst",
            "hashed_password": get_password_hash("Analysis123!"),
        }
    ]
    
    users = []
    for user_data in users_data:
        user = User(**user_data)
        await user.insert()
        users.append(user)
        print(f"  ✅ Created user: {user.username}")
    
    return users

async def seed_predictions(users: List[User]) -> List[Prediction]:
    """Create sample predictions"""
    print("📊 Creating sample predictions...")
    
    predictions_data = [
        {
            "user_id": str(users[1].id),
            "prediction_type": PredictionType.MP_CONCENTRATION,
            "status": PredictionStatus.COMPLETED,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "input_data": {
                "water_temperature": 18.5,
                "salinity": 33.2,
                "turbidity": 12.8,
                "ph": 8.1,
                "dissolved_oxygen": 7.2
            },
            "prediction_result": {
                "mp_concentration_ppm": 0.045,
                "confidence_interval": [0.038, 0.052],
                "risk_level": "medium"
            },
            "confidence_score": 0.87
        },
        {
            "user_id": str(users[2].id),
            "prediction_type": PredictionType.MP_CONCENTRATION,
            "status": PredictionStatus.PENDING,
            "latitude": 40.7128,
            "longitude": -74.0060,
            "input_data": {
                "water_temperature": 15.2,
                "salinity": 31.8,
                "turbidity": 8.5,
                "ph": 7.9,
                "dissolved_oxygen": 6.8
            }
        },
        {
            "user_id": str(users[1].id),
            "prediction_type": PredictionType.MP_CONCENTRATION,
            "status": PredictionStatus.COMPLETED,
            "latitude": 25.7617,
            "longitude": -80.1918,
            "input_data": {
                "water_temperature": 24.1,
                "salinity": 35.5,
                "turbidity": 15.2,
                "ph": 8.3,
                "dissolved_oxygen": 7.8
            },
            "prediction_result": {
                "mp_concentration_ppm": 0.032,
                "confidence_interval": [0.028, 0.036],
                "risk_level": "low"
            },
            "confidence_score": 0.92
        }
    ]
    
    predictions = []
    for pred_data in predictions_data:
        prediction = Prediction(**pred_data)
        await prediction.insert()
        predictions.append(prediction)
        print(f"  ✅ Created prediction: {prediction.prediction_type.value}")
    
    return predictions

async def main():
    """Main seeding function"""
    print("🌊 Starting BlueShield database seeding...")
    
    # Initialize database connection
    client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.database_name],
        document_models=[User, Prediction]
    )
    
    print("✅ Database connected!")
    
    # Seed data
    users = await seed_users()
    predictions = await seed_predictions(users)
    
    print("\n🎉 Database seeding completed successfully!")
    print(f"📊 Created:")
    print(f"  - {len(users)} users")
    print(f"  - {len(predictions)} predictions")

if __name__ == "__main__":
    asyncio.run(main())
