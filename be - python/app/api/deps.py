from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Cookie, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import TokenPayload
from functools import wraps
from typing import Callable
from enum import Enum
from typing import List, Union
import asyncio
from sqlalchemy.orm import selectinload
import logging

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

# Add this variable to track public endpoints
public_endpoints: set[str] = set()

# Add Role enum
class Role(Enum):
    ADMIN = 1
    DOCTOR = 2
    SUPPORTER = 3

def public_endpoint(func: Callable):
    """
    Decorator to mark an endpoint as public (no authentication required)
    Supports both sync and async functions
    """
    endpoint_path = f"{func.__module__}.{func.__name__}"
    public_endpoints.add(endpoint_path)
    
    if asyncio.iscoroutinefunction(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        return async_wrapper
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return sync_wrapper

logger = logging.getLogger(__name__)

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    try:
        # Lấy đường dẫn của endpoint hiện tại
        route = request.scope.get("route")
        if route:
            endpoint_path = f"{route.endpoint.__module__}.{route.endpoint.__qualname__}"
            logger.debug(f"Current endpoint: {endpoint_path}")
            if endpoint_path in public_endpoints:
                logger.debug("Public endpoint detected")
                return None

        # Get token from request state (set by middleware)
        token = getattr(request.state, "token", None)
        logger.debug(f"Token from request state: {token[:10] if token else None}...")

        if not token:
            logger.error("No token found in request state")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
            
        try:
            logger.debug("Attempting to decode token...")
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
            logger.debug(f"Token decoded successfully for user ID: {token_data.sub}")
        except (JWTError, ValueError) as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
            
        # Load user with all needed relationships
        result = await db.execute(
            select(User)
            .where(User.id == token_data.sub)
            .options(selectinload(User.role))
        )
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(f"User not found for ID: {token_data.sub}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        logger.debug(f"User authenticated successfully: {user.email}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_refresh_token(
    request: Request,
    refresh_token: Optional[str] = Cookie(None)
) -> str:
    logger.debug(f"All cookies: {request.cookies}")
    if not refresh_token:
        logger.error("No refresh token found in cookies")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    logger.debug(f"Refresh token found: {refresh_token[:10]}...")
    return refresh_token 