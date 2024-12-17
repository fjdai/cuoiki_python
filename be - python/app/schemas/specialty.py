from pydantic import BaseModel, Field
from typing import Optional

class SpecialtyResponse(BaseModel):
    id: str
    name: str
    description: str
    image: Optional[str] = None

    class Config:
        from_attributes = True

# Thêm các DTOs mới
class CreateSpecialtyDto(BaseModel):
    name: str = Field(..., description="Tên chuyên ngành")
    description: str = Field(..., description="Mô tả về chuyên ngành")
    image: Optional[str] = Field(None, description="Ảnh chuyên ngành")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Khoa Tim mạch",
                "description": "Chuyên khoa về bệnh lý tim mạch",
                "image": "cardiology.jpg"
            }
        }

class UpdateSpecialtyDto(BaseModel):
    name: Optional[str] = Field(None, description="Tên chuyên ngành")
    description: Optional[str] = Field(None, description="Mô tả về chuyên ngành")
    image: Optional[str] = Field(None, description="Ảnh chuyên ngành")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Khoa Tim mạch Updated",
                "description": "Chuyên khoa về bệnh lý tim mạch - Updated",
                "image": "cardiology-updated.jpg"
            }
        }

