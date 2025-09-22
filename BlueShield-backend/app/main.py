from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
from app.models.user import User
from app.models.prediction import Prediction
from app.api.v1.api_router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database connection on startup"""
    client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.database_name],
        document_models=[User, Prediction]
    )
    print("✅ Database initialized!")
    yield
    # Cleanup code here if needed

app = FastAPI(title="BlueShield API", version="1.0.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative port
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "BlueShield API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

app.include_router(api_router, prefix="/api/v1")
