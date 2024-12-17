from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.specialization import Specialization
from app.schemas.specialty import SpecialtyResponse, CreateSpecialtyDto, UpdateSpecialtyDto
from app.core.responses import SuccessResponse
from app.api.deps import get_current_user, public_endpoint
from typing import List
import shutil
from pathlib import Path
from uuid import uuid4, UUID
import os
from app.models.user import User
from app.models.doctor_user import DoctorUser
router = APIRouter()

@router.get("", response_model=List[SpecialtyResponse])
@public_endpoint
async def get_all_specialties(
    db: AsyncSession = Depends(get_db)
):
    """Get all specialties"""
    try:
        result = await db.execute(select(Specialization))
        specialties = result.scalars().all()
        
        if not specialties:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy chuyên ngành"
            )
        
        # Convert SQLAlchemy models to Pydantic models and then to dict
        specialty_responses = [
            {
                "id": str(specialty.id),  # Convert UUID to string
                "name": specialty.name,
                "description": specialty.description,
                "image": specialty.image
            }
            for specialty in specialties
        ]
            
        return SuccessResponse(
            content=specialty_responses,
            message="Get All specialties"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/image")
async def upload_clinic_image(
    file: UploadFile = File(..., alias="specImage"),
    current_user: User = Depends(get_current_user)
):
    if current_user.roleId != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới có thể upload hình ảnh chuyên ngành"
        )
    

    """Upload and update specialty image"""
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
        upload_dir = Path("app/public/images/specializations")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / file_name
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
              
        return SuccessResponse(
            content=file_name,
            message="Upload specialty image successfully",
            headers=headers
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("", response_model=SpecialtyResponse)
async def create_specialty(
    create_specialty_dto: CreateSpecialtyDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tạo chuyên ngành mới (Chỉ dành cho Admin)"""
    try:
        # Kiểm tra xem người dùng có phải là admin không (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể tạo chuyên ngành"
            )

        # Tạo chuyên ngành mới
        new_specialty = Specialization(
            name=create_specialty_dto.name,
            description=create_specialty_dto.description,
            image=create_specialty_dto.image
        )
        
        db.add(new_specialty)
        await db.commit()
        await db.refresh(new_specialty)

        # Chuyển đổi sang định dạng response
        specialty_response = {
            "id": str(new_specialty.id),
            "name": new_specialty.name,
            "description": new_specialty.description,
            "image": new_specialty.image
        }

        return SuccessResponse(
            content=specialty_response,
            message="Tạo chuyên ngành thành công",
            status_code=status.HTTP_201_CREATED
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Tạo chuyên ngành thất bại"
        )

@router.put("/{id}", response_model=SpecialtyResponse)
async def update_specialty(
    id: UUID,
    update_specialty_dto: UpdateSpecialtyDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cập nhật thông tin chuyên ngành (Chỉ dành cho Admin)"""
    try:
        # Kiểm tra xem người dùng có phải là admin không (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể cập nhật chuyên ngành"
            )

        # Kiểm tra chuyên ngành tồn tại
        result = await db.execute(
            select(Specialization).where(Specialization.id == id)
        )
        specialty = result.scalar_one_or_none()
        
        if not specialty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy chuyên ngành"
            )

        # Cập nhật thông tin chuyên ngành
        update_data = update_specialty_dto.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(specialty, key, value)

        await db.commit()
        await db.refresh(specialty)

        # Chuyển đổi sang định dạng response
        specialty_response = {
            "id": str(specialty.id),
            "name": specialty.name,
            "description": specialty.description,
            "image": specialty.image
        }

        return SuccessResponse(
            content=specialty_response,
            message="Cập nhật chuyên ngành thành công",
            status_code=status.HTTP_200_OK
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cập nhật chuyên ngành thất bại"
        )

@router.delete("/{id}")
async def delete_specialty(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Xóa chuyên ngành (Chỉ dành cho Admin)"""
    try:
        # Kiểm tra xem người dùng có phải là admin không (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể xóa chuyên ngành"
            )

        # Kiểm tra xem có bác sĩ nào đang làm việc trong chuyên ngành không
        result = await db.execute(
            select(DoctorUser).where(DoctorUser.specializationId == id)
        )
        doctor_users = result.scalars().all()

        if doctor_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xóa chuyên ngành này vì đã có bác sĩ đăng ký, vui lòng xóa bác sĩ trước"
            )

        # Kiểm tra chuyên ngành tồn tại
        result = await db.execute(
            select(Specialization).where(Specialization.id == id)
        )
        specialty = result.scalar_one_or_none()
        
        if not specialty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy chuyên ngành"
            )

        # Xóa chuyên ngành
        await db.delete(specialty)
        await db.commit()

        return SuccessResponse(
            content="Xóa chuyên ngành thành công",
            message="Delete specialty successfully",
            status_code=status.HTTP_200_OK
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Xóa chuyên ngành thất bại"
        )


