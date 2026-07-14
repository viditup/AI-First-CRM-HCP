from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HCPBase(BaseModel):
    first_name: str
    last_name: str
    specialty: Optional[str] = None
    institution: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    tier: Optional[str] = None


class HCPCreate(HCPBase):
    pass


class HCPResponse(HCPBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InteractionBase(BaseModel):
    hcp_id: int
    interaction_type: str
    interaction_date: datetime
    duration_minutes: Optional[int] = None
    products_discussed: Optional[str] = None
    key_topics: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: Optional[str] = "no"


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(BaseModel):
    interaction_type: Optional[str] = None
    interaction_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    products_discussed: Optional[str] = None
    key_topics: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: Optional[str] = None


class InteractionResponse(InteractionBase):
    id: int
    ai_summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FollowUpBase(BaseModel):
    hcp_id: int
    interaction_id: Optional[int] = None
    task_description: str
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpResponse(FollowUpBase):
    id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    tool_calls: Optional[list] = None
    interaction_logged: Optional[dict] = None
