"""Seed the database with sample HCP data for demonstration."""
from database import engine, SessionLocal, Base
from models import HCP, Interaction, FollowUp
from datetime import datetime, timedelta


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(HCP).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    hcps = [
        HCP(first_name="Anita", last_name="Sharma", specialty="Cardiology",
            institution="Apollo Hospital", email="anita.sharma@apollo.com",
            phone="+91-9876543210", city="Mumbai", state="Maharashtra", tier="A"),
        HCP(first_name="Rajesh", last_name="Patel", specialty="Endocrinology",
            institution="Fortis Healthcare", email="rajesh.patel@fortis.com",
            phone="+91-9876543211", city="Delhi", state="Delhi", tier="A"),
        HCP(first_name="Priya", last_name="Menon", specialty="Oncology",
            institution="Tata Memorial Hospital", email="priya.menon@tata.com",
            phone="+91-9876543212", city="Mumbai", state="Maharashtra", tier="B"),
        HCP(first_name="Vikram", last_name="Singh", specialty="Neurology",
            institution="AIIMS", email="vikram.singh@aiims.com",
            phone="+91-9876543213", city="Delhi", state="Delhi", tier="A"),
        HCP(first_name="Deepa", last_name="Nair", specialty="Dermatology",
            institution="Manipal Hospital", email="deepa.nair@manipal.com",
            phone="+91-9876543214", city="Bangalore", state="Karnataka", tier="B"),
        HCP(first_name="Suresh", last_name="Kumar", specialty="Orthopedics",
            institution="Max Healthcare", email="suresh.kumar@max.com",
            phone="+91-9876543215", city="Delhi", state="Delhi", tier="C"),
        HCP(first_name="Kavitha", last_name="Reddy", specialty="Pediatrics",
            institution="Rainbow Children's Hospital", email="kavitha.reddy@rainbow.com",
            phone="+91-9876543216", city="Hyderabad", state="Telangana", tier="B"),
        HCP(first_name="Amit", last_name="Joshi", specialty="Psychiatry",
            institution="Nimhans", email="amit.joshi@nimhans.com",
            phone="+91-9876543217", city="Bangalore", state="Karnataka", tier="C"),
    ]

    db.add_all(hcps)
    db.commit()

    now = datetime.now()
    interactions = [
        Interaction(
            hcp_id=1, interaction_type="meeting",
            interaction_date=now - timedelta(days=7),
            duration_minutes=45,
            products_discussed="CardioShield 50mg, VasoPro 100mg",
            key_topics="New clinical trial data for CardioShield, competitive positioning",
            notes="Dr. Sharma expressed interest in the new Phase III data. Requested samples.",
            ai_summary="Productive meeting discussing CardioShield Phase III results. Dr. Sharma is interested and requested samples.",
            sentiment="positive", follow_up_required="yes",
        ),
        Interaction(
            hcp_id=2, interaction_type="phone_call",
            interaction_date=now - timedelta(days=3),
            duration_minutes=15,
            products_discussed="GlucoBalance XR",
            key_topics="Dosing guidelines, patient feedback",
            notes="Quick call to discuss GlucoBalance dosing for elderly patients.",
            ai_summary="Brief call about GlucoBalance XR dosing for elderly patients.",
            sentiment="neutral", follow_up_required="no",
        ),
        Interaction(
            hcp_id=3, interaction_type="conference",
            interaction_date=now - timedelta(days=14),
            duration_minutes=90,
            products_discussed="OncoDefend, ImmunoBoost",
            key_topics="ASCO conference findings, immunotherapy pipeline",
            notes="Met at ASCO conference. Discussed immunotherapy pipeline and upcoming trials.",
            ai_summary="Conference interaction at ASCO. Discussed immunotherapy pipeline including OncoDefend.",
            sentiment="positive", follow_up_required="yes",
        ),
    ]

    db.add_all(interactions)
    db.commit()

    follow_ups = [
        FollowUp(
            hcp_id=1, interaction_id=1,
            task_description="Send CardioShield Phase III clinical data packet",
            due_date=now + timedelta(days=3), priority="high", status="pending",
        ),
        FollowUp(
            hcp_id=3, interaction_id=3,
            task_description="Share immunotherapy pipeline presentation from ASCO",
            due_date=now + timedelta(days=5), priority="medium", status="pending",
        ),
    ]

    db.add_all(follow_ups)
    db.commit()
    db.close()

    print(f"Seeded {len(hcps)} HCPs, {len(interactions)} interactions, {len(follow_ups)} follow-ups.")


if __name__ == "__main__":
    seed()
