from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone, timedelta
from app.db.database import get_db
from app.models.schedule import Schedule
from app.api.deps import public_endpoint, get_current_user
from app.core.responses import SuccessResponse
from uuid import UUID
from app.schemas.schedules import ScheduleListResponse, ScheduleResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import joinedload
from app.models.user import User
from app.models.patient_schedule import Status, PatientSchedule
from app.core.email import (
    send_booking_success_email,
    send_booking_failed_email
)
from app.schemas.schedule import (
    ChangeStateDto, CreateScheduleDto, UpdateScheduleDto, Status
)
from sqlalchemy import or_

router = APIRouter()

# Thêm hàm helper để chuyển đổi timezone
def convert_to_vietnam_time(dt: datetime) -> datetime:
    """Convert datetime to Vietnam timezone (UTC+7)"""
    # Nếu dt là naive datetime, giả định nó là UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    vietnam_tz = timezone(timedelta(hours=7))
    return dt.astimezone(vietnam_tz).replace(tzinfo=None)

@router.get("/patient-accept", response_model=ScheduleListResponse)
async def get_patient_accept_schedule(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get schedules with accepted/done patients for a doctor"""
    try:
        # Check if user is a doctor (roleId = 2)
        if current_user.roleId != 2:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can access this endpoint"
            )

        # Query schedules with accepted/done patient information
        result = await db.execute(
            select(Schedule)
            .options(
                joinedload(Schedule.patient_schedules.and_(
                    PatientSchedule.status.in_([Status.Accept, Status.Done])
                ))
                .joinedload(PatientSchedule.patient)
            )
            .where(
                Schedule.doctorId == current_user.id,
            )
            .order_by(Schedule.startTime)
        )
        schedules = result.unique().scalars().all()

        if not schedules:
            return SuccessResponse(
                content=[],
                message="No schedules found with accepted patients"
            )

        # Convert to response model with patient information
        schedule_responses = [
            {
                "id": str(schedule.id),
                "startTime": schedule.startTime.isoformat(),
                "endTime": schedule.endTime.isoformat(),
                "price": schedule.price,
                "Patient_Schedule": [
                    {
                        "status": ps.status,
                        "patient": {
                            "id": str(ps.patient.id),
                            "name": ps.patient.name,
                            "phone": ps.patient.phone,
                            "email": ps.patient.email,
                            "gender": ps.patient.gender,
                            "address": ps.patient.address,
                            "description": ps.patient.description,
                        }
                    }
                    for ps in schedule.patient_schedules
                    if ps.status in [Status.Accept, Status.Done]
                ]   
            }
            for schedule in schedules
            if any(ps.status in [Status.Accept, Status.Done] for ps in schedule.patient_schedules)
        ]

        return SuccessResponse(
            content=schedule_responses,
            message="Get schedules with accepted patients successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("", response_model=ScheduleListResponse)
async def get_schedules_for_doctor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all schedules by doctor id for doctor"""
    try:
        # Check if user is a doctor (roleId = 2)
        if current_user.roleId != 2:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can access this endpoint"
            )

        # Get start of current day in Vietnam time
        current_date = convert_to_vietnam_time(
            datetime.now(timezone.utc)
        ).replace(hour=0, minute=0, second=0, microsecond=0)

        # Query schedules with patient information
        result = await db.execute(
            select(Schedule)
            .options(
                joinedload(Schedule.patient_schedules.and_(
                    or_(
                        PatientSchedule.status == Status.Accept,
                        PatientSchedule.status == Status.Done
                    )
                ))
                .joinedload(PatientSchedule.patient)
            )
            .where(
                Schedule.doctorId == current_user.id,
                Schedule.startTime >= current_date
            )
            .order_by(Schedule.startTime)
        )
        schedules = result.unique().scalars().all()

        if not schedules:
            return SuccessResponse(
                content=[],
                message="No schedules found"
            )

        # Convert to response model with patient information
        schedule_responses = [
            {
                "id": str(schedule.id),
                "startTime": schedule.startTime.isoformat(),
                "endTime": schedule.endTime.isoformat(),
                "price": schedule.price,
                "maxBooking": schedule.maxBooking,
                "Patient_Schedule": [
                    {
                        "status": ps.status,
                        "patient": {
                            "id": str(ps.patient.id),
                            "name": ps.patient.name,
                            "phone": ps.patient.phone,
                            "email": ps.patient.email,
                            "gender": ps.patient.gender,
                            "address": ps.patient.address,
                            "description": ps.patient.description,
                        }
                    }
                    for ps in schedule.patient_schedules
                    if ps.status == Status.Accept or ps.status == Status.Done 
                ]   
            }
            for schedule in schedules
        ]

        return SuccessResponse(
            content=schedule_responses,
            message="Get schedules for doctor successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



@router.get("/supporter", response_model=dict)
async def get_all_schedules_for_supporter(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all schedules for supporter and group by patient status"""
    try:
        # Check if user is a supporter (roleId = 3)
        if current_user.roleId != 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only supporters can access this endpoint"
            )

        # Query all schedules with patient and doctor information
        result = await db.execute(
            select(Schedule)
            .options(
                joinedload(Schedule.patient_schedules)
                .joinedload(PatientSchedule.patient),
                joinedload(Schedule.doctor)
            )
            .order_by(Schedule.startTime)
        )
        schedules = result.unique().scalars().all()

        if not schedules:
            return SuccessResponse(
                content={},
                message="No schedules found"
            )

        # Transform data to group by status
        transformed_data = {}
        for schedule in schedules:
            for ps in schedule.patient_schedules:
                status_key = ps.status
                if status_key not in transformed_data:
                    transformed_data[status_key] = {"patients": []}

                transformed_data[status_key]["patients"].append({
                    "patient": {
                        "id": str(ps.patient.id),
                        "name": ps.patient.name,
                        "phone": ps.patient.phone,
                        "email": ps.patient.email,
                        "gender": ps.patient.gender,
                        "address": ps.patient.address,
                        "description": ps.patient.description
                    },
                    "scheduleId": str(schedule.id),
                    "startTime": schedule.startTime.isoformat(),
                    "endTime": schedule.endTime.isoformat(),
                    "price": schedule.price,
                    "maxBooking": schedule.maxBooking,
                    "doctor": {
                        "name": schedule.doctor.name,
                        "phone": schedule.doctor.phone
                    }
                })

        return SuccessResponse(
            content=transformed_data,
            message="Get all schedules for supporter successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



@router.get("/{id}", response_model=ScheduleListResponse)
@public_endpoint
async def get_schedules_by_doctor_id(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get available schedules by doctor id for patient"""
    try:
        # Get start of current day in Vietnam time
        current_date = convert_to_vietnam_time(
            datetime.now(timezone.utc)
        ).replace(hour=0, minute=0, second=0, microsecond=0)

        # Query schedules with conditions
        result = await db.execute(
            select(Schedule)
            .where(
                Schedule.doctorId == id,
                Schedule.startTime >= current_date,  # Compare with start of day
                Schedule.sumBooking < Schedule.maxBooking  # Available slots check
            )
            .order_by(Schedule.startTime)  # Order by start time
        )
        schedules = result.scalars().all()
        
        if not schedules:
            return SuccessResponse(
                content=[],
                message="No available schedules found"
            )
        
        # Convert to response model and then to dict with proper serialization
        schedule_responses = [
            {
                "id": str(schedule.id),  # Convert UUID to string
                "doctorId": str(schedule.doctorId),  # Convert UUID to string
                "startTime": schedule.startTime.isoformat(),
                "endTime": schedule.endTime.isoformat(),
                "price": schedule.price,
                "maxBooking": schedule.maxBooking,
                "sumBooking": schedule.sumBooking
            }
            for schedule in schedules
        ]
            
        return SuccessResponse(
            content=schedule_responses,
            message="Get schedules by doctor successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/change-status")
async def change_schedule_status(
    change_state_dto: ChangeStateDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change schedule status (Supporter only)"""
    try:
        if current_user.roleId != 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ supporter mới có thể thay đổi trạng thái lịch khám"
            )

        # Update status
        result = await db.execute(
            select(PatientSchedule)
            .where(
                PatientSchedule.patientId == change_state_dto.patientId,
                PatientSchedule.scheduleId == change_state_dto.scheduleId
            )
            .options(
                joinedload(PatientSchedule.patient),
                joinedload(PatientSchedule.schedule).joinedload(Schedule.doctor)
            )
        )
        patient_schedule = result.unique().scalar_one_or_none()

        if not patient_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lịch khám"
            )

        patient_schedule.status = change_state_dto.status
        await db.commit()
        await db.refresh(patient_schedule)

        # Send email notification
        if change_state_dto.status == Status.Accept:
            await send_booking_success_email(
                patient_schedule.patient.email,
                {
                    "doctor": patient_schedule.schedule.doctor.name,
                    "startTime": patient_schedule.schedule.startTime,
                    "endTime": patient_schedule.schedule.endTime,
                }
            )
        else:
            await send_booking_failed_email(
                patient_schedule.patient.email,
                {
                    "doctor": patient_schedule.schedule.doctor.name,
                    "startTime": patient_schedule.schedule.startTime,
                    "endTime": patient_schedule.schedule.endTime,
                }
            )

        return SuccessResponse(
            content={"status": change_state_dto.status},
            message="Thay đổi trạng thái lịch khám thành công"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{patientId}/{scheduleId}")
async def delete_patient_schedule(
    patientId: UUID,
    scheduleId: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete patient schedule (Supporter only)"""
    try:
        if current_user.roleId != 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ supporter mới có thể xóa lịch khám"
            )

        # Delete patient schedule
        result = await db.execute(
            select(PatientSchedule)
            .where(
                PatientSchedule.patientId == patientId,
                PatientSchedule.scheduleId == scheduleId
            )
        )
        patient_schedule = result.scalar_one_or_none()

        if not patient_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lịch khám"
            )

        await db.delete(patient_schedule)

        # Update sumBooking
        result = await db.execute(
            select(Schedule).where(Schedule.id == scheduleId)
        )
        schedule = result.scalar_one_or_none()
        if schedule:
            schedule.sumBooking -= 1

        await db.commit()

        return SuccessResponse(
            content="Đã xóa thành công",
            message="Delete patient schedule successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("")
async def create_schedule(
    create_schedule_dto: CreateScheduleDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create schedule (Doctor only)"""
    try:
        if current_user.roleId != 2:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ bác sĩ mới có thể tạo lịch khám"
            )

        # Chuyển current_date sang giờ Việt Nam
        current_date = convert_to_vietnam_time(
            datetime.now(timezone.utc)
        ).replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Chuyển startTime và endTime sang giờ Việt Nam
        start_time = convert_to_vietnam_time(create_schedule_dto.startTime)
        end_time = convert_to_vietnam_time(create_schedule_dto.endTime)

        if start_time < current_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thời gian bắt đầu không hợp lệ"
            )

        if end_time <= start_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thời gian kết thúc phải sau thời gian bắt đầu"
            )

        # Check for overlapping schedules
        result = await db.execute(
            select(Schedule)
            .where(
                Schedule.doctorId == current_user.id,
                Schedule.startTime <= end_time,
                Schedule.endTime >= start_time,
                Schedule.isDeleted == False
            )
        )
        overlapping_schedules = result.scalars().all()
        if overlapping_schedules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lịch khám bị trùng với lịch khám khác"
            )

        # Create schedule with Vietnam time
        new_schedule = Schedule(
            doctorId=current_user.id,
            startTime=start_time,
            endTime=end_time,
            price=create_schedule_dto.price,
            maxBooking=create_schedule_dto.maxBooking,
            sumBooking=0
        )
        
        db.add(new_schedule)
        await db.commit()
        await db.refresh(new_schedule)

        return SuccessResponse(
            content={
                "id": str(new_schedule.id),
                "startTime": new_schedule.startTime.isoformat(),
                "endTime": new_schedule.endTime.isoformat(),
                "price": new_schedule.price,
                "maxBooking": new_schedule.maxBooking
            },
            message="Tạo lịch khám thành công"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("")
async def update_schedule(
    update_schedule_dto: UpdateScheduleDto,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update schedule (Doctor only)"""
    try:
        if current_user.roleId != 2:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ bác sĩ mới có thể cập nhật lịch khám"
            )

        # Chuyển current_date sang giờ Việt Nam
        current_date = convert_to_vietnam_time(
            datetime.now(timezone.utc)
        ).replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Chuyển startTime và endTime sang giờ Việt Nam
        start_time = convert_to_vietnam_time(update_schedule_dto.startTime)
        end_time = convert_to_vietnam_time(update_schedule_dto.endTime)

        if start_time < current_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thời gian bắt đầu không hợp lệ"
            )

        if end_time <= start_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thời gian kết thúc phải sau thời gian bắt đầu"
            )

        # Check schedule exists and belongs to doctor
        result = await db.execute(
            select(Schedule)
            .where(
                Schedule.id == update_schedule_dto.id,
                Schedule.doctorId == current_user.id
            )
        )
        schedule = result.scalar_one_or_none()
        
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lịch khám hoặc không có quyền cập nhật"
            )

        # Check for overlapping schedules
        result = await db.execute(
            select(Schedule)
            .where(
                Schedule.doctorId == current_user.id,
                Schedule.id != update_schedule_dto.id,
                Schedule.startTime <= end_time,
                Schedule.endTime >= start_time,
                Schedule.isDeleted == False
            )
        )
        overlapping_schedules = result.scalars().all()
        if overlapping_schedules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lịch khám bị trùng với lịch khám khác"
            )

        # Update schedule with Vietnam time
        schedule.startTime = start_time
        schedule.endTime = end_time
        schedule.price = update_schedule_dto.price
        schedule.maxBooking = update_schedule_dto.maxBooking

        await db.commit()
        await db.refresh(schedule)

        return SuccessResponse(
            content={
                "id": str(schedule.id),
                "startTime": schedule.startTime.isoformat(),
                "endTime": schedule.endTime.isoformat(),
                "price": schedule.price,
                "maxBooking": schedule.maxBooking
            },
            message="Cập nhật lịch khám thành công"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{id}")
async def delete_schedule(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete schedule (Doctor only)"""
    try:
        if current_user.roleId != 2:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ bác sĩ mới có thể xóa lịch khám"
            )

        # Check schedule exists and belongs to doctor
        result = await db.execute(
            select(Schedule)
            .where(
                Schedule.id == id,
                Schedule.doctorId == current_user.id
            )
        )
        schedule = result.scalar_one_or_none()
        
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lịch khám hoặc không có quyền xóa"
            )

        await db.delete(schedule)
        await db.commit()

        return SuccessResponse(
            content="Đã xóa thành công",
            message="Delete schedule successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



