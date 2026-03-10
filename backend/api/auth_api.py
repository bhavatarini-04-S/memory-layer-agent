from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

users = []

class User(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

@router.post("/signup")
def signup(user: User):
    # Check if user already exists
    for u in users:
        if u.email == user.email or (user.phone and u.phone == user.phone):
            raise HTTPException(status_code=400, detail="User already exists")
    
    users.append(user)
    return {"message": "User created successfully", "email": user.email}

@router.post("/login")
def login(user: User):
    for u in users:
        # Check email or phone login
        if ((user.email and u.email == user.email) or 
            (user.phone and u.phone == user.phone)) and u.password == user.password:
            return {
                "message": "Login successful",
                "user": {
                    "email": u.email,
                    "phone": u.phone
                },
                "token": "dummy-token-12345"
            }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")