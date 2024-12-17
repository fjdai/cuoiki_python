from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.clinic import Clinic
from app.models.doctor_user import DoctorUser
from app.schemas.clinic import ClinicResponse, CreateClinicDto, UpdateClinicDto
from app.core.responses import SuccessResponse
from app.api.deps import get_current_user, public_endpoint
from typing import List
import shutil
from app.models.user import User
from pathlib import Path
from uuid import UUID, uuid4
import os
from sqlalchemy import insert

router = APIRouter()

@router.get("", response_model=List[ClinicResponse])
@public_endpoint
async def get_all_clinics(
    db: AsyncSession = Depends(get_db)
):
    """Get all clinics"""
    try:
        result = await db.execute(select(Clinic))
        clinics = result.scalars().all()
        
        if not clinics:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy phòng khám"
            )
        
        # Convert SQLAlchemy models to Pydantic models and then to dict
        clinic_responses = [
            {
                "id": str(clinic.id),  # Convert UUID to string
                "name": clinic.name,
                "address": clinic.address,
                "phone": clinic.phone,
                "description": clinic.description,
                "image": clinic.image
            }
            for clinic in clinics
        ]
            
        return SuccessResponse(
            content=clinic_responses,
            message="Get All clinics"
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
    file: UploadFile = File(..., alias="clinicImage"),
    current_user: User = Depends(get_current_user)
):
    if current_user.roleId != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới có thể upload hình ảnh phòng khám"
        )

    """Upload and update clinic image"""
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
        upload_dir = Path("app/public/images/clinics")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / file_name
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
              
        return SuccessResponse(
            content=file_name,
            message="Upload clinic image successfully",
            headers=headers
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("", response_model=ClinicResponse)
async def create_new_clinic(
    create_clinic_dto: CreateClinicDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tạo phòng khám mới (Chỉ dành cho Admin)"""
    try:
        # Kiểm tra xem người dùng có phải là admin không (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể tạo phòng khám"
            )

        # Tạo phòng khám mới
        new_clinic = Clinic(
            name=create_clinic_dto.name,
            address=create_clinic_dto.address,
            phone=create_clinic_dto.phone,
            description=create_clinic_dto.description,
            image=create_clinic_dto.image
        )
        
        db.add(new_clinic)
        await db.commit()
        await db.refresh(new_clinic)

        # Chuyển đổi sang định dạng response
        clinic_response = {
            "id": str(new_clinic.id),
            "name": new_clinic.name,
            "address": new_clinic.address,
            "phone": new_clinic.phone,
            "description": new_clinic.description,
            "image": new_clinic.image
        }

        return SuccessResponse(
            content=clinic_response,
            message="Tạo phòng khám thành công",
            status_code=status.HTTP_201_CREATED
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Tạo phòng khám thất bại"
        )


@router.put("/{id}", response_model=ClinicResponse)
async def update_clinic(
    id: UUID,
    update_clinic_dto: UpdateClinicDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cập nhật thông tin phòng khám (Chỉ dành cho Admin)"""
    try:
        # Kiểm tra xem người dùng có phải là admin không (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể cập nhật phòng khám"
            )

        # Kiểm tra phòng khám tồn tại
        result = await db.execute(
            select(Clinic).where(Clinic.id == id)
        )
        clinic = result.scalar_one_or_none()
        
        if not clinic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phòng khám"
            )

        # Cập nhật thông tin phòng khám
        update_data = update_clinic_dto.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(clinic, key, value)

        await db.commit()
        await db.refresh(clinic)

        # Chuyển đổi sang định dạng response
        clinic_response = {
            "id": str(clinic.id),
            "name": clinic.name,
            "address": clinic.address,
            "phone": clinic.phone,
            "description": clinic.description,
            "image": clinic.image
        }

        return SuccessResponse(
            content=clinic_response,
            message="Cập nhật phòng khám thành công",
            status_code=status.HTTP_200_OK
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cập nhật phòng khám thất bại"
        )


@router.delete("/{id}")
async def delete_clinic(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Xóa phòng khám (Chỉ dành cho Admin)"""
    try:
        # Kiểm tra xem người dùng có phải là admin không (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có thể xóa phòng khám"
            )

        # Kiểm tra xem có bác sĩ nào đang làm việc tại phòng khám không
        result = await db.execute(
            select(DoctorUser).where(DoctorUser.clinicId == id)
        )
        doctor_users = result.scalars().all()

        if doctor_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xóa phòng khám này vì đã có bác sĩ đăng ký, vui lòng xóa bác sĩ trước"
            )

        # Kiểm tra phòng khám tồn tại
        result = await db.execute(
            select(Clinic).where(Clinic.id == id)
        )
        clinic = result.scalar_one_or_none()
        
        if not clinic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phòng khám"
            )

        # Xóa phòng khám
        await db.delete(clinic)
        await db.commit()

        return SuccessResponse(
            content="Xóa phòng khám thành công",
            message="Delete clinic successfully",
            status_code=status.HTTP_200_OK
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Xóa phòng khám thất bại"
        )



