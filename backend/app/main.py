import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.application import LoanApplication
from app.routers import auth, kyc, biometrics, underwriting, applications, audit, disbursement, personas
from app.routers.personas import seed_persona_application

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Pre-seed default accounts and benchmark demonstration personas if empty
    db = SessionLocal()
    try:
        officer = db.query(User).filter(User.role == "CHIEF_UNDERWRITER").first()
        if not officer:
            officer = User(
                username="dr_arulmozhi",
                full_name=settings.CHIEF_UNDERWRITER_NAME,
                mobile="9000090421",
                email="officer@rbi-lending.gov.in",
                role="CHIEF_UNDERWRITER",
                hashed_pin="90421"
            )
            db.add(officer)
            db.commit()
            
        app_count = db.query(LoanApplication).count()
        if app_count == 0:
            print("Pre-seeding benchmark demonstration personas for Viva testing...")
            seed_persona_application("jeeva_bharathi", db)
            seed_persona_application("jeeva_b", db)
            seed_persona_application("karthik_raman", db)
            print("Successfully pre-seeded 3 benchmark personas!")
    except Exception as e:
        print(f"Warning during pre-seeding: {e}")
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Explainable AI (XAI) Digital Personal Loan Processing System with DigiLocker SSO (Meri Pehchaan) and Tri-Biometric Identity Verification",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(kyc.router, prefix=settings.API_PREFIX)
app.include_router(biometrics.router, prefix=settings.API_PREFIX)
app.include_router(underwriting.router, prefix=settings.API_PREFIX)
app.include_router(applications.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)
app.include_router(disbursement.router, prefix=settings.API_PREFIX)
app.include_router(personas.router, prefix=settings.API_PREFIX)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "model": "Microsoft InterpretML Explainable Boosting Machine (GA²M)",
        "rbi_compliance": "DLG-2022/2023",
        "underwriter": f"{settings.CHIEF_UNDERWRITER_NAME} ({settings.CHIEF_UNDERWRITER_ID})"
    }

# Static Frontend mounting for unified full-stack serving
frontend_dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes or documentation
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            return None
        file_path = os.path.join(frontend_dist_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
