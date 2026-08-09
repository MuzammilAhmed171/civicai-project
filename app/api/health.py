"""Health check API routes."""
from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "CivicAI Backend"}

@router.get("/")
def root():
    return {"message": "CivicAI API is running!", "version": "1.0.0", "docs": "/docs"}
