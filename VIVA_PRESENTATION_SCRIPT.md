# Smart Digital Lending System & Viva Presentation Guide
## 16-Slide Viva Voce Presentation with 4 Problem Statements & 5 Core Models

> **Presentation File:** [`Smart_Digital_Lending_System_Viva_Presentation.pptx`](file:///C:/Users/Jeeva/.gemini/antigravity/scratch/loan-eligibility-ai/Smart_Digital_Lending_System_Viva_Presentation.pptx)  
> **Artifact File Copy:** [`Smart_Digital_Lending_System_Viva_Presentation.pptx`](file:///C:/Users/Jeeva/.gemini/antigravity/brain/e905d853-ffc3-4e6a-aec2-a3c083d192f0/Smart_Digital_Lending_System_Viva_Presentation.pptx)  
> **Institution:** Sri Ramakrishna Institute of Technology, Coimbatore  
> **Department:** Department of Computer Science and Engineering  
> **Course:** 20CS902 – Final Year Project Phase I (Viva Voce)  
> **Team:** Jeesha S (71382302061), Jeeva Bharathi M (71382302062 / 71382302064), Krishnakanth M (71382302083), Poovizhi Thangam V (71382302116)  
> **Supervisor:** Dr. M. Kalpana Devi, Associate Professor, CSE  

---

## Executive Summary: 4 Problems & 5 Core Models

### The 4 Real-World Problem Statements
1. **Loan Delays Due to Manual Verification:** Traditional physical document collection and human checking takes **3 to 7 days**, causing frustration for borrowers needing urgent funds.
2. **Fake Certificate & Forgery Fraud:** Scammers upload photoshopped salary slips, fake Aadhaar cards, or edited PAN cards that human loan officers easily overlook.
3. **Identity Theft via Stolen OTPs:** Fraudsters trick victims into revealing their Aadhaar or PAN OTP (via phishing or SIM swap), allowing them to take unauthorized loans in someone else's name without their consent.
4. **Unexplained "Black Box" Rejections:** Modern credit AI models approve or reject loans without telling the applicant *why*, leaving rejected borrowers helpless and violating **RBI Fair Lending Guidelines**.

### The 5 Core Models & Modules
| # | Model / Module | Purpose | How It Solves the Problem |
| :---: | :--- | :--- | :--- |
| **1** | **DigiLocker Model** | Automated Government Document Retrieval | Connects directly to UIDAI & Income Tax servers. Replaces manual uploads with authentic, tamper-proof e-Aadhaar and e-PAN in seconds (**Solves Problems 1 & 2**). |
| **2** | **Biometric Verification Model** | Live Facial Recognition (Tri-Biometric) | Captures live selfie via webcam and matches against both Aadhaar photo AND PAN photo simultaneously ($\ge 75\%$ threshold). Fraudsters with stolen OTPs are stopped because their face doesn't match (**Solves Problem 3**). |
| **3** | **OCR Extraction Model** | Document Details Cross-Check | Automatically reads text from documents, validates names, and performs fuzzy string matching across Aadhaar and PAN to catch spelling mismatches (**Solves Problems 2 & 3**). |
| **4** | **Explainable Boosting Machine (EBM)** | Transparent Credit Risk Underwriting | A "Glass-Box" machine learning model that predicts approval and breaks down the exact mathematical impact of income, debts, and credit score into clear, plain-English reasons (**Solves Problem 4**). |
| **5** | **Random Forest Model** | High-Accuracy Benchmark Comparison | The industry-standard ensemble benchmark model (100+ trees). Used to validate that our transparent EBM model matches state-of-the-art ensemble accuracy (**85.37%**). |

---

## Slide-by-Slide Content & Viva Presentation Script (What to Say)

### Slide 1: Title Slide
- **Slide Title:** Smart Digital Lending System with Automated Document Verification, Biometric Security and Explainable AI
- **What to Say:**
  > "Respected evaluators and faculty, good morning. We are Batch 1, presenting our Phase-I Final Year Project: *Smart Digital Lending System with Automated Document Verification, Biometric Security and Explainable AI*, guided by Dr. M. Kalpana Devi. Our project transforms the personal loan approval process from a slow, fraud-vulnerable manual system into an instant, tamper-proof, and 100% explainable digital platform."

---

### Slide 2: Abstract
- **Slide Title:** ABSTRACT (Fast, Fraud-Proof & Transparent Loan Processing using 5 Core Technologies)
- **Key Points on Slide:**
  - Problem: Days of manual verification, fake documents, OTP theft, and unexplained rejections.
  - Solution: 5 integrated modules: DigiLocker, Tri-Biometric Face Match, OCR Cross-Check, EBM Glass-Box, and Random Forest benchmark.
  - Outcome: 60-second processing, zero fake document fraud, immune to OTP theft, 85.37% test accuracy, and plain-English reasons.
- **What to Say:**
  > "In summary, traditional loans take days, can be tricked by forged certificates or stolen OTPs, and leave rejected applicants in the dark. We built an integrated system with 5 core modules: DigiLocker for authentic documents, Face Biometrics to prevent OTP theft, OCR for cross-checking, EBM for explainable underwriting, and Random Forest as our benchmark. An application is completed and audited in under 60 seconds with 85.37% accuracy."

---

### Slide 3: Problem Statement and Motivation
- **Slide Title:** PROBLEM STATEMENT AND MOTIVATION (The 4 Critical Problems in Lending)
- **Key Points on Slide:**
  - Problem 1: Manual review delays (3–7 days).
  - Problem 2: Fake certificates & forged income slips.
  - Problem 3: Identity theft by stealing Aadhaar/PAN OTPs.
  - Problem 4: Unexplained "black box" credit rejections.
  - Solution & Motivation: Instant government document fetch, physical face presence verification, OCR cross-checks, and plain-English EBM explanations compliant with RBI guidelines.
- **What to Say:**
  > "We identified four major real-world problems in digital lending today:
  > First, manual paperwork takes 3 to 7 days, delaying emergency funds.
  > Second, fraudsters upload photoshopped certificates and edited ID cards that human reviewers miss.
  > Third, scammers steal Aadhaar or PAN OTPs through phishing or SIM swaps, taking loans in innocent people's names.
  > Fourth, modern AI algorithms reject applicants without explaining why.
  > Our motivation is to solve all four issues in compliance with RBI's Digital Lending Guidelines."

---

### Slide 4: Objectives
- **Slide Title:** OBJECTIVES (Mapped to Implemented Modules)
- **Key Points on Slide:**
  - Table mapping each objective to its implemented module and verification status.
- **What to Say:**
  > "Our objectives were divided into five concrete modules:
  > 1. Automated Document Retrieval using DigiLocker.
  > 2. Live Biometric Face Matching using computer vision.
  > 3. Document Details Extraction using OCR.
  > 4. Transparent Credit Scoring using Explainable Boosting Machine.
  > 5. Benchmarking and validation against Random Forest.
  > All five modules are fully implemented and integrated."

---

### Slide 5: Literature Review and Research Gap
- **Slide Title:** LITERATURE REVIEW AND RESEARCH GAP
- **Key Points on Slide:**
  - Compares manual review, OTP-only digital lending, black-box deep learning, post-hoc SHAP explainers, and our unified proposed system.
  - Research Gap: No existing system unites government document fetch, 3-way biometrics, and glass-box explainable AI in a single end-to-end platform.
- **What to Say:**
  > "Existing literature focuses on either credit scoring or biometric security in isolation. Traditional scorecards are transparent but inaccurate; deep neural networks and Random Forests are accurate but 'black boxes'; and post-hoc SHAP approximations can be misleading with correlated financial data. Furthermore, OTP-only KYC fails against identity theft. Our contribution is bridging this gap by uniting authentic DigiLocker retrieval, 3-way biometrics, and native glass-box AI in one complete workflow."

---

### Slide 6: Proposed Methodology
- **Slide Title:** PROPOSED METHODOLOGY (5-Stage Simple Pipeline)
- **Key Points on Slide:**
  - Step 1: DigiLocker SSO (Aadhaar & PAN fetch)
  - Step 2: Tri-Biometric Match (Live webcam vs both documents)
  - Step 3: OCR Cross-Check (Name & DOB consistency)
  - Step 4: EBM Underwriting (Income, debts, CIBIL, EMI)
  - Step 5: Instant Decision & Plain-English Explanation
- **What to Say:**
  > "Our system follows a seamless 5-stage pipeline:
  > The borrower signs in via DigiLocker, which retrieves verified government records.
  > Next, the live camera captures a selfie and matches it against both the Aadhaar and PAN photos.
  > Third, OCR cross-checks the name and details between both cards.
  > Fourth, the EBM model evaluates the applicant's financial affordability.
  > Finally, the system outputs an instant sanction letter or a transparent rejection letter explaining the top reasons."

---

### Slide 7: System Architecture
- **Slide Title:** SYSTEM ARCHITECTURE (Components and Data Flow)
- **Key Points on Slide:**
  - React 18 frontend wizard with live camera viewfinder.
  - Security tier: DigiLocker service + OpenCV face matcher + Tesseract OCR.
  - ML tier: FastAPI backend running EBM and Random Forest.
  - Database: SQLite / MySQL audit log.
- **What to Say:**
  > "The architecture uses a modern microservices design. The frontend is built in React with an interactive viewfinder reticle and dynamic waterfall charts. The backend runs on FastAPI in Python, handling the OpenCV facial comparison, OCR verification, and EBM model inference. All scores and audit logs are recorded permanently for bank compliance."

---

### Slide 8: Model 1 & 2: DigiLocker & Biometrics
- **Slide Title:** MODEL 1 & 2: DIGILOCKER & BIOMETRICS (Defeating Fake Documents & Stolen OTPs)
- **Key Points on Slide:**
  - **Model 1 (DigiLocker):** Solves fake documents by fetching original digitally-signed records directly from government servers.
  - **Model 2 (Tri-Biometric):** Solves stolen OTP fraud by requiring a live 3-way face match ($\text{Live} \leftrightarrow \text{Aadhaar} \leftrightarrow \text{PAN} \ge 75\%$).
- **What to Say:**
  > "Slide 8 details how we solve the first three problems:
  > To stop fake certificates, Model 1 connects directly to DigiLocker, pulling authentic e-Aadhaar and PAN data with zero human tampering.
  > To stop identity theft from stolen OTPs, Model 2 introduces Tri-Biometric verification. A scammer might steal your OTP, but they cannot steal your face. The camera matches the applicant's live face against both the Aadhaar photo and PAN photo. Both matches must exceed 75% confidence to proceed."

---

### Slide 9: Model 3 & 4: OCR Extraction & Explainable EBM
- **Slide Title:** MODEL 3 & 4: OCR EXTRACTION & EXPLAINABLE EBM (Cross-Checking & Explaining Rejections)
- **Key Points on Slide:**
  - **Model 3 (OCR):** Extracts text and performs fuzzy string matching to catch name discrepancies between documents.
  - **Model 4 (EBM):** A glass-box model where each financial factor's impact is mathematically exact, generating plain-English rejection reasons.
- **What to Say:**
  > "Slide 9 covers document checking and transparent decisions:
  > Model 3 uses OCR to read names and dates across documents, using fuzzy matching to handle initial expansions like 'Jeeva Bharathi M' versus 'M Jeeva Bharathi'.
  > Model 4 is our Explainable Boosting Machine. Unlike black-box models, EBM calculates the exact positive or negative impact of every factor — such as income, existing loans, and CIBIL score. If an applicant is rejected, the system automatically writes plain-English sentences telling them exactly why."

---

### Slide 10: Model 5 & Benchmarking: Random Forest vs EBM
- **Slide Title:** MODEL 5 & BENCHMARKING: RANDOM FOREST VS EBM
- **Key Points on Slide:**
  - Comparison table: Random Forest (100+ trees, 85.37% accuracy, black box) vs EBM (85.37% accuracy, 0.752 AUC, 100% glass box).
  - Takeaway: EBM matches Random Forest's high accuracy while providing complete transparency.
- **What to Say:**
  > "To ensure that making the model explainable does not hurt prediction accuracy, we trained Model 5 — Random Forest — as our benchmark. As shown in the table, EBM ties Random Forest at 85.37% test accuracy and even beats it slightly in AUC score (0.752 vs 0.729). This proves that we achieve state-of-the-art predictive power without sacrificing explainability."

---

### Slide 11: Implementation Status (Phase I)
- **Slide Title:** IMPLEMENTATION STATUS (PHASE I)
- **Key Points on Slide:**
  - Table confirming all 5 models and web applications are fully implemented, tested, and live deployed on GitHub Pages.
- **What to Say:**
  > "All Phase I modules are fully implemented. The DigiLocker service, Tri-Biometric gate, OCR cross-check, EBM scoring engine, and Random Forest benchmark are verified with unit tests. The live prototype is also accessible on GitHub Pages."

---

### Slide 12: Results: Model Comparison on the Test Set
- **Slide Title:** RESULTS: MODEL COMPARISON ON THE TEST SET (Evaluating 5 Machine Learning Models)
- **Key Points on Slide:**
  - Comparison table of 5 models: Logistic Regression (74.80%), Gradient Boosting (80.49%), Hist. Gradient Boosting (82.11%), Random Forest (85.37%), and EBM (85.37%).
- **What to Say:**
  > "We tested five algorithms on the same credit evaluation dataset. Logistic Regression was too simple at 74.80% accuracy. Gradient Boosting improved to 80.49%, and Random Forest reached 85.37%. Our chosen EBM model achieved 85.37% accuracy, 98.82% recall, and the highest AUC of 0.752, outperforming logistic regression by over 10 percentage points."

---

### Slide 13: Results: Live Demo Personas & Fraud Defense
- **Slide Title:** RESULTS: LIVE DEMO PERSONAS & FRAUD DEFENSE
- **Key Points on Slide:**
  - Test Case 1: Genuine Prime Applicant (Jeeva Bharathi M) $\rightarrow$ Instant approval.
  - Test Case 2: Stolen OTP Impostor $\rightarrow$ OTP passes, but blocked at 41.5% face match (Fraud Stopped!).
  - Test Case 3: High-Risk Applicant (Karthik Raman) $\rightarrow$ Declined with exact plain-English reasons (DTI 55.9%, CIBIL 560).
- **What to Say:**
  > "Here we demonstrate three test cases:
  > For a genuine applicant with good credit, the system approves the loan in 45 seconds.
  > In the second case, an impostor enters a stolen OTP, but the webcam detects their face match is only 41.5%, instantly blocking the application.
  > In the third case, applicant Karthik Raman is declined, but instead of a blank rejection, the EBM writes clear reasons: high existing debts taking 55.9% of income and a CIBIL score of 560."

---

### Slide 14: How Our System Solves the 4 Problems
- **Slide Title:** HOW OUR SYSTEM SOLVES THE 4 PROBLEMS (Direct Impact of Our 5 Models)
- **Key Points on Slide:**
  - Problem 1 (Delays): Solved by DigiLocker & OCR (under 60 seconds).
  - Problem 2 (Fake Certificates): Solved by direct government API fetch (zero forged paperwork).
  - Problem 3 (Stolen OTPs): Solved by Tri-Biometric face match (impostors blocked).
  - Problem 4 (Unexplained Rejections): Solved by EBM (clear reasons & improvement advice).
- **What to Say:**
  > "Slide 14 maps our 5 models directly back to our original four problems:
  > 1. Manual delays are eliminated by DigiLocker and OCR, cutting processing from 5 days to 60 seconds.
  > 2. Fake certificates are eliminated because only digitally-signed government documents are accepted.
  > 3. Stolen OTP fraud is eliminated because physical facial presence is mandatory.
  > 4. Unexplained rejections are eliminated because EBM provides transparent, actionable explanations."

---

### Slide 15: Conclusion and Future Scope
- **Slide Title:** CONCLUSION AND FUTURE SCOPE
- **Key Points on Slide:**
  - Conclusion: Successfully built a fast, fraud-proof, and explainable lending platform combining 5 models.
  - Future Scope: Integration with UIDAI Aadhaar FaceRD mobile service, multi-lingual audio explanations (Tamil, Hindi), and Account Aggregator bank statement analysis.
- **What to Say:**
  > "In conclusion, Phase-I successfully delivers an automated, fraud-resistant digital lending platform that solves manual delays, fake certificates, OTP theft, and black-box decisions.
  > For Phase-II, we plan to connect with production UIDAI mobile FaceRD APIs, support regional language voice explanations in Tamil and Hindi, and implement Account Aggregator statement analysis."

---

### Slide 16: Thank You
- **Slide Title:** THANK YOU (Questions, Comments & Suggestions Welcome)
- **Key Points on Slide:**
  - Live Webapp URL: `https://jeevabharathi44.github.io/loan-eligibility-ai/`
  - GitHub Repo URL: `https://github.com/jeevabharathi44/loan-eligibility-ai`
- **What to Say:**
  > "Thank you for your time. The live web application is running and accessible online. We now welcome your questions, comments, and suggestions."

---
