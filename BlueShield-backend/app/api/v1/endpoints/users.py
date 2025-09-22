from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserProfile
from app.api.dependencies import get_current_user, get_current_admin_user
from datetime import datetime, timezone

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, current_user: User = Depends(get_current_admin_user)):
    """Create a new user (Admin only)"""
    # Check if user already exists
    existing_user = await User.find_one(User.email == user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username is taken
    existing_username = await User.find_one(User.username == user.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    from app.core.auth import get_password_hash
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=get_password_hash(user.password)
    )
    await db_user.insert()
    
    return UserResponse(
        id=str(db_user.id),
        email=db_user.email,
        username=db_user.username,
        is_admin=db_user.is_admin,
        is_verified=db_user.is_verified,
        last_login=db_user.last_login,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )

@router.get("/", response_model=List[UserResponse])
async def get_users(current_user: User = Depends(get_current_admin_user)):
    """Get all users (Admin only)"""
    users = await User.find_all().to_list()
    return [
        UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            is_admin=user.is_admin,
            is_verified=user.is_verified,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at
        ) for user in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Get user by ID (Users can only see their own profile unless admin)"""
    # Users can only see their own profile unless they're admin
    if not current_user.is_admin and str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        
        is_active=user.is_active,
        is_admin=user.is_admin,
        is_verified=user.is_verified,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str, 
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user (Users can only update their own profile unless admin)"""
    # Users can only update their own profile unless they're admin
    if not current_user.is_admin and str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        
        is_active=user.is_active,
        is_admin=user.is_admin,
        is_verified=user.is_verified,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_admin_user)):
    """Delete user (Admin only)"""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    await user.delete()
    return {"message": "User deleted successfully"}

@router.patch("/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, current_user: User = Depends(get_current_admin_user)):
    """Toggle user active status (Admin only)"""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deactivating themselves
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    user.is_active = not user.is_active
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully"}
