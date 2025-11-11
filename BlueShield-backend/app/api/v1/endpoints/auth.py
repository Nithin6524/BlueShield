from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister, Token, PasswordChange, TokenRefresh
from app.schemas.user import UserResponse
from app.core.auth import verify_password, get_password_hash, create_tokens, verify_token
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username is taken
    existing_username = await User.find_one(User.username == user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
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


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user and return access and refresh tokens"""
    # Find user by email
    user = await User.find_one(User.email == user_credentials.email)
    if not user or not user.hashed_password or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await user.save()

    # Create tokens
    tokens = create_tokens(data={"sub": user.email})
    return tokens


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh):
    """Refresh access token using refresh token"""
    email = verify_token(token_data.refresh_token, token_type="refresh")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify user still exists
    user = await User.find_one(User.email == email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Create new tokens
    tokens = create_tokens(data={"sub": user.email})
    return tokens


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        is_admin=current_user.is_admin,
        is_verified=current_user.is_verified,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client-side token removal)"""
    # JWT-based auth is stateless; logout happens client-side
    return {"message": "Logged out successfully"}


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    await current_user.save()

    return {"message": "Password updated successfully"}
