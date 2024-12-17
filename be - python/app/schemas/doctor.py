from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from app.models.user import Gender

class SpecializationInfo(BaseModel):
    name: str

class ClinicDetailInfo(BaseModel):
    name: str
    address: str
    image: Optional[str] = None
    description: Optional[str] = None

class DoctorUserInfo(BaseModel):
    specialization: SpecializationInfo
    clinic: ClinicDetailInfo

class DoctorResponse(BaseModel):
    id: UUID
    name: str
    email: str
    address: str
    phone: str
    avatar: Optional[str] = None
    gender: Gender
    description: Optional[str] = None
    doctor_user: Optional[DoctorUserInfo] = None

    class Config:
        from_attributes = True

class DoctorClinicResponse(BaseModel):
    id: UUID
    name: str
    avatar: Optional[str] = None
    doctor_user: Optional[DoctorUserInfo] = None

    class Config:
        from_attributes = True

class DoctorDetailResponse(BaseModel):
    id: UUID
    name: str
    avatar: Optional[str] = None
    address: str
    phone: str
    gender: Gender
    description: Optional[str] = None
    doctor_user: Optional[DoctorUserInfo] = None

    class Config:
        from_attributes = True
