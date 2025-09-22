from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from app.core.auth import validate_password_strength

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

class TokenRefresh(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        validation = validate_password_strength(v)
        if not validation['is_valid']:
            raise ValueError(f"Password validation failed: {', '.join(validation['errors'])}")
        return v

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        validation = validate_password_strength(v)
        if not validation['is_valid']:
            raise ValueError(f"Password validation failed: {', '.join(validation['errors'])}")
        return v

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        validation = validate_password_strength(v)
        if not validation['is_valid']:
            raise ValueError(f"Password validation failed: {', '.join(validation['errors'])}")
        return v
