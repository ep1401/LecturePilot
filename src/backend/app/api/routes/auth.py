from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter(tags=["auth"])


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Authenticated request successful",
        "user": current_user,
    }