from uuid import UUID
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel

from app.models.user import User
from app.models.clinic import Clinic
from app.models.specialization import Specialization

class DoctorUser(BaseModel):
    __tablename__ = "doctor_user"
    
    doctorId: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    clinicId: Mapped[UUID] = mapped_column(ForeignKey("clinics.id"), primary_key=True)
    specializationId: Mapped[UUID] = mapped_column(ForeignKey("specializations.id"), primary_key=True)
    
    doctor: Mapped["User"] = relationship("User", back_populates="doctor_user")
    clinic: Mapped["Clinic"] = relationship("Clinic", back_populates="doctor_users")
    specialization: Mapped["Specialization"] = relationship("Specialization", back_populates="doctor_users") 