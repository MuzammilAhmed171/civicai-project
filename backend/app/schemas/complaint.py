"""Pydantic schemas for Complaint API."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class ComplaintCreate(BaseModel):
    description: str = Field(..., min_length=5, max_length=1000)
    location: str = Field(..., min_length=2, max_length=200)

class ComplaintUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=5, max_length=1000)
    category: Optional[str] = None
    priority: Optional[str] = None
    location: Optional[str] = Field(None, min_length=2, max_length=200)
    status: Optional[str] = Field(None, pattern="^(Open|Assigned|In Progress|Resolved|Closed)$")
    assigned_department: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    complaint_id: str
    description: str
    category: str
    priority: str
    location: str
    status: str
    assigned_department: str
    ai_output: Dict[str, Any]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ComplaintListResponse(BaseModel):
    total: int
    complaints: list[ComplaintResponse]

class AnalyticsSummary(BaseModel):
    total: int
    open: int
    assigned: int
    in_progress: int
    resolved: int
    closed: int
    critical: int
    by_category: list[Dict[str, Any]]
    by_priority: list[Dict[str, Any]]
    by_status: list[Dict[str, Any]]

class AIAnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=5, max_length=1000)

class AIAnalyzeResponse(BaseModel):
    category: str
    priority: str
    confidence: float
