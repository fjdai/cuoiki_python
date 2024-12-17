from pydantic import BaseModel, Field
from typing import Optional

class ClinicResponse(BaseModel):
    id: str
    name: str
    address: str
    phone: str
    description: str
    image: Optional[str] = None

    class Config:
        from_attributes = True

class CreateClinicDto(BaseModel):
    name: str = Field(..., description="Tên phòng khám")
    phone: str = Field(..., description="Số điện thoại phòng khám")
    address: str = Field(..., description="Địa chỉ phòng khám")
    description: str = Field(..., description="Mô tả về phòng khám")
    image: Optional[str] = Field(None, description="Ảnh phòng khám")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Phòng khám Đa khoa ABC",
                "phone": "0123456789",
                "address": "123 Đường ABC, Quận 1, TP.HCM",
                "description": "Phòng khám đa khoa chất lượng cao",
                "image": "clinic.jpg"
            }
        }

class UpdateClinicDto(BaseModel):
    name: Optional[str] = Field(None, description="Tên phòng khám")
    phone: Optional[str] = Field(None, description="Số điện thoại phòng khám")
    address: Optional[str] = Field(None, description="Địa chỉ phòng khám")
    description: Optional[str] = Field(None, description="Mô tả về phòng khám")
    image: Optional[str] = Field(None, description="Ảnh phòng khám")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Phòng khám Đa khoa ABC Updated",
                "phone": "0123456789",
                "address": "123 Đường ABC, Quận 1, TP.HCM",
                "description": "Phòng khám đa khoa chất lượng cao",
                "image": "clinic-updated.jpg"
            }
        }
