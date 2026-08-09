"""Analytics and AI API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.complaint import AIAnalyzeRequest, AIAnalyzeResponse, AnalyticsSummary
from app.services.ai_service import get_ai_service
from app.services.complaint_service import ComplaintManager

router = APIRouter(prefix="/analytics", tags=["Analytics & AI"])

@router.get("/", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    """Get dashboard analytics summary."""
    manager = ComplaintManager(db)
    return manager.get_analytics()

@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze_complaint(data: AIAnalyzeRequest):
    """Analyze a complaint text using AI (no DB save)."""
    try:
        ai_service = get_ai_service()
        result = ai_service.analyze(data.description)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI analysis failed: {str(e)}")
