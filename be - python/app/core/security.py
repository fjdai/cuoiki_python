from datetime import datetime, timedelta
from typing import Any, Dict
from jose import jwt
import bcrypt
from passlib.context import CryptContext
from app.core.config import settings
from app.models.user import User

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

def create_token(user: User, expires_delta: timedelta) -> str:
    """Create JWT token with user information"""
    # Get current timestamp
    now = datetime.utcnow()
    
    # Create JWT payload with user info
    payload = {
        "sub": str(user.id),  # subject (user id)
        "exp": now + expires_delta,  # expiration time
        "iat": now,  # issued at
        "email": user.email,
        "name": user.name,
        "phone": user.phone or "",
        "address": user.address or "",
        "gender": user.gender or "",
        "roleId": user.roleId,
        "description": user.description or "",
        "avatar": user.avatar or ""
    }
    
    # Create token
    encoded_jwt = jwt.encode(
        payload, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt

def create_access_token(user: User) -> str:
    """Create access token"""
    return create_token(
        user=user,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

def create_refresh_token(user: User) -> str:
    """Create refresh token"""
    return create_token(
        user=user,
        expires_delta=timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    
    try:
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception:
        return pwd_context.verify(plain_password.decode('utf-8'), hashed_password.decode('utf-8'))

def get_password_hash(password: str) -> str:
    if isinstance(password, str):
        password = password.encode('utf-8')
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    return hashed.decode('utf-8') 