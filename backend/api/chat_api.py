from fastapi import APIRouter
from pydantic import BaseModel
from crew.crew_setup import run_crew

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(req: ChatRequest):
    reply = run_crew(req.message)
    return {"reply": reply}