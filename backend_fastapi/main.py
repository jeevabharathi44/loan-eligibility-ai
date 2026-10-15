"""
FastAPI Unified Application Entry Point.
Mounts all REST routers, enables CORS, initializes database tables,
and handles application lifecycle events.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import engine, Base
from .seed import seed_database

# Import routers
from .routes.auth_routes import router as auth_router
from .routes.application_routes import router as app_router
from .routes.digilocker_routes import router as digilocker_router
from .routes.face_routes import router as face_router
from .routes.credit_routes import router as credit_router
from .routes.bank_routes import router as bank_router
from .routes.document_routes import router as doc_router
from .routes.prediction_routes import router as pred_router
from .routes.decision_routes import router as decision_router
from .routes.disbursement_routes import router as disb_router
from .routes.admin_routes import router as admin_router
from .routes.dataset_routes import router as dataset_router


app = FastAPI(
    title=settings.APP_NAME,
    description="Explainable AI-Based Digital Personal Loan Processing Platform with API Setu DigiLocker, Camera Face Liveness, CIBIL Scoring, Bank Verification, EBM ML Inference, and Simulated Disbursement.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if "*" not in origins:
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(app_router)
app.include_router(digilocker_router)
app.include_router(face_router)
app.include_router(credit_router)
app.include_router(bank_router)
app.include_router(doc_router)
app.include_router(pred_router)
app.include_router(decision_router)
app.include_router(disb_router)
app.include_router(admin_router)
app.include_router(dataset_router)

# Mount Static Assets
import os
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

frontend_assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "public", "assets")
if os.path.exists(frontend_assets_dir):
    app.mount("/assets", StaticFiles(directory=frontend_assets_dir), name="assets")


@app.on_event("startup")
def on_startup():
    """Initializes tables and seeds benchmark data on startup."""
    Base.metadata.create_all(bind=engine)
    seed_database()


@app.get("/health")
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "digilocker_mode": settings.DIGILOCKER_MODE,
        "face_verification_mode": settings.FACE_VERIFICATION_MODE,
        "credit_provider_mode": settings.CREDIT_PROVIDER_MODE,
        "bank_provider_mode": settings.BANK_PROVIDER_MODE,
        "disbursement_mode": settings.DISBURSEMENT_MODE
    }


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
