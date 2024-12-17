from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.db.database import get_db
from app.models.user import User
from app.models.doctor_user import DoctorUser
from app.schemas.doctor import DoctorResponse, DoctorDetailResponse
from app.core.responses import SuccessResponse
from app.api.deps import public_endpoint
from typing import List
from uuid import UUID
from app.schemas.bill import CreateBillDto
from app.core.email import send_bill_email
from app.models.patient import Patient
from app.models.patient_schedule import PatientSchedule
from app.models.schedule import Schedule
from app.schemas.status import Status
from app.api.deps import get_current_user   
router = APIRouter()

@router.put("/bill")
async def send_bill(
    create_bill_dto: CreateBillDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send bill to patient"""
    try:
        if current_user.roleId != 2:  # Check if user is doctor
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền thực hiện"
            )

        # Get patient email
        result = await db.execute(
            select(Patient)
            .where(Patient.id == create_bill_dto.patientId)
        )
        patient = result.scalar_one_or_none()

        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy bệnh nhân"
            )

        # Update patient schedule status
        result = await db.execute(
            select(PatientSchedule)
            .options(
                joinedload(PatientSchedule.schedule)
                .joinedload(Schedule.doctor)
            )
            .where(
                PatientSchedule.patientId == create_bill_dto.patientId,
                PatientSchedule.scheduleId == create_bill_dto.scheduleId
            )
        )
        patient_schedule = result.unique().scalar_one_or_none()

        if not patient_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lịch khám"
            )

        # Update status to Done
        patient_schedule.status = Status.Done
        await db.commit()
        await db.refresh(patient_schedule)

        # Send bill email
        await send_bill_email(
            patient.email,
            {
                "doctor": patient_schedule.schedule.doctor.name,
                "startTime": patient_schedule.schedule.startTime,
                "endTime": patient_schedule.schedule.endTime,
                "price": patient_schedule.schedule.price
            }
        )

        return SuccessResponse(
            content="Gửi hóa đơn thành công",
            message="Send bill successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )




@router.get("", response_model=List[DoctorResponse])
@public_endpoint
async def get_all_doctors(
    db: AsyncSession = Depends(get_db)
):
    """Get all doctors"""
    try:
        # Query doctors with role_id = 2 and join related tables
        result = await db.execute(
            select(User)
            .where(User.roleId == 2)
            .options(
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.specialization),
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.clinic)
            )
        )
        doctors = result.unique().scalars().all()
        
        if not doctors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy bác sĩ"
            )
        

        doctor_responses = [
            {
                "id": str(doctor.id),  # Convert UUID to string
                "name": doctor.name,
                "avatar": doctor.avatar,
                "doctor_user": {
                    "specialization":{
                        "name": doctor.doctor_user.specialization.name,
                    },
                    "clinic": {
                        "name": doctor.doctor_user.clinic.name,
                    }
                }
            }
            for doctor in doctors
        ]
            
        return SuccessResponse(
            content=doctor_responses,
            message="Get all doctors successfully"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/spec/{id}", response_model=List[DoctorResponse])
@public_endpoint
async def get_doctors_by_specialization(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get doctors by specialization id"""
    try:
        # Query doctors with specified specialization_id and join related tables
        result = await db.execute(
            select(User)
            .join(DoctorUser, User.id == DoctorUser.doctorId)
            .where(
                User.roleId == 2,
                DoctorUser.specializationId == id
            )
            .options(
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.specialization),
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.clinic)
            )
        )
        doctors = result.unique().scalars().all()
        
        if not doctors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy bác sĩ"
            )

        doctor_responses = [
            {
                "doctor": {
                    "id": str(doctor.id),
                    "name": doctor.name,
                    "email": doctor.email,
                    "address": doctor.address,
                    "phone": doctor.phone,
                    "avatar": doctor.avatar,
                    "gender": doctor.gender,
                    "description": doctor.description,
                },
                    "specialization": {
                        "name": doctor.doctor_user.specialization.name,
                    },
                    "clinic": {
                        "name": doctor.doctor_user.clinic.name,
                    }
            }
            for doctor in doctors
        ]
            
        return SuccessResponse(
            content=doctor_responses,
            message="Get doctors by specialization successfully"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/clinic/{id}", response_model=List[DoctorResponse])
@public_endpoint
async def get_doctors_by_clinic(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get doctors by clinic id"""
    try:
        # Query doctors with specified clinic_id and join related tables
        result = await db.execute(
            select(User)
            .join(DoctorUser, User.id == DoctorUser.doctorId)
            .where(
                User.roleId == 2,
                DoctorUser.clinicId == id
            )
            .options(
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.specialization),
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.clinic)
            )
        )
        doctors = result.unique().scalars().all()
        
        if not doctors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy bác sĩ"
            )

        doctor_responses = [
            {
                "doctor": {
                    "id": str(doctor.id),
                    "name": doctor.name,
                    "avatar": doctor.avatar,
                },
                "clinic": {
                    "name": doctor.doctor_user.clinic.name,
                    "address": doctor.doctor_user.clinic.address,
                    "image": doctor.doctor_user.clinic.image,
                    "description": doctor.doctor_user.clinic.description,
                },
                "specialization": {
                    "name": doctor.doctor_user.specialization.name,
                }
            }
            for doctor in doctors
        ]
            
        return SuccessResponse(
            content=doctor_responses,
            message="Get doctors by clinic successfully"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{id}", response_model=DoctorDetailResponse)
@public_endpoint
async def get_doctor_by_id(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get doctor by id"""
    try:
        # Query doctor with specified id and join related tables
        result = await db.execute(
            select(User)
            .where(
                User.id == id,
                User.roleId == 2
            )
            .options(
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.specialization),
                joinedload(User.doctor_user)
                .joinedload(DoctorUser.clinic)
            )
        )
        doctor = result.unique().scalar_one_or_none()
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy bác sĩ"
            )

        doctor_response = {
            "id": str(doctor.id),
            "name": doctor.name,
            "avatar": doctor.avatar,
            "address": doctor.address,
            "phone": doctor.phone,
            "gender": doctor.gender,
            "description": doctor.description,
            "doctor_user": {
                "specialization": {
                    "name": doctor.doctor_user.specialization.name,
                    "description": doctor.doctor_user.specialization.description,
                },
                "clinic": {
                    "name": doctor.doctor_user.clinic.name,
                    "address": doctor.doctor_user.clinic.address,
                    "description": doctor.doctor_user.clinic.description,
                }
            }
        }
            
        return SuccessResponse(
            content=doctor_response,
            message="Get doctor successfully"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )




