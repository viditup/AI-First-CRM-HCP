from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class InteractionType(str, enum.Enum):
    DETAIL_AID = "detail_aid"
    SAMPLE_DROP = "sample_drop"
    MEETING = "meeting"
    PHONE_CALL = "phone_call"
    EMAIL = "email"
    CONFERENCE = "conference"
    LUNCH_LEARN = "lunch_and_learn"
    VIRTUAL_MEETING = "virtual_meeting"


class Sentiment(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class FollowUpStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    specialty = Column(String(200))
    institution = Column(String(300))
    email = Column(String(200))
    phone = Column(String(50))
    city = Column(String(100))
    state = Column(String(100))
    tier = Column(String(10))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interactions = relationship("Interaction", back_populates="hcp")
    follow_ups = relationship("FollowUp", back_populates="hcp")


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=False)
    interaction_type = Column(String(50), nullable=False)
    interaction_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer)
    products_discussed = Column(Text)
    key_topics = Column(Text)
    notes = Column(Text)
    ai_summary = Column(Text)
    sentiment = Column(String(20))
    follow_up_required = Column(String(10), default="no")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    hcp = relationship("HCP", back_populates="interactions")


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=False)
    interaction_id = Column(Integer, ForeignKey("interactions.id"))
    task_description = Column(Text, nullable=False)
    due_date = Column(DateTime(timezone=True))
    status = Column(String(20), default="pending")
    priority = Column(String(20), default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hcp = relationship("HCP", back_populates="follow_ups")
    interaction = relationship("Interaction")
