"""ComplaintManager - Business logic for complaint operations."""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate
from app.services.ai_service import get_ai_service
import uuid

DEPARTMENT_MAP = {
    "Road": "PWD Department",
    "Water": "Water Supply Department",
    "Waste": "Sanitation Department",
    "Electricity": "Electricity Board",
    "Drainage": "Sewage Department",
    "Safety": "Police Department",
    "Other": "General Administration"
}

class ComplaintManager:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = get_ai_service()

    def _generate_id(self) -> str:
        return f"CMP-{uuid.uuid4().hex[:8].upper()}"

    def _get_department(self, category: str) -> str:
        return DEPARTMENT_MAP.get(category, "General Administration")

    def create_complaint(self, data: ComplaintCreate) -> Complaint:
        ai_result = self.ai_service.analyze(data.description)
        complaint = Complaint(
            complaint_id=self._generate_id(),
            description=data.description,
            category=ai_result["category"],
            priority=ai_result["priority"],
            location=data.location,
            status="Open",
            assigned_department=self._get_department(ai_result["category"]),
            ai_output=ai_result
        )
        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def get_complaint(self, complaint_id: str) -> Optional[Complaint]:
        return self.db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()

    def get_all_complaints(self, category=None, priority=None, status=None, location=None, search=None, skip=0, limit=100):
        query = self.db.query(Complaint)
        if category:
            query = query.filter(Complaint.category == category)
        if priority:
            query = query.filter(Complaint.priority == priority)
        if status:
            query = query.filter(Complaint.status == status)
        if location:
            query = query.filter(Complaint.location.ilike(f"%{location}%"))
        if search:
            query = query.filter(
                (Complaint.description.ilike(f"%{search}%")) |
                (Complaint.location.ilike(f"%{search}%"))
            )
        total = query.count()
        complaints = query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()
        return {"total": total, "complaints": complaints}

    def update_complaint(self, complaint_id: str, data: ComplaintUpdate) -> Optional[Complaint]:
        complaint = self.get_complaint(complaint_id)
        if not complaint:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(complaint, field, value)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def delete_complaint(self, complaint_id: str) -> bool:
        complaint = self.get_complaint(complaint_id)
        if not complaint:
            return False
        self.db.delete(complaint)
        self.db.commit()
        return True

    def get_analytics(self) -> Dict[str, Any]:
        total = self.db.query(Complaint).count()
        open_c = self.db.query(Complaint).filter(Complaint.status == "Open").count()
        assigned = self.db.query(Complaint).filter(Complaint.status == "Assigned").count()
        in_progress = self.db.query(Complaint).filter(Complaint.status == "In Progress").count()
        resolved = self.db.query(Complaint).filter(Complaint.status == "Resolved").count()
        closed = self.db.query(Complaint).filter(Complaint.status == "Closed").count()
        critical = self.db.query(Complaint).filter(Complaint.priority == "Critical").count()
        by_category = self.db.query(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category).all()
        by_priority = self.db.query(Complaint.priority, func.count(Complaint.id)).group_by(Complaint.priority).all()
        by_status = self.db.query(Complaint.status, func.count(Complaint.id)).group_by(Complaint.status).all()
        return {
            "total": total, "open": open_c, "assigned": assigned,
            "in_progress": in_progress, "resolved": resolved, "closed": closed, "critical": critical,
            "by_category": [{"name": c, "count": n} for c, n in by_category],
            "by_priority": [{"name": p, "count": n} for p, n in by_priority],
            "by_status": [{"name": s, "count": n} for s, n in by_status],
        }
