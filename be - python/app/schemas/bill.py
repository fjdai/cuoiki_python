from pydantic import BaseModel, Field
from uuid import UUID

class CreateBillDto(BaseModel):
    patientId: UUID = Field(..., description="ID của bệnh nhân")
    scheduleId: UUID = Field(..., description="ID của lịch khám")

    class Config:
        json_schema_extra = {
            "example": {
                "patientId": "550e8400-e29b-41d4-a716-446655440000",
                "scheduleId": "550e8400-e29b-41d4-a716-446655440001"
            }
        } 