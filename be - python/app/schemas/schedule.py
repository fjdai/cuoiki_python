from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class Status(str, Enum):
    Pending = "Pending"
    Accept = "Accept"
    Reject = "Reject"
    Done = "Done"

class ChangeStateDto(BaseModel):
    patientId: str = Field(..., description="ID của bệnh nhân")
    scheduleId: str = Field(..., description="ID của lịch khám")
    status: Status = Field(..., description="Trạng thái mới")

class CreateScheduleDto(BaseModel):
    startTime: datetime = Field(..., description="Thời gian bắt đầu")
    endTime: datetime = Field(..., description="Thời gian kết thúc")
    price: int = Field(..., description="Giá khám")
    maxBooking: int = Field(..., description="Số lượng bệnh nhân tối đa")

class UpdateScheduleDto(BaseModel):
    id: str = Field(..., description="ID lịch khám")
    startTime: datetime = Field(..., description="Thời gian bắt đầu")
    endTime: datetime = Field(..., description="Thời gian kết thúc")
    price: float = Field(..., description="Giá khám")
    maxBooking: int = Field(..., description="Số lượng bệnh nhân tối đa") 