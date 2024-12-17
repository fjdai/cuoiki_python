from datetime import datetime
from uuid import UUID
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base_model import BaseModel
import enum

class Status(str, enum.Enum):
    Pending = "Pending"
    Accept = "Accept"
    Reject = "Reject"
    Done = "Done"

class PatientSchedule(BaseModel):
    __tablename__ = "patient_schedule"

    patientId: Mapped[UUID] = mapped_column(ForeignKey("patients.id"), primary_key=True)
    scheduleId: Mapped[UUID] = mapped_column(ForeignKey("schedules.id"), primary_key=True)
    status: Mapped[Status] = mapped_column(nullable=False, default=Status.Pending)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="patient_schedules") # type: ignore
    schedule: Mapped["Schedule"] = relationship("Schedule", back_populates="patient_schedules") # type: ignore