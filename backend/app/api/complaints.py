"""Complaint API routes."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse, ComplaintListResponse
from app.services.complaint_service import ComplaintManager

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(data: ComplaintCreate, db: Session = Depends(get_db)):
    """Submit a new complaint. AI automatically analyzes and assigns category + priority."""
    manager = ComplaintManager(db)
    complaint = manager.create_complaint(data)
    return complaint

@router.get("/", response_model=ComplaintListResponse)
def get_complaints(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Get all complaints with optional filters."""
    manager = ComplaintManager(db)
    result = manager.get_all_complaints(category, priority, status, location, search, skip, limit)
    return result

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    """Get a single complaint by ID."""
    manager = ComplaintManager(db)
    complaint = manager.get_complaint(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(complaint_id: str, data: ComplaintUpdate, db: Session = Depends(get_db)):
    """Update a complaint."""
    manager = ComplaintManager(db)
    complaint = manager.update_complaint(complaint_id, data)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complaint(complaint_id: str, db: Session = Depends(get_db)):
    """Delete a complaint."""
    manager = ComplaintManager(db)
    deleted = manager.delete_complaint(complaint_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return None
