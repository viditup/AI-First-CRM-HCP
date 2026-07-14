from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import HCP, Interaction, FollowUp
from schemas import (
    HCPCreate, HCPResponse, InteractionCreate, InteractionUpdate,
    InteractionResponse, FollowUpCreate, FollowUpResponse,
    ChatMessage, ChatResponse,
)
from agent import chat_with_agent
from seed_data import seed
from typing import Optional

app = FastAPI(title="CRM HCP Module API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    seed()


# ── HCP Endpoints ──────────────────────────────────────────────

@app.get("/api/hcps", response_model=list[HCPResponse])
def list_hcps(
    search: Optional[str] = None,
    specialty: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(HCP)
    if search:
        q = q.filter(
            (HCP.first_name.ilike(f"%{search}%")) |
            (HCP.last_name.ilike(f"%{search}%"))
        )
    if specialty:
        q = q.filter(HCP.specialty.ilike(f"%{specialty}%"))
    return q.all()


@app.get("/api/hcps/{hcp_id}", response_model=HCPResponse)
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    return hcp


@app.post("/api/hcps", response_model=HCPResponse)
def create_hcp(hcp: HCPCreate, db: Session = Depends(get_db)):
    db_hcp = HCP(**hcp.model_dump())
    db.add(db_hcp)
    db.commit()
    db.refresh(db_hcp)
    return db_hcp


# ── Interaction Endpoints ──────────────────────────────────────

@app.get("/api/interactions", response_model=list[InteractionResponse])
def list_interactions(
    hcp_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Interaction)
    if hcp_id:
        q = q.filter(Interaction.hcp_id == hcp_id)
    return q.order_by(Interaction.interaction_date.desc()).all()


@app.get("/api/interactions/{interaction_id}", response_model=InteractionResponse)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction


@app.post("/api/interactions", response_model=InteractionResponse)
def create_interaction(interaction: InteractionCreate, db: Session = Depends(get_db)):
    hcp = db.query(HCP).filter(HCP.id == interaction.hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    db_interaction = Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction


@app.put("/api/interactions/{interaction_id}", response_model=InteractionResponse)
def update_interaction(
    interaction_id: int,
    updates: InteractionUpdate,
    db: Session = Depends(get_db),
):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(interaction, field, value)
    db.commit()
    db.refresh(interaction)
    return interaction


@app.delete("/api/interactions/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    db.delete(interaction)
    db.commit()
    return {"message": "Interaction deleted"}


# ── Follow-up Endpoints ───────────────────────────────────────

@app.get("/api/follow-ups", response_model=list[FollowUpResponse])
def list_follow_ups(
    hcp_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(FollowUp)
    if hcp_id:
        q = q.filter(FollowUp.hcp_id == hcp_id)
    if status:
        q = q.filter(FollowUp.status == status)
    return q.order_by(FollowUp.due_date).all()


@app.post("/api/follow-ups", response_model=FollowUpResponse)
def create_follow_up(follow_up: FollowUpCreate, db: Session = Depends(get_db)):
    db_follow_up = FollowUp(**follow_up.model_dump())
    db.add(db_follow_up)
    db.commit()
    db.refresh(db_follow_up)
    return db_follow_up


# ── Chat / AI Agent Endpoint ──────────────────────────────────

@app.post("/api/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    result = await chat_with_agent(message.message, message.conversation_id)
    return ChatResponse(**result)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "CRM HCP Module"}
