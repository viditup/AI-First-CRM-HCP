from langchain_core.tools import tool
from sqlalchemy.orm import Session
from models import HCP, Interaction, FollowUp
from database import SessionLocal
from datetime import datetime, timezone
from typing import Optional
import json


def get_db_session() -> Session:
    return SessionLocal()


@tool
def log_interaction(
    hcp_id: int,
    interaction_type: str,
    interaction_date: str,
    notes: str,
    products_discussed: str = "",
    key_topics: str = "",
    duration_minutes: int = 30,
    sentiment: str = "neutral",
    follow_up_required: str = "no"
) -> str:
    """Log a new interaction with a Healthcare Professional (HCP).
    Use this tool when the user wants to record a meeting, call, email, or any
    interaction with an HCP. The interaction_type can be: detail_aid, sample_drop,
    meeting, phone_call, email, conference, lunch_and_learn, virtual_meeting.
    The sentiment can be: positive, neutral, negative.
    The interaction_date should be in ISO format (YYYY-MM-DDTHH:MM:SS).
    """
    db = get_db_session()
    try:
        hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
        if not hcp:
            return json.dumps({"error": f"HCP with ID {hcp_id} not found"})

        parsed_date = datetime.fromisoformat(interaction_date)

        interaction = Interaction(
            hcp_id=hcp_id,
            interaction_type=interaction_type,
            interaction_date=parsed_date,
            notes=notes,
            products_discussed=products_discussed,
            key_topics=key_topics,
            duration_minutes=duration_minutes,
            sentiment=sentiment,
            follow_up_required=follow_up_required,
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)

        return json.dumps({
            "success": True,
            "interaction_id": interaction.id,
            "message": f"Interaction logged successfully for Dr. {hcp.first_name} {hcp.last_name}",
            "details": {
                "type": interaction_type,
                "date": interaction_date,
                "hcp": f"Dr. {hcp.first_name} {hcp.last_name}",
                "products": products_discussed,
                "topics": key_topics,
                "sentiment": sentiment,
            }
        })
    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)})
    finally:
        db.close()


@tool
def edit_interaction(
    interaction_id: int,
    interaction_type: Optional[str] = None,
    interaction_date: Optional[str] = None,
    notes: Optional[str] = None,
    products_discussed: Optional[str] = None,
    key_topics: Optional[str] = None,
    duration_minutes: Optional[int] = None,
    sentiment: Optional[str] = None,
    follow_up_required: Optional[str] = None
) -> str:
    """Edit an existing interaction record. Use this tool when the user wants to
    update or modify a previously logged interaction. Only provide the fields
    that need to be changed."""
    db = get_db_session()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return json.dumps({"error": f"Interaction with ID {interaction_id} not found"})

        updates = {}
        if interaction_type is not None:
            interaction.interaction_type = interaction_type
            updates["interaction_type"] = interaction_type
        if interaction_date is not None:
            interaction.interaction_date = datetime.fromisoformat(interaction_date)
            updates["interaction_date"] = interaction_date
        if notes is not None:
            interaction.notes = notes
            updates["notes"] = notes
        if products_discussed is not None:
            interaction.products_discussed = products_discussed
            updates["products_discussed"] = products_discussed
        if key_topics is not None:
            interaction.key_topics = key_topics
            updates["key_topics"] = key_topics
        if duration_minutes is not None:
            interaction.duration_minutes = duration_minutes
            updates["duration_minutes"] = duration_minutes
        if sentiment is not None:
            interaction.sentiment = sentiment
            updates["sentiment"] = sentiment
        if follow_up_required is not None:
            interaction.follow_up_required = follow_up_required
            updates["follow_up_required"] = follow_up_required

        db.commit()

        hcp = db.query(HCP).filter(HCP.id == interaction.hcp_id).first()
        return json.dumps({
            "success": True,
            "message": f"Interaction #{interaction_id} updated successfully",
            "hcp": f"Dr. {hcp.first_name} {hcp.last_name}" if hcp else "Unknown",
            "updated_fields": updates,
        })
    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)})
    finally:
        db.close()


@tool
def search_hcp(
    query: str,
    search_by: str = "name"
) -> str:
    """Search for Healthcare Professionals in the database.
    search_by can be: name, specialty, institution, city.
    Use this tool when the user mentions an HCP by name, specialty, or location
    and you need to find their record."""
    db = get_db_session()
    try:
        q = db.query(HCP)
        if search_by == "name":
            q = q.filter(
                (HCP.first_name.ilike(f"%{query}%")) |
                (HCP.last_name.ilike(f"%{query}%"))
            )
        elif search_by == "specialty":
            q = q.filter(HCP.specialty.ilike(f"%{query}%"))
        elif search_by == "institution":
            q = q.filter(HCP.institution.ilike(f"%{query}%"))
        elif search_by == "city":
            q = q.filter(HCP.city.ilike(f"%{query}%"))

        results = q.limit(10).all()
        if not results:
            return json.dumps({"results": [], "message": f"No HCPs found matching '{query}'"})

        hcp_list = [{
            "id": h.id,
            "name": f"Dr. {h.first_name} {h.last_name}",
            "specialty": h.specialty,
            "institution": h.institution,
            "city": h.city,
            "state": h.state,
            "tier": h.tier,
        } for h in results]

        return json.dumps({"results": hcp_list, "count": len(hcp_list)})
    finally:
        db.close()


@tool
def get_interaction_history(
    hcp_id: int,
    limit: int = 10
) -> str:
    """Retrieve the interaction history for a specific HCP.
    Use this tool when the user wants to see past interactions with a doctor,
    or needs context about previous meetings before logging a new one."""
    db = get_db_session()
    try:
        hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
        if not hcp:
            return json.dumps({"error": f"HCP with ID {hcp_id} not found"})

        interactions = (
            db.query(Interaction)
            .filter(Interaction.hcp_id == hcp_id)
            .order_by(Interaction.interaction_date.desc())
            .limit(limit)
            .all()
        )

        history = [{
            "id": i.id,
            "type": i.interaction_type,
            "date": i.interaction_date.isoformat() if i.interaction_date else None,
            "duration_minutes": i.duration_minutes,
            "products_discussed": i.products_discussed,
            "key_topics": i.key_topics,
            "notes": i.notes,
            "sentiment": i.sentiment,
            "ai_summary": i.ai_summary,
        } for i in interactions]

        return json.dumps({
            "hcp": f"Dr. {hcp.first_name} {hcp.last_name}",
            "specialty": hcp.specialty,
            "total_interactions": len(history),
            "interactions": history,
        })
    finally:
        db.close()


@tool
def schedule_follow_up(
    hcp_id: int,
    task_description: str,
    due_date: str,
    priority: str = "medium",
    interaction_id: Optional[int] = None
) -> str:
    """Schedule a follow-up task for an HCP. Use this tool when the user
    mentions needing to follow up with a doctor, send materials, schedule
    another meeting, etc. Priority can be: low, medium, high, urgent.
    The due_date should be in ISO format (YYYY-MM-DDTHH:MM:SS)."""
    db = get_db_session()
    try:
        hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
        if not hcp:
            return json.dumps({"error": f"HCP with ID {hcp_id} not found"})

        parsed_date = datetime.fromisoformat(due_date)

        follow_up = FollowUp(
            hcp_id=hcp_id,
            interaction_id=interaction_id,
            task_description=task_description,
            due_date=parsed_date,
            priority=priority,
            status="pending",
        )
        db.add(follow_up)
        db.commit()
        db.refresh(follow_up)

        return json.dumps({
            "success": True,
            "follow_up_id": follow_up.id,
            "message": f"Follow-up scheduled for Dr. {hcp.first_name} {hcp.last_name}",
            "details": {
                "task": task_description,
                "due_date": due_date,
                "priority": priority,
                "hcp": f"Dr. {hcp.first_name} {hcp.last_name}",
            }
        })
    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)})
    finally:
        db.close()


ALL_TOOLS = [log_interaction, edit_interaction, search_hcp, get_interaction_history, schedule_follow_up]
