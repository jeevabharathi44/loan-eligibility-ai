"""
Startup script to launch the unified FastAPI backend server.
Serves on port 5000 with auto-reload, seeding, and SQLite/PostgreSQL persistence.
"""
import uvicorn
from backend_fastapi.config import settings

if __name__ == "__main__":
    print("=" * 65)
    print("  Explainable AI Digital Personal Loan Processing System")
    print("  Unified FastAPI Backend Service")
    print(f"  * Mode:        {settings.APP_ENV.upper()}")
    print(f"  * Host:        http://{settings.HOST}:{settings.PORT}")
    print(f"  * Swagger API: http://localhost:{settings.PORT}/docs")
    print(f"  * Database:    {settings.DATABASE_URL}")
    print("=" * 65)
    uvicorn.run("backend_fastapi.main:app", host=settings.HOST, port=settings.PORT, reload=True)
