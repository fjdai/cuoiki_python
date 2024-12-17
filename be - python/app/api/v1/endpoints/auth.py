from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError, jwt
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from app.schemas.auth import (
    UserLoginResponse, 
    LoginResponseData, 
    ForgotPasswordDto,
    ChangePasswordDto,
)
from app.db.database import get_db
from app.models.user import User
from app.core.config import settings
from app.api.deps import get_current_user, get_refresh_token, public_endpoint
from fastapi.encoders import jsonable_encoder
from app.core.responses import SuccessResponse
import random
import string
import logging
from app.core.email import send_forgot_password_email

# Thêm logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login")
@public_endpoint
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Kiểm tra user tồn tại
        result = await db.execute(
            select(User).where(User.email == form_data.username)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User not found: {form_data.username}")  # Debug log
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không chính xác",
            )

        # 2. Kiểm tra mật khẩu
        if not verify_password(form_data.password, user.password):
            raise HTTPException(    
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Email hoặc mật khẩu không chính xác",
            )

        # Prepare user data
        user_data = UserLoginResponse(
            id=str(user.id),
            email=user.email,
            address=user.address or "",
            name=user.name,
            gender=user.gender or "",
            roleId=int(user.roleId),
            phone=user.phone or "",
            avatar=user.avatar
        )

        # Create tokens
        access_token = create_access_token(user)
        refresh_token = create_refresh_token(user)

        # Set refresh token cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path="/",
            domain=settings.DOMAIN,
            max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60
        )

        # Create response data
        response_data = LoginResponseData(
            user=user_data,
            access_token=access_token
        )

        # Return custom response using SuccessResponse
        return SuccessResponse(
            content=jsonable_encoder(response_data),
            message="Đăng nhập thành công",
            status_code=status.HTTP_201_CREATED
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra, vui lòng thử lại sau"
        )

@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    try:
        response.delete_cookie(
            key="refresh_token",
            path="/",
            domain=settings.DOMAIN,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE
        )
        
        return SuccessResponse(
            content=None,
            message="Đăng xuất thành công",
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra khi đăng xuất"
        )

# @router.get("/refresh")
# @public_endpoint
# async def refresh_token(
#     response: Response,
#     refresh_token: str = Depends(get_refresh_token),
#     db: AsyncSession = Depends(get_db)
# ):
#     try:
#         payload = jwt.decode( # type: ignore
#             refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
#         )
#         user_id = payload.get("sub")
#         if user_id is None:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Token không hợp lệ",
#             )
#     except JWTError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token không hợp lệ",
#         )
    
#     # Verify user still exists
#     result = await db.execute(select(User).where(User.id == user_id))
#     user = result.scalar_one_or_none()
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Người dùng không tồn tại",
#         )
    
#     # Create new tokens
#     new_access_token = create_access_token(user)
#     new_refresh_token = create_refresh_token(user)
    
#     # Set new refresh token cookie
#     response.set_cookie(
#         key="refresh_token",
#         value=new_refresh_token,
#         httponly=True,
#         secure=settings.COOKIE_SECURE,
#         samesite=settings.COOKIE_SAMESITE,
#         path="/",
#         domain=settings.DOMAIN,
#         max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60
#     )
    
#     return SuccessResponse(
#         content=jsonable_encoder({
#             "access_token": new_access_token,
#             "refresh_token": new_refresh_token
#         }),
#         message="Làm mới token thành công",
#         status_code=status.HTTP_200_OK
#     )

@router.get("/account")
async def get_account(current_user: User = Depends(get_current_user)):
    try:
        # Convert UUID to string explicitly
        user_id = str(current_user.id) if current_user.id else None
            
        account_data = {
            "id": user_id,
            "email": current_user.email,
            "address": current_user.address or "",
            "name": current_user.name,
            "roleId": current_user.roleId,
            "avatar": current_user.avatar,
            "gender": current_user.gender or "",
            "phone": current_user.phone or "",
            "description": current_user.description or ""
        }

        return SuccessResponse(
            content=jsonable_encoder(account_data),
            message="Lấy thông tin tài khoản thành công",
            status_code=status.HTTP_200_OK
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra khi lấy thông tin tài khoản"
        ) 
    

@router.post("/forgot-password")
@public_endpoint
async def forgot_password(
    forgot_password_dto: ForgotPasswordDto,
    db: AsyncSession = Depends(get_db)
):
    """Handle forgot password request"""
    try:
        # Find user by email
        result = await db.execute(
            select(User).where(User.email == forgot_password_dto.email.lower())
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email không tồn tại"
            )

        # Generate new random password (8 characters)
        new_password = ''.join(random.choices(
            string.ascii_letters + string.digits, k=8))
        
        # Hash the new password
        hashed_password = get_password_hash(new_password)
        
        # Update user's password
        user.password = hashed_password
        await db.commit()
        await db.refresh(user)
        
        # Send email with new password using template
        await send_forgot_password_email(
            user.email,
            {
                "name": user.name,
                "new_password": new_password
            }
        )
        
        return SuccessResponse(
            content=None,
            message="Mật khẩu mới đã được gửi về email của bạn",
            status_code=status.HTTP_200_OK
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra khi đặt lại mật khẩu"
        )

@router.post("/change-password")
async def change_password(
    change_password_dto: ChangePasswordDto,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Handle change password request"""
    try:
        # Verify old password
        if not verify_password(change_password_dto.oldPassword, current_user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mật khẩu cũ không đúng"
            )
        
        # Hash new password
        hashed_password = get_password_hash(change_password_dto.newPassword)
        
        # Update user's password
        current_user.password = hashed_password
        await db.commit()
        await db.refresh(current_user)
        
        return SuccessResponse(
            content=None,
            message="Đổi mật khẩu thành công",
            status_code=status.HTTP_200_OK
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đã có lỗi xảy ra khi đổi mật khẩu"
        )

    

    