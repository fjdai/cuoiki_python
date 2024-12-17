from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.patient import Patient
from app.models.patient_schedule import PatientSchedule
from app.models.schedule import Schedule
from app.schemas.patient import CreatePatientDto
from app.core.responses import SuccessResponse
from app.api.deps import public_endpoint
from app.schemas.schedule import Status
from app.core.email import send_booking_new_email
from uuid import UUID
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.post("")
@public_endpoint
async def create_patient(
    create_patient_dto: CreatePatientDto,
    db: AsyncSession = Depends(get_db)
):
    """Create new patient and book schedule"""
    try:
        # Check if schedule exists and has available slots
        schedule_result = await db.execute(
            select(Schedule)
            .options(joinedload(Schedule.doctor))
            .where(Schedule.id == create_patient_dto.scheduleId)
        )
        schedule = schedule_result.unique().scalar_one_or_none()

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lịch khám"
            )

        if schedule.sumBooking >= schedule.maxBooking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lịch khám đã đầy"
            )

        # Create new patient
        new_patient = Patient(
            name=create_patient_dto.name,
            email=create_patient_dto.email,
            phone=create_patient_dto.phone,
            address=create_patient_dto.address,
            description=create_patient_dto.description,
            gender=create_patient_dto.gender
        )
        db.add(new_patient)
        await db.flush()  # Flush to get the new patient's ID

        # Create patient schedule
        new_patient_schedule = PatientSchedule(
            patientId=new_patient.id,
            scheduleId=schedule.id,
            status=Status.Pending
        )
        db.add(new_patient_schedule)

        # Update schedule sumBooking
        schedule.sumBooking += 1

        await db.commit()
        await db.refresh(new_patient)
        await db.refresh(new_patient_schedule)
        await db.refresh(schedule)

        # Send confirmation email
        await send_booking_new_email(
            create_patient_dto.email,
            {
                "doctor": schedule.doctor.name,
                "startTime": schedule.startTime,
                "endTime": schedule.endTime,
                "name": create_patient_dto.name,
                "phone": create_patient_dto.phone,
                "email": create_patient_dto.email,
                "address": create_patient_dto.address,
                "description": create_patient_dto.description or ""
            }
        )

        return SuccessResponse(
            content="Đặt lịch khám thành công",
            message="Create patient successfully",
            status_code=status.HTTP_201_CREATED
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
