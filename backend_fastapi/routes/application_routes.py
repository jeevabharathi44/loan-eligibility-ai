"""
Loan Application Lifecycle routes with strict IDOR protection.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, LoanApplication, ApplicantConsent, AuditLog
from ..schemas import LoanApplicationCreate, LoanApplicationResponse, ConsentRequest, UserResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Applications"])


@router.post("", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    req: LoanApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Normalize loan amount: if provided in Lakhs (<= 500), convert to INR
    amt = req.loanAmount
    if 0.1 <= amt <= 500:
        amt_inr = amt * 100000.0
    else:
        amt_inr = amt

    app = LoanApplication(
        user_id=current_user.id,
        income=req.income,
        employment_type=req.employmentType,
        age=req.age,
        dependents=req.dependents,
        loan_amount=amt_inr,
        loan_tenure=req.loanTenure,
        loan_purpose=req.loanPurpose or "personal",
        existing_loans=req.existingLoans,
        monthly_obligations=req.monthlyObligations,
        status="SUBMITTED",
        stage="DOCUMENTS_PENDING"
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    audit = AuditLog(
        user_id=current_user.id,
        application_id=app.id,
        action="APPLICATION_CREATED",
        details=f"Application created for ₹{amt_inr:,.0f} over {req.loanTenure} months."
    )
    db.add(audit)
    db.commit()

    return LoanApplicationResponse(
        id=app.id,
        userId=app.user_id,
        income=app.income,
        employmentType=app.employment_type,
        age=app.age,
        dependents=app.dependents,
        loanAmount=app.loan_amount,
        loanTenure=app.loan_tenure,
        loanPurpose=app.loan_purpose,
        existingLoans=app.existing_loans,
        monthlyObligations=app.monthly_obligations,
        status=app.status,
        stage=app.stage,
        createdAt=app.created_at,
        updatedAt=app.updated_at,
        user=UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            role=current_user.role,
            createdAt=current_user.created_at
        )
    )


@router.get("", response_model=List[LoanApplicationResponse])
def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce IDOR protection: APPLICANT only retrieves their own applications
    if current_user.role in ["REVIEWER", "ADMIN"]:
        apps = db.query(LoanApplication).order_by(LoanApplication.created_at.desc()).all()
    else:
        apps = db.query(LoanApplication).filter(LoanApplication.user_id == current_user.id).order_by(LoanApplication.created_at.desc()).all()

    results = []
    for app in apps:
        app_user = app.user
        results.append(LoanApplicationResponse(
            id=app.id,
            userId=app.user_id,
            income=app.income,
            employmentType=app.employment_type,
            age=app.age,
            dependents=app.dependents,
            loanAmount=app.loan_amount,
            loanTenure=app.loan_tenure,
            loanPurpose=app.loan_purpose,
            existingLoans=app.existing_loans,
            monthlyObligations=app.monthly_obligations,
            status=app.status,
            stage=app.stage,
            createdAt=app.created_at,
            updatedAt=app.updated_at,
            user=UserResponse(
                id=app_user.id,
                name=app_user.name,
                email=app_user.email,
                role=app_user.role,
                createdAt=app_user.created_at
            ) if app_user else None
        ))
    return results


@router.get("/{id}", response_model=LoanApplicationResponse)
def get_application(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {id} not found."
        )

    # IDOR Protection: Reject unauthorized cross-applicant access
    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this loan application."
        )

    app_user = app.user
    return LoanApplicationResponse(
        id=app.id,
        userId=app.user_id,
        income=app.income,
        employmentType=app.employment_type,
        age=app.age,
        dependents=app.dependents,
        loanAmount=app.loan_amount,
        loanTenure=app.loan_tenure,
        loanPurpose=app.loan_purpose,
        existingLoans=app.existing_loans,
        monthlyObligations=app.monthly_obligations,
        status=app.status,
        stage=app.stage,
        createdAt=app.created_at,
        updatedAt=app.updated_at,
        user=UserResponse(
            id=app_user.id,
            name=app_user.name,
            email=app_user.email,
            role=app_user.role,
            createdAt=app_user.created_at
        ) if app_user else None
    )


@router.post("/{id}/consent")
def record_consent(
    id: str,
    req: ConsentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    consent = ApplicantConsent(
        application_id=app.id,
        user_id=current_user.id,
        purpose=req.purpose,
        consent_text=req.consentText
    )
    db.add(consent)
    db.commit()

    return {"success": True, "message": f"Consent granted for {req.purpose}."}
