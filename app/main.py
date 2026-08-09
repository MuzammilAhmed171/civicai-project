"""
CivicAI - FastAPI Backend
=========================
Smart Civic Complaint System Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import init_db
from app.api import complaints, analytics, health

init_db()

app = FastAPI(
    title="CivicAI API",
    description="Smart Civic Complaint System - AI-powered complaint classification and priority prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(complaints.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
