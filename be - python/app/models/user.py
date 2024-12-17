from typing import List, TYPE_CHECKING
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base_model import BaseModel
import enum

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.doctor_user import DoctorUser
    from app.models.schedule import Schedule

class Gender(str, enum.Enum):
    Male = "Male"
    Female = "Female"

class User(BaseModel):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, index=True, default=uuid4)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(nullable=False)
    phone: Mapped[str] = mapped_column(nullable=False)
    gender: Mapped[Gender] = mapped_column(default=Gender.Male)
    roleId: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)
    address: Mapped[str] = mapped_column(nullable=False)
    avatar: Mapped[str] = mapped_column(nullable=True)
    refresh_token: Mapped[str] = mapped_column(nullable=True)
    
    # Configure relationships with eager loading
    role: Mapped["Role"] = relationship(
        "Role", 
        back_populates="users",
        lazy="selectin"
    )
    
    doctor_user: Mapped["DoctorUser"] = relationship(
        "DoctorUser", 
        back_populates="doctor",
        lazy="selectin"
    )
    
    schedule: Mapped[List["Schedule"]] = relationship(
        "Schedule", 
        back_populates="doctor",
        lazy="selectin"
    )


 