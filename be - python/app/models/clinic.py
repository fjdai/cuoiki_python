from uuid import UUID
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel
from typing import List
from uuid import uuid4

class Clinic(BaseModel):
    __tablename__ = "clinics"

    id: Mapped[UUID] = mapped_column(primary_key=True,default=uuid4)
    name: Mapped[str] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(nullable=False)
    phone: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)
    image: Mapped[str] = mapped_column(nullable=True)
    
    doctor_users: Mapped[List["DoctorUser"]] = relationship("DoctorUser", back_populates="clinic") # type: ignore