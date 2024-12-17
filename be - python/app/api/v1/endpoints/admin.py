from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User
from app.models.patient_schedule import PatientSchedule
from app.models.specialization import Specialization
from app.core.responses import SuccessResponse
from app.api.deps import get_current_user
from app.schemas.admin import DashboardResponse

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    try:
        # Check if user is admin (roleId = 1)
        if current_user.roleId != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can access this endpoint"
            )

        # Count supporters (roleId = 3)
        supporters_result = await db.execute(
            select(func.count()).where(User.roleId == 3)
        )
        supporters = supporters_result.scalar()

        # Count doctors (roleId = 2)
        doctors_result = await db.execute(
            select(func.count()).where(User.roleId == 2)
        )
        doctors = doctors_result.scalar()

        # Count total schedules
        schedules_result = await db.execute(
            select(func.count()).select_from(PatientSchedule)
        )
        schedules = schedules_result.scalar()

        # Count specialties
        specialties_result = await db.execute(
            select(func.count()).select_from(Specialization)
        )
        specialties = specialties_result.scalar()

        dashboard_data = {
            "supporters": supporters,
            "doctors": doctors,
            "schedule": schedules,
            "specialties": specialties
        }

        return SuccessResponse(
            content=dashboard_data,
            message="Get dashboard statistics successfully"
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
