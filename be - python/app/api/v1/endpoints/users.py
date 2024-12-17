from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.models.doctor_user import DoctorUser
from app.models.user import User
from app.core.responses import SuccessResponse
from app.api.deps import get_current_user
from typing import List
from app.schemas.users import UserResponse
from fastapi.encoders import jsonable_encoder
import shutil
from pathlib import Path
from uuid import uuid4,UUID
import os
from sqlalchemy import update, delete
from app.core.security import get_password_hash
from app.schemas.user import RegisterUserDto, UpdateUserDto
from app.models.doctor_user import DoctorUser
from sqlalchemy import update, delete
from app.models.schedule import Schedule

router = APIRouter()

@router.get("", response_model=List[UserResponse])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users with roles 1, 2, 3 and include specialty, clinic for role 2"""
    try:
        # Check if current user has admin role (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can access this endpoint"
            )

        # Query users with role_id in [1,2,3] and join related tables for doctors
        result = await db.execute(
            select(User)
            .where(User.roleId.in_([1, 2, 3]))
            .options(
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.specialization),
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.clinic)
            )
        )
        users = result.unique().scalars().all()
        
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng nào"
            )

        # Convert users to response format
        users_response = []
        for user in users:
            user_dict = {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "gender": user.gender,
                "description": user.description,
                "address": user.address,
                "avatar": user.avatar,
                "roleId": user.roleId,
                "createdAt": user.createdAt,
                "updatedAt": user.updatedAt,
                "isDeleted": user.isDeleted
            }

            # Add doctor_user info if user is a doctor
            if user.roleId == 2 and user.doctor_user:
                user_dict["doctor_user"] = {
                    "doctorId": user.doctor_user.doctorId,
                    "clinicId": user.doctor_user.clinicId,
                    "specializationId": user.doctor_user.specializationId,
                    "clinic": {
                        "id": str(user.doctor_user.clinic.id),
                        "name": user.doctor_user.clinic.name,
                        "address": user.doctor_user.clinic.address,
                        "phone": user.doctor_user.clinic.phone,
                        "description": user.doctor_user.clinic.description,
                        "image": user.doctor_user.clinic.image,
                        "createdAt": user.doctor_user.clinic.createdAt,
                        "updatedAt": user.doctor_user.clinic.updatedAt,
                        "isDeleted": user.doctor_user.clinic.isDeleted
                    },
                    "specialization": {
                        "id": str(user.doctor_user.specialization.id),
                        "name": user.doctor_user.specialization.name,
                        "description": user.doctor_user.specialization.description,
                        "image": user.doctor_user.specialization.image,
                        "createdAt": user.doctor_user.specialization.createdAt,
                        "updatedAt": user.doctor_user.specialization.updatedAt,
                        "isDeleted": user.doctor_user.specialization.isDeleted
                    }
                }
            else:
                user_dict["doctor_user"] = None

            users_response.append(user_dict)

        return SuccessResponse(
            content=jsonable_encoder(users_response),
            message="Get all users successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/avatar", response_model=str)
async def upload_avatar(
    file: UploadFile = File(..., alias="avatar"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and update user avatar"""
    try:
        # Add response headers for CORS
        headers = {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
        }
        
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File type not allowed. Only JPG, JPEG and PNG are allowed"
            )
            
        # Validate file size (2MB)
        MAX_SIZE = 2 * 1024 * 1024  # 2MB
        file_size = 0
        chunk_size = 1024  # 1KB
        
        while chunk := await file.read(chunk_size):
            file_size += len(chunk)
            if file_size > MAX_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File size too large. Maximum size is 2MB"
                )
                
        # Reset file pointer
        await file.seek(0)
        
        # Generate random filename
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{uuid4()}{file_extension}"
        
        # Save file
        upload_dir = Path("app/public/images/users")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / file_name
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update user avatar in database
        await db.execute(
            update(User)
            .where(User.id == current_user.id)
            .values(avatar=file_name)
        )
        await db.commit()
            
        return SuccessResponse(
            content=file_name,
            message="Upload avatar successfully",
            headers=headers
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("", response_model=dict)
async def create_user(
    user: RegisterUserDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new user (Admin only)"""
    try:
        # Check if current user is admin
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể tạo người dùng"
            )

        # Check if email exists
        result = await db.execute(
            select(User).where(User.email == user.email.lower())
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {user.email.lower()} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác"
            )

        # Create new user
        hashed_password = get_password_hash(user.password)
        new_user = User(
            email=user.email.lower(),
            password=hashed_password,
            name=user.name,
            phone=user.phone,
            address=user.address,
            roleId=user.roleId,
            gender=user.gender,
            avatar=user.avatar,
            description=user.description
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # If user is doctor, create doctor_user record
        if user.roleId == 2 and (user.specialtyId or user.clinicId):
            doctor_user = DoctorUser(
                doctorId=str(new_user.id),
                specializationId=user.specialtyId,
                clinicId=user.clinicId
            )
            db.add(doctor_user)
            await db.commit()

        return SuccessResponse(
            content={"id": str(new_user.id)},
            message="Tạo người dùng thành công"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("", response_model=dict)
async def update_user(
    user: UpdateUserDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user (Admin only)"""
    try:
        # Check if current user is admin
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể cập nhật người dùng"
            )

        # Check if user exists
        result = await db.execute(
            select(User).where(User.id == user.id)
        )
        existing_user = result.scalar_one_or_none()
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng"
            )

        # Check if email exists for other users
        result = await db.execute(
            select(User).where(User.email == user.email.lower(), User.id != user.id)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {user.email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác"
            )

        # Handle doctor_user changes
        if existing_user.roleId == 2:
            if user.roleId != 2:
                # Delete doctor_user if role changes from doctor
                await db.execute(
                    delete(DoctorUser).where(DoctorUser.doctorId == str(user.id))
                )
            elif user.roleId == 2 and (user.specialtyId or user.clinicId):
                # Update doctor_user if still doctor
                result = await db.execute(
                    select(DoctorUser).where(DoctorUser.doctorId == str(user.id))
                )
                doctor_user = result.scalar_one_or_none()
                
                if doctor_user:
                    doctor_user.specializationId = user.specialtyId
                    doctor_user.clinicId = user.clinicId
                else:
                    new_doctor_user = DoctorUser(
                        doctorId=str(user.id),
                        specializationId=user.specialtyId,
                        clinicId=user.clinicId
                    )
                    db.add(new_doctor_user)
        else:
            if user.roleId == 2 and (user.specialtyId or user.clinicId):
                result = await db.execute(
                    select(DoctorUser).where(DoctorUser.doctorId == str(user.id))
                )
                doctor_user = result.scalar_one_or_none()
                
                if doctor_user:
                    doctor_user.specializationId = user.specialtyId
                    doctor_user.clinicId = user.clinicId
                else:
                    new_doctor_user = DoctorUser(
                        doctorId=str(user.id),
                        specializationId=user.specialtyId,
                        clinicId=user.clinicId
                    )
                    db.add(new_doctor_user)

        # Update user
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(
                email=user.email,
                name=user.name,
                phone=user.phone,
                address=user.address,
                gender=user.gender,
                roleId=user.roleId,
                description=user.description
            )
        )
        await db.commit()

        return SuccessResponse(
            content={"id": str(user.id)},
            message="Cập nhật người dùng thành công"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{id}")
async def delete_user(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete user (Admin only)"""
    try:
        # Check if current user is admin
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể xóa người dùng"
            )

        # Check if user exists
        result = await db.execute(
            select(User).where(User.id == id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy người dùng"
            )

        # Delete related records first
        if user.roleId == 2:
            # Delete schedules first
            await db.execute(
                delete(Schedule).where(Schedule.doctorId == str(id))
            )
            # Then delete doctor_user
            await db.execute(
                delete(DoctorUser).where(DoctorUser.doctorId == str(id))
            )
            
        # Finally delete user
        await db.execute(
            delete(User).where(User.id == id)
        )
        await db.commit()

        return SuccessResponse(
            content="Xóa người dùng thành công",
            message="Delete user successfully"
        )

    except HTTPException as e:
        await db.rollback()
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Xóa người dùng thất bại: {str(e)}"
        )


