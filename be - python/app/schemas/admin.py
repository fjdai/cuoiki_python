from pydantic import BaseModel

class DashboardResponse(BaseModel):
    supporters: int
    doctors: int
    schedule: int
    specialties: int

    class Config:
        from_attributes = True
