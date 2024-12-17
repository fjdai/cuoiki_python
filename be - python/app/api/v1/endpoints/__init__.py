from fastapi import APIRouter
from app.db.seed import create_seed_data
from app.api.deps import public_endpoint

router = APIRouter()

@router.post("/seed-data")
@public_endpoint
async def seed_data():
    try:
        await create_seed_data()
        return {"message": "Data seeded successfully"}
    except Exception as e:
        return {"error": str(e)}

# Sau này sẽ import và include các router từ các endpoint khác vào đây
# Ví dụ:
# from .users import router as users_router
# router.include_router(users_router, prefix="/users", tags=["users"]) 