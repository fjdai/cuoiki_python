from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    name: Optional[str] = None

class RoleResponse(RoleBase):
    id: int
    createdAt: Optional[datetime] = None 
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True 