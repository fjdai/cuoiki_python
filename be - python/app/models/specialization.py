from uuid import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base_model import BaseModel
from typing import List
from uuid import uuid4
class Specialization(BaseModel):
    __tablename__ = "specializations"

    id: Mapped[UUID] = mapped_column(primary_key=True, index=True,default=uuid4)
    description: Mapped[str] = mapped_column(nullable=True)
    image: Mapped[str] = mapped_column(nullable=True)
    name: Mapped[str] = mapped_column(nullable=False)
    
    doctor_users: Mapped[List["DoctorUser"]] = relationship("DoctorUser", back_populates="specialization") # type: ignore