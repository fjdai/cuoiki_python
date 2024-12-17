from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel
from sqlalchemy.orm import Mapped, mapped_column
from typing import List
from app.models.user import User
from app.models.patient_schedule import PatientSchedule

class Schedule(BaseModel):
    __tablename__ = "schedules"

    id: Mapped[UUID] = mapped_column(primary_key=True, index=True, default=uuid4)
    doctorId: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    startTime: Mapped[datetime] = mapped_column(nullable=False)
    endTime: Mapped[datetime] = mapped_column(nullable=False)
    price: Mapped[int] = mapped_column(nullable=False)
    maxBooking: Mapped[int] = mapped_column(nullable=False)
    sumBooking: Mapped[int] = mapped_column(default=0)
    
    doctor: Mapped[User] = relationship("User", back_populates="schedule")
    patient_schedules: Mapped[List[PatientSchedule]] = relationship("PatientSchedule", back_populates="schedule")