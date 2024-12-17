from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base_model import BaseModel
from app.models.user import Gender
from typing import List
from uuid import UUID
from uuid import uuid4
class Patient(BaseModel):
    __tablename__ = "patients"

    id: Mapped[UUID] = mapped_column(primary_key=True,default=uuid4)
    name: Mapped[str] = mapped_column(nullable=False)
    phone: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False)
    gender: Mapped[Gender] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)
    
    patient_schedules: Mapped[List["PatientSchedule"]] = relationship("PatientSchedule", back_populates="patient") # type: ignore
    
