from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime, timezone

class User(Document):
    email: EmailStr
    username: str
    hashed_password: str
    is_admin: bool = False  # By default, everyone is a regular user
    is_verified: bool = False  # Email verification status
    last_login: Optional[datetime] = None
    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)
    
    class Settings:
        name = "users"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
