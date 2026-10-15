"""
Database Seeding Script for Loan Eligibility AI.
Provisions default administrative, reviewer, and applicant personas with sample records.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, LoanProduct, LoanApplication, CreditCheck, Prediction, PredictionFactor, AuditLog
from .auth import hash_password


def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        admin = db.query(User).filter(User.email == "admin@loanai.local").first()
        jeeva = db.query(User).filter(User.email == "jeeva@loanai.local").first()
        if not jeeva:
            jeeva_user = User(
                name="Jeeva Bharathi M",
                email="jeeva@loanai.local",
                password_hash=hash_password("User@12345"),
                role="APPLICANT"
            )
            db.add(jeeva_user)
            db.commit()

        if admin:
            print("[SEED] Database already provisioned with seed data.")
            return

        print("[SEED] Provisioning initial users and products...")

        # 1. Users
        admin_user = User(
            name="Dr. Arulmozhi Varman",
            email="admin@loanai.local",
            password_hash=hash_password("Admin@12345"),
            role="ADMIN"
        )
        reviewer_user = User(
            name="Kavitha Sundaram",
            email="reviewer@loanai.local",
            password_hash=hash_password("Reviewer@12345"),
            role="REVIEWER"
        )
        jeeva_user = User(
            name="Jeeva Bharathi M",
            email="jeeva@loanai.local",
            password_hash=hash_password("User@12345"),
            role="APPLICANT"
        )
        karthik_user = User(
            name="Karthik Selvam",
            email="karthik@loanai.local",
            password_hash=hash_password("User@12345"),
            role="APPLICANT"
        )
        anitha_user = User(
            name="Anitha Murugan",
            email="anitha@loanai.local",
            password_hash=hash_password("User@12345"),
            role="APPLICANT"
        )
        muthu_user = User(
            name="Muthu Pandian",
            email="muthu@loanai.local",
            password_hash=hash_password("User@12345"),
            role="APPLICANT"
        )

        db.add_all([admin_user, reviewer_user, jeeva_user, karthik_user, anitha_user, muthu_user])
        db.flush()

        # 2. Loan Products
        products = [
            LoanProduct(name="Personal Express Loan", code="PERSONAL_EXPRESS", min_amount=25000, max_amount=1500000, min_tenure=12, max_tenure=60, base_interest_rate=10.5),
            LoanProduct(name="Home Improvement Loan", code="HOME_IMPROVE", min_amount=100000, max_amount=3000000, min_tenure=24, max_tenure=120, base_interest_rate=9.25),
            LoanProduct(name="Small Business Growth", code="BIZ_GROWTH", min_amount=50000, max_amount=2000000, min_tenure=12, max_tenure=48, base_interest_rate=12.0)
        ]
        db.add_all(products)
        db.flush()

        # 3. Sample Applications
        # App 1: Karthik Selvam (Prime - Approved)
        app_karthik = LoanApplication(
            id="APP-2026-0841",
            user_id=karthik_user.id,
            product_code="HOME_IMPROVE",
            income=90000,
            employment_type="salaried",
            age=30,
            dependents=1,
            loan_amount=800000,
            loan_tenure=36,
            loan_purpose="home",
            existing_loans=1,
            monthly_obligations=5000,
            status="APPROVED",
            stage="DISBURSEMENT_PENDING"
        )

        # App 2: Anitha Murugan (Needs Review)
        app_anitha = LoanApplication(
            id="APP-2026-0842",
            user_id=anitha_user.id,
            product_code="BIZ_GROWTH",
            income=45000,
            employment_type="self_employed",
            age=42,
            dependents=2,
            loan_amount=1200000,
            loan_tenure=48,
            loan_purpose="business",
            existing_loans=2,
            monthly_obligations=8000,
            status="NEEDS_REVIEW",
            stage="REVIEW_REQUIRED"
        )

        # App 3: Muthu Pandian (Declined)
        app_muthu = LoanApplication(
            id="APP-2026-0843",
            user_id=muthu_user.id,
            product_code="PERSONAL_EXPRESS",
            income=25000,
            employment_type="self_employed",
            age=55,
            dependents=4,
            loan_amount=3000000,
            loan_tenure=60,
            loan_purpose="personal",
            existing_loans=3,
            monthly_obligations=12000,
            status="DECLINED",
            stage="DECLINED"
        )

        db.add_all([app_karthik, app_anitha, app_muthu])
        db.flush()

        # 4. Associated Credit Profiles
        crd_karthik = CreditCheck(
            application_id=app_karthik.id,
            provider_mode="DEMO",
            provider_name="TRANSUNION_CIBIL",
            cibil_score=780,
            payment_history=98.0,
            credit_utilization=20.0,
            credit_history_years=8.0,
            recent_enquiries=1,
            verification_status="VERIFIED"
        )
        crd_anitha = CreditCheck(
            application_id=app_anitha.id,
            provider_mode="DEMO",
            provider_name="TRANSUNION_CIBIL",
            cibil_score=690,
            payment_history=88.0,
            credit_utilization=55.0,
            credit_history_years=5.0,
            recent_enquiries=3,
            verification_status="DEMO_UNVERIFIED"
        )
        crd_muthu = CreditCheck(
            application_id=app_muthu.id,
            provider_mode="DEMO",
            provider_name="TRANSUNION_CIBIL",
            cibil_score=520,
            payment_history=60.0,
            credit_utilization=90.0,
            credit_history_years=2.0,
            recent_enquiries=6,
            verification_status="DEMO_UNVERIFIED"
        )
        db.add_all([crd_karthik, crd_anitha, crd_muthu])

        # 5. Audit Log
        db.add(AuditLog(
            user_id=admin_user.id,
            action="SYSTEM_SEEDED",
            details="Database provisioned with initial users and benchmark personas."
        ))

        db.commit()
        print("[SEED] Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
