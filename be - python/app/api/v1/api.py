from fastapi import APIRouter
from app.api.v1.endpoints import auth, clinic, specialty, doctor, schedules, users, admin, patient

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(clinic.router, prefix="/clinic", tags=["clinic"])
api_router.include_router(specialty.router, prefix="/specialty", tags=["specialty"])
api_router.include_router(doctor.router, prefix="/doctor", tags=["doctor"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(patient.router, prefix="/patient", tags=["patient"])
@api_router.get("/health-check")
async def health_check():
    return {"status": "ok"} 