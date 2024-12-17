from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .role import RoleResponse
from .clinic import ClinicResponse
from .specialty import SpecialtyResponse

class DoctorUserResponse(BaseModel):
    clinic: ClinicResponse
    specialization: SpecialtyResponse

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    gender: str
    description: Optional[str] = None
    address: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str
    roleId: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None

class UserResponse(UserBase):
    id: str
    role: RoleResponse
    doctor_user: Optional[DoctorUserResponse] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    isDeleted: Optional[bool] = None

    class Config:
        from_attributes = True 