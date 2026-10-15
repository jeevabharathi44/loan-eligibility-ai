"""
Academic Documentation & IEEE Conference Paper Generator for:
Explainable AI-Based Digital Personal Loan Processing System
Generates:
1. COLLEGE_REPORT_AND_IEEE_PAPER.html
2. COLLEGE_REPORT_AND_IEEE_PAPER.pdf (via Edge headless)
3. COLLEGE_REPORT_AND_IEEE_PAPER.md
"""
import os
import sys
import subprocess
import shutil

REPO_DIR = r"C:\Users\Jeeva\loan-eligibility-ai"
ARTIFACT_DIR = r"C:\Users\Jeeva\.gemini\antigravity\brain\8a4eb416-178b-4429-b382-550eafdfba18"

HTML_PATH = os.path.join(REPO_DIR, "COLLEGE_REPORT_AND_IEEE_PAPER.html")
PDF_PATH = os.path.join(REPO_DIR, "COLLEGE_REPORT_AND_IEEE_PAPER.pdf")
MD_PATH = os.path.join(REPO_DIR, "COLLEGE_REPORT_AND_IEEE_PAPER.md")

ARTIFACT_PDF_PATH = os.path.join(ARTIFACT_DIR, "COLLEGE_REPORT_AND_IEEE_PAPER.pdf")
ARTIFACT_MD_PATH = os.path.join(ARTIFACT_DIR, "COLLEGE_REPORT_AND_IEEE_PAPER.md")

print("Starting generation of comprehensive academic documentation...")
