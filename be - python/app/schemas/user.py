from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class RegisterUserDto(BaseModel):
    email: EmailStr = Field(..., description="Email của người dùng")
    password: str = Field(..., description="Mật khẩu của người dùng")
    name: str = Field(..., description="Tên người dùng")
    phone: str = Field(..., description="Số điện thoại")
    address: Optional[str] = Field(None, description="Địa chỉ")
    gender: Optional[str] = Field(None, description="Giới tính")
    roleId: int = Field(..., description="ID của role")
    description: Optional[str] = Field(None, description="Mô tả")
    avatar: Optional[str] = Field(None, description="Avatar")
    specialtyId: Optional[str] = Field(None, description="ID chuyên khoa (cho bác sĩ)")
    clinicId: Optional[str] = Field(None, description="ID phòng khám (cho bác sĩ)")

class UpdateUserDto(BaseModel):
    id: str = Field(..., description="ID người dùng")
    email: EmailStr = Field(..., description="Email của người dùng")
    name: str = Field(..., description="Tên người dùng")
    phone: str = Field(..., description="Số điện thoại")
    address: Optional[str] = Field(None, description="Địa chỉ")
    gender: Optional[str] = Field(None, description="Giới tính")
    roleId: int = Field(..., description="ID của role")
    description: Optional[str] = Field(None, description="Mô tả")
    specialtyId: Optional[str] = Field(None, description="ID chuyên khoa (cho bác sĩ)")
    clinicId: Optional[str] = Field(None, description="ID phòng khám (cho bác sĩ)") 