from typing import List, TYPE_CHECKING
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.user import User

class Role(BaseModel):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    
    users: Mapped[List["User"]] = relationship("User", back_populates="role")