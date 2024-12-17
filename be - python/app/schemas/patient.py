from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from enum import Enum
from uuid import UUID

class Gender(str, Enum):
    Male = "Male"
    Female = "Female"
    Other = "Other"

class CreatePatientDto(BaseModel):
    name: str = Field(..., description="Tên bệnh nhân")
    email: EmailStr = Field(..., description="Email bệnh nhân")
    phone: str = Field(..., description="Số điện thoại")
    address: str = Field(..., description="Địa chỉ")
    description: Optional[str] = Field(None, description="Mô tả")
    scheduleId: str = Field(..., description="ID của lịch khám")
    gender: Gender = Field(..., description="Giới tính")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Nguyễn Văn A",
                "email": "patient@example.com",
                "phone": "0123456789",
                "address": "123 ABC Street",
                "description": "Đau bụng",
                "scheduleId": "550e8400-e29b-41d4-a716-446655440000",
                "gender": "Male"
            }
        }
