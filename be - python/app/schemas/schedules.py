from pydantic import BaseModel, field_serializer
from datetime import datetime
from uuid import UUID
from typing import List
from app.models.patient_schedule import Status

class ScheduleBase(BaseModel):
    doctorId: UUID
    startTime: datetime
    endTime: datetime
    price: int
    maxBooking: int
    sumBooking: int

    @field_serializer('startTime', 'endTime')
    def serialize_datetime(self, dt: datetime, _info):
        return dt.isoformat()

    class Config:
        from_attributes = True

class ScheduleResponse(ScheduleBase) :
    id: UUID

class ScheduleListResponse(BaseModel):
    content: List[ScheduleResponse]
    message: str

class PatientInfo(BaseModel):
    id: UUID
    name: str
    status: Status

class DoctorScheduleResponse(BaseModel):
    id: UUID
    startTime: datetime
    endTime: datetime
    price: int
    maxBooking: int
    patients: List[PatientInfo]

    @field_serializer('startTime', 'endTime')
    def serialize_datetime(self, dt: datetime, _info):
        return dt.isoformat()

    class Config:
        from_attributes = True

class ScheduleDoctorResponse(BaseModel):
    content: List[DoctorScheduleResponse]
    message: str
