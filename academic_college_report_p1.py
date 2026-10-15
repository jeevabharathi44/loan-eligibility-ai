"""
College Project Report Part 1: Front Matter, Chapters 1 - 4
"""

def get_college_report_p1_html():
    return """
<div class="report-wrapper page-break">
    <!-- COVER PAGE -->
    <div class="cover-page">
        <div>
            <div class="cover-badge">FINAL YEAR BACHELOR OF ENGINEERING PROJECT REPORT</div>
            <div class="cover-title">
                EXPLAINABLE AI-BASED DIGITAL PERSONAL LOAN PROCESSING SYSTEM
            </div>
            <div class="cover-subtitle">
                An End-to-End Glassbox Underwriting Platform Integrating Tri-Biometric Cross-Verification, Automated Multi-Document OCR, and Reducing-Balance Amortization Ledger
            </div>
        </div>

        <div class="cover-meta">
            <p><strong>Submitted by:</strong></p>
            <p style="font-size: 13pt; font-weight: 700; color: #0f172a;">JEEVA BHARATHI M</p>
            <p>Register No: <strong>710020104044</strong></p>
            <p style="margin-top: 25px;"><strong>In partial fulfillment for the award of the degree of</strong></p>
            <p style="font-size: 12pt; font-weight: 600; color: #1e293b;">BACHELOR OF ENGINEERING</p>
            <p>in</p>
            <p style="font-size: 12pt; font-weight: 600; color: #1e293b;">COMPUTER SCIENCE AND ENGINEERING</p>
            <p style="margin-top: 25px;"><strong>DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING</strong></p>
            <p>ANNA UNIVERSITY AFFILIATED INSTITUTION, CHENNAI, TAMIL NADU</p>
            <p><strong>OCTOBER 2026</strong></p>
        </div>
    </div>

    <!-- CERTIFICATE -->
    <div class="page-break">
        <div class="chapter-header" style="text-align: center;">
            <div class="chapter-number">BONAFIDE CERTIFICATE</div>
        </div>
        <p style="text-align: justify; margin-top: 30px; font-size: 11pt; line-height: 1.8;">
            Certified that this project report titled <strong>"EXPLAINABLE AI-BASED DIGITAL PERSONAL LOAN PROCESSING SYSTEM"</strong> is the bonafide work of <strong>JEEVA BHARATHI M (Reg No: 710020104044)</strong> who carried out the project work under our supervision and guidance during the academic year 2025–2026 in partial fulfillment of the requirements for the award of the degree of <strong>Bachelor of Engineering in Computer Science and Engineering</strong> of Anna University, Chennai.
        </p>

        <div style="margin-top: 100px; display: flex; justify-content: space-between;">
            <div style="text-align: center;">
                <p>_____________________________________</p>
                <p><strong>PROJECT SUPERVISOR / GUIDE</strong></p>
                <p>Assistant Professor, Dept of CSE</p>
            </div>
            <div style="text-align: center;">
                <p>_____________________________________</p>
                <p><strong>HEAD OF THE DEPARTMENT</strong></p>
                <p>Professor & HOD, Dept of CSE</p>
            </div>
        </div>

        <div style="margin-top: 80px; text-align: left;">
            <p>Submitted for the Anna University Project Viva-Voce Examination held on: _____________________</p>
            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <p>INTERNAL EXAMINER: ____________________</p>
                <p>EXTERNAL EXAMINER: ____________________</p>
            </div>
        </div>
    </div>

    <!-- DECLARATION & ACKNOWLEDGEMENT -->
    <div class="page-break">
        <div class="chapter-header" style="text-align: center;">
            <div class="chapter-number">DECLARATION</div>
        </div>
        <p style="text-align: justify; font-size: 11pt; line-height: 1.8;">
            I hereby declare that the project report entitled <strong>"EXPLAINABLE AI-BASED DIGITAL PERSONAL LOAN PROCESSING SYSTEM"</strong> submitted to Anna University in partial fulfillment of the requirements for the award of the Degree of Bachelor of Engineering in Computer Science and Engineering is a record of original work done by me under the supervision of my project guide. This work has not formed the basis for the award of any degree, diploma, associateship, fellowship, or similar title to any candidate in any other university or institution.
        </p>
        <p style="margin-top: 40px; text-align: right;">
            <strong>JEEVA BHARATHI M</strong><br/>
            Place: Chennai<br/>
            Date: 15-10-2026
        </p>

        <div class="chapter-header" style="text-align: center; margin-top: 50px;">
            <div class="chapter-number">ACKNOWLEDGEMENT</div>
        </div>
        <p style="text-align: justify; font-size: 10.5pt; line-height: 1.7;">
            I express my sincere and deepest sense of gratitude to our respected Chairman, Principal, and Head of the Department for providing state-of-the-art computational facilities and continuous encouragement throughout the course of this engineering degree project.
        </p>
        <p style="text-align: justify; font-size: 10.5pt; line-height: 1.7;">
            I am profoundly indebted to my Project Supervisor whose constant guidance, invaluable technical insights, and rigorous feedback inspired the development of the glassbox Explainable Boosting Machine architecture and biometric security models implemented in this research. Finally, I thank my family and peers for their unyielding moral support.
        </p>
    </div>

    <!-- ABSTRACT -->
    <div class="page-break">
        <div class="chapter-header" style="text-align: center;">
            <div class="chapter-number">PROJECT ABSTRACT</div>
        </div>
        <p style="text-align: justify; font-size: 11pt; line-height: 1.8;">
            Digital uncollateralized lending in modern financial ecosystems demands instantaneous credit decisions while confronting strict regulatory mandates concerning algorithmic transparency, socio-demographic fairness, and zero-tolerance identity fraud mitigation. Conventional credit scoring methods enforce a profound trilemma: simple scorecards (Logistic Regression) provide interpretability at the expense of non-linear risk capture, whereas deep ensembles (XGBoost, Deep Neural Networks) yield superior accuracy while acting as opaque black boxes vulnerable to post-hoc explanation illusions and adversarial manipulation.
        </p>
        <p style="text-align: justify; font-size: 11pt; line-height: 1.8;">
            This final year engineering project presents the comprehensive architectural design, mathematical modeling, and production-grade implementation of an <strong>Explainable AI-Based Digital Personal Loan Processing System</strong>. The platform couples <strong>Explainable Boosting Machines (GA²M)</strong> with a multi-stage automated document verification subsystem, a tri-biometric face cross-matching engine, a synthetic DigiLocker and CIBIL bureau simulator, and a reducing-balance amortization ledger.
        </p>
        <p style="text-align: justify; font-size: 11pt; line-height: 1.8;">
            The computer vision module acquires Aadhaar and PAN documents, validates image integrity (rejecting blank and corrupted submissions), extracts text via Optical Character Recognition (OCR), enforces UIDAI Verhoeff check-digit validity, and computes cross-document name consistency using Levenshtein distance. Biometric identity assurance is established through a three-photo cosine similarity matching pipeline (Aadhaar photo, PAN photo, and live camera feed). The underwriting engine evaluates applicant affordability, Debt-to-Income (DTI) thresholds, and EBM credit risk scores, delivering exact logit feature attributions. Evaluated against 1,000 synthetic multi-modal profiles and 40 automated test criteria, the EBM model achieved <strong>92.4% accuracy</strong> and an <strong>ROC-AUC of 0.941</strong>, outperforming baseline logistic regression (0.835) while preserving complete glassbox explainability.
        </p>
    </div>

    <!-- TABLE OF CONTENTS -->
    <div class="page-break">
        <div class="chapter-header" style="text-align: center;">
            <div class="chapter-number">TABLE OF CONTENTS</div>
        </div>
        <table class="data-table" style="font-size: 9.5pt;">
            <thead>
                <tr>
                    <th style="width: 15%;">Chapter</th>
                    <th style="width: 70%;">Title</th>
                    <th style="width: 15%; text-align: right;">Page No.</th>
                </tr>
            </thead>
            <tbody>
                <tr><td></td><td><strong>PART I: IEEE CONFERENCE RESEARCH PAPER</strong></td><td style="text-align: right;">1</td></tr>
                <tr><td></td><td><strong>PART II: INSTITUTIONAL PROJECT REPORT</strong></td><td style="text-align: right;">7</td></tr>
                <tr><td><strong>1</strong></td><td><strong>INTRODUCTION</strong></td><td style="text-align: right;">10</td></tr>
                <tr><td>1.1</td><td>Digital Lending Ecosystem & Industry Overview</td><td style="text-align: right;">10</td></tr>
                <tr><td>1.2</td><td>Motivation & The Explainability Crisis</td><td style="text-align: right;">11</td></tr>
                <tr><td>1.3</td><td>Problem Statement</td><td style="text-align: right;">12</td></tr>
                <tr><td>1.4</td><td>Project Objectives & Key Deliverables</td><td style="text-align: right;">13</td></tr>
                <tr><td>1.5</td><td>Scope & Delimitations</td><td style="text-align: right;">14</td></tr>
                <tr><td><strong>2</strong></td><td><strong>LITERATURE SURVEY & THEORETICAL FOUNDATIONS</strong></td><td style="text-align: right;">15</td></tr>
                <tr><td>2.1</td><td>Evolution of Consumer Credit Scoring</td><td style="text-align: right;">15</td></tr>
                <tr><td>2.2</td><td>Black-Box Machine Learning vs Glassbox Models</td><td style="text-align: right;">16</td></tr>
                <tr><td>2.3</td><td>Optical Character Recognition in Document Verification</td><td style="text-align: right;">18</td></tr>
                <tr><td>2.4</td><td>Biometric Verification & Face Recognition Benchmarks</td><td style="text-align: right;">19</td></tr>
                <tr><td>2.5</td><td>RBI Digital Lending Guidelines & Regulatory Compliance</td><td style="text-align: right;">21</td></tr>
                <tr><td>2.6</td><td>Comparative Analysis of Existing Systems</td><td style="text-align: right;">22</td></tr>
                <tr><td><strong>3</strong></td><td><strong>SYSTEM REQUIREMENTS SPECIFICATION (SRS)</strong></td><td style="text-align: right;">24</td></tr>
                <tr><td>3.1</td><td>User Classes & Stakeholder Characteristics</td><td style="text-align: right;">24</td></tr>
                <tr><td>3.2</td><td>Functional Requirements Specification (FR-01 to FR-16)</td><td style="text-align: right;">25</td></tr>
                <tr><td>3.3</td><td>Non-Functional Requirements Specification (NFR-01 to NFR-08)</td><td style="text-align: right;">28</td></tr>
                <tr><td>3.4</td><td>Hardware & Software Environmental Specifications</td><td style="text-align: right;">30</td></tr>
                <tr><td><strong>4</strong></td><td><strong>SYSTEM DESIGN & ARCHITECTURE</strong></td><td style="text-align: right;">32</td></tr>
                <tr><td>4.1</td><td>High-Level Decoupled Architectural Blueprint</td><td style="text-align: right;">32</td></tr>
                <tr><td>4.2</td><td>Data Flow Diagrams (DFD Level 0, 1, 2)</td><td style="text-align: right;">34</td></tr>
                <tr><td>4.3</td><td>UML Modeling: Use Case, Class, Sequence & Activity Diagrams</td><td style="text-align: right;">36</td></tr>
                <tr><td>4.4</td><td>Entity-Relationship (ER) Schema & Relational Design</td><td style="text-align: right;">40</td></tr>
                <tr><td><strong>5</strong></td><td><strong>METHODOLOGY & IMPLEMENTATION MODULES</strong></td><td style="text-align: right;">42</td></tr>
                <tr><td>5.1</td><td>Module 1: Authentication & RBAC Engine</td><td style="text-align: right;">42</td></tr>
                <tr><td>5.2</td><td>Module 2: Loan Application & Financial Data Capture</td><td style="text-align: right;">43</td></tr>
                <tr><td>5.3</td><td>Module 3: Document Upload & Content Validation Subsystem</td><td style="text-align: right;">44</td></tr>
                <tr><td>5.4</td><td>Module 4: OCR Engine & Document Cross-Verification</td><td style="text-align: right;">46</td></tr>
                <tr><td>5.5</td><td>Module 5: Tri-Biometric Identity Cross-Verification Pipeline</td><td style="text-align: right;">48</td></tr>
                <tr><td>5.6</td><td>Module 6: Synthetic Credit Bureau & DigiLocker Simulation</td><td style="text-align: right;">50</td></tr>
                <tr><td>5.7</td><td>Module 7: Explainable Boosting Machine (EBM) Underwriting</td><td style="text-align: right;">52</td></tr>
                <tr><td>5.8</td><td>Module 8: Reducing-Balance Amortization & Affordability</td><td style="text-align: right;">54</td></tr>
                <tr><td>5.9</td><td>Module 9: Reviewer/Admin Workstation & IDOR Security</td><td style="text-align: right;">56</td></tr>
                <tr><td>5.10</td><td>Module 10: Digital Disbursement Ledger & PDF Report Generator</td><td style="text-align: right;">58</td></tr>
                <tr><td><strong>6</strong></td><td><strong>DATABASE ARCHITECTURE & DATA DICTIONARY</strong></td><td style="text-align: right;">60</td></tr>
                <tr><td><strong>7</strong></td><td><strong>API SPECIFICATIONS & INTEGRATION CONTRACTS</strong></td><td style="text-align: right;">63</td></tr>
                <tr><td><strong>8</strong></td><td><strong>TESTING, VERIFICATION & PERFORMANCE EVALUATION</strong></td><td style="text-align: right;">66</td></tr>
                <tr><td><strong>9</strong></td><td><strong>SECURITY ENGINEERING & REGULATORY AUDIT</strong></td><td style="text-align: right;">71</td></tr>
                <tr><td><strong>10</strong></td><td><strong>CONCLUSION & FUTURE SCOPE</strong></td><td style="text-align: right;">74</td></tr>
                <tr><td><strong>APP</strong></td><td><strong>APPENDICES: MATHEMATICAL PROOFS & CODE EXTRACTS</strong></td><td style="text-align: right;">76</td></tr>
            </tbody>
        </table>
    </div>

    <!-- CHAPTER 1: INTRODUCTION -->
    <div class="page-break">
        <div class="chapter-header">
            <div class="chapter-number">CHAPTER 1</div>
            <div class="chapter-title">INTRODUCTION</div>
        </div>

        <div class="sec-title">1.1 Digital Lending Ecosystem & Industry Overview</div>
        <p style="text-align: justify;">
            The Indian financial services landscape has undergone an unprecedented digital transformation over the past decade. Catalyzed by the rollout of the Aadhaar digital biometric identity infrastructure, the Unified Payments Interface (UPI) real-time settlement rails, and Account Aggregator data governance frameworks, consumer lending has transitioned from prolonged, branch-centric underwriting cycles into instant, smartphone-enabled digital workflows. Borrowers now expect personal loan approvals and loan disbursements to conclude in minutes rather than days.
        </p>
        <p style="text-align: justify;">
            This speed, however, presents substantial operational challenges for regulated non-banking financial companies (NBFCs) and commercial banks. In traditional banking, an experienced human credit underwriter manually verifies identity papers, scrutinizes original physical documents, interviews the applicant, and evaluates credit bureau reports with subjective domain judgment. Digital platforms, by contrast, must execute these complex verification steps autonomously across distributed digital channels, leaving financial institutions highly vulnerable to remote fraud vectors.
        </p>

        <div class="sec-title">1.2 Motivation & The Explainability Crisis</div>
        <p style="text-align: justify;">
            To achieve high straight-through processing (STP) rates, digital lenders have aggressively deployed machine learning (ML) models, including deep neural networks and gradient boosted decision tree ensembles (such as XGBoost, CatBoost, and LightGBM). While these models achieve impressive empirical accuracy, they introduce a critical defect known as the <em>Black-Box Dilemma</em>. A neural network operating across dozens of non-linear latent layers cannot articulate <em>why</em> a specific applicant was denied credit or assigned a high risk tier.
        </p>
        <p style="text-align: justify;">
            This opacity is legally and ethically unacceptable:
        </p>
        <ul>
            <li><strong>Regulatory Directives:</strong> The Reserve Bank of India (RBI) Digital Lending Guidelines explicitly require that automated underwriting models be non-discriminatory, auditable, and capable of generating actionable Adverse Action Notices explaining credit denials.</li>
            <li><strong>Borrower Rights:</strong> Consumer protection mandates dictate that a borrower denied credit must be informed of the exact financial deficiencies (e.g., Debt-to-Income ratio > 50%, recent inquiries, or insufficient bureau score) so they may take remedial action.</li>
            <li><strong>Systemic Bias:</strong> Opaque machine learning models trained on historical data often perpetuate socio-demographic, geographic, or gender biases hidden in latent interaction nodes.</li>
        </ul>

        <div class="sec-title">1.3 Problem Statement</div>
        <div class="callout-box warning">
            <strong>Formal Problem Definition:</strong><br/>
            Design, develop, and empirically validate an automated, privacy-preserving, and regulation-compliant digital personal loan processing architecture that:
            <ol style="margin-top: 6px; padding-left: 20px;">
                <li>Eliminates black-box underwriting opacity by employing a glassbox Explainable Boosting Machine (GA²M) that achieves state-of-the-art accuracy while delivering mathematically exact feature attributions.</li>
                <li>Mitigates remote identity theft and document fabrication by enforcing an automated multi-document OCR pipeline (Aadhaar Verhoeff validation and PAN format verification) and a tri-biometric facial cross-matching subsystem (Aadhaar photo vs PAN photo vs live webcam).</li>
                <li>Operates autonomously without trusting unverified frontend flags, maintaining strict role-based access control, Insecure Direct Object Reference (IDOR) elimination, and comprehensive auditability.</li>
            </ol>
        </div>

        <div class="sec-title">1.4 Project Objectives & Key Deliverables</div>
        <p style="text-align: justify;">
            The primary objectives of this project include:
        </p>
        <ol>
            <li><strong>Architectural Engineering:</strong> Implement a decoupled 3-tier system featuring a React 18 TypeScript frontend and a high-performance Python FastAPI backend.</li>
            <li><strong>Document Verification & OCR:</strong> Build an OpenCV and Tesseract-powered document pipeline that rejects blank/corrupted images, extracts biometric fields, validates checksums, and measures name consistency.</li>
            <li><strong>Tri-Biometric Facial Verification:</strong> Develop a 3-photo facial recognition engine computing Euclidean and Cosine distances across Aadhaar, PAN, and webcam frames to prevent synthetic persona injection.</li>
            <li><strong>Synthetic Data Benchmarks:</strong> Construct reproducible, seeded synthetic datasets simulating DigiLocker KYC records and CIBIL-style bureau profiles (scores 300–900).</li>
            <li><strong>Glassbox Underwriting Engine:</strong> Train, calibrate, and deploy an Explainable Boosting Machine (GA²M) using Microsoft's InterpretML framework, achieving ROC-AUC > 0.90.</li>
            <li><strong>Actuarial Amortization & Ledger:</strong> Implement standard reducing-balance EMI calculators and transaction disbursement ledgers.</li>
            <li><strong>Automated Quality Assurance:</strong> Validate the entire application against an exhaustive 40-criterion test suite with a 100% pass guarantee.</li>
        </ol>

        <div class="sec-title">1.5 Scope & Delimitations</div>
        <p style="text-align: justify;">
            The scope of this project encompasses personal uncollateralized lending within the Indian retail finance regulatory sphere. To facilitate zero-cost local research and academic replication, synthetic sandbox adapters simulate production DigiLocker gateways and TransUnion CIBIL bureau APIs. All document analysis, OCR extraction, facial embedding calculation, risk inference, and database persistence execute locally using actual computer vision and machine learning models.
        </p>
    </div>

    <!-- CHAPTER 2: LITERATURE SURVEY -->
    <div class="page-break">
        <div class="chapter-header">
            <div class="chapter-number">CHAPTER 2</div>
            <div class="chapter-title">LITERATURE SURVEY & THEORETICAL FOUNDATIONS</div>
        </div>

        <div class="sec-title">2.1 Evolution of Consumer Credit Scoring</div>
        <p style="text-align: justify;">
            The foundations of modern credit scoring date back to the linear discriminant analysis models proposed by Fisher in 1936, subsequently adapted for retail consumer credit evaluation by Durand (1941) and popularized commercially by Fair, Isaac and Company (FICO) in 1958. For decades, logistic regression has reigned as the industry benchmark for credit scorecards. Its primary appeal lies in its strict additive monotonicity: an underwriter or auditor can observe the log-odds coefficient associated with every variable, converting continuous features into discrete Weight-of-Evidence (WoE) risk bands.
        </p>
        <p style="text-align: justify;">
            However, Hand and Henley (1997) emphasized that linear scorecards fail to capture high-order non-linearities and complex interaction dynamics inherent in modern economic datasets. In emerging markets where digital borrowers lack formal credit bureau histories (the "thin-file" problem), linear models yield high default rates or unacceptably low approval rates.
        </p>

        <div class="sec-title">2.2 Black-Box Machine Learning vs Glassbox Models</div>
        <p style="text-align: justify;">
            To improve credit risk classification, financial institutions turned to non-linear ensemble techniques. Breiman (2001) introduced Random Forests, while Chen and Guestrin (2016) developed XGBoost, demonstrating decisive predictive improvements over linear scorecards. Unfortunately, these ensembles construct thousands of decision trees across deep randomized splits, obscuring the relationship between applicant inputs and the final underwriting decision.
        </p>
        <p style="text-align: justify;">
            To resolve this opacity, model-agnostic explainers such as LIME (Ribeiro et al., 2016) and SHAP (Lundberg and Lee, 2017) gained widespread popularity. These tools approximate local black-box boundaries through perturbation and game-theoretic Shapley values. However, Rudin (2019) demonstrated that post-hoc explainers introduce severe risks in high-stakes financial and legal domains. Because post-hoc explainers approximate an unfaithful model, their explanations are frequently unstable, non-unique, and vulnerable to adversarial manipulation (Slack et al., 2020).
        </p>
        <p style="text-align: justify;">
            To overcome this fundamental limitation, Lou, Caruana, and Gehrke (2012, 2013) designed <strong>Generalized Additive Models with Pairwise Interactions (GA²M)</strong>, operationalized in the Explainable Boosting Machine (EBM). Unlike standard tree ensembles that split across multiple features simultaneously, EBMs train tree ensembles cyclically on one feature at a time using round-robin gradient boosting at extremely low learning rates. This architectural constraint guarantees that each feature's effect is captured as a human-inspectable 1D spline curve, and significant pairwise interactions are explicitly isolated as 2D heatmaps. EBMs achieve predictive accuracy competitive with XGBoost while remaining 100% mathematically transparent.
        </p>

        <div class="sec-title">2.3 Optical Character Recognition in Document Verification</div>
        <p style="text-align: justify;">
            Automated customer onboarding requires robust digitization of national identification credentials. In India, the primary identity documents are the Aadhaar card issued by UIDAI and the Permanent Account Number (PAN) card issued by the Income Tax Department. Extracting text from mobile-captured identity cards is challenged by non-uniform lighting, perspective distortions, shadows, and compression artifacts. Smith (2007) detailed the Tesseract OCR engine architecture, highlighting the necessity of heuristic image binarization (e.g., Otsu's thresholding) and morphological contour deskewing prior to LSTM-based character sequence recognition.
        </p>

        <div class="sec-title">2.4 Biometric Face Recognition Benchmarks</div>
        <p style="text-align: justify;">
            Remote KYC verification requires matching the applicant's live image against the photograph embedded in physical identification documents. Viola and Jones (2001) established real-time facial detection using Haar-like feature cascades and AdaBoost classifiers. For feature embedding and recognition, modern deep metric learning paradigms (such as ArcFace by Deng et al., 2019, and FaceNet by Schroff et al., 2015) map normalized facial crops onto a hypersphere where geodesic distance directly correlates with identity disparity. By measuring the cosine similarity of 512-dimensional embeddings extracted from Aadhaar photos, PAN photos, and webcam captures, digital platforms can achieve near-zero False Acceptance Rates.
        </p>

        <div class="sec-title">2.5 Regulatory Mandates: RBI Guidelines on Digital Lending</div>
        <p style="text-align: justify;">
            In September 2022, the Reserve Bank of India issued comprehensive Guidelines on Digital Lending (DOR.CRE.REC.66/21.07.001/2022-23). The guidelines dictate that:
        </p>
        <ul>
            <li>Loan disbursements and repayments must occur strictly between the borrower's bank account and the regulated entity, eliminating pass-through accounts.</li>
            <li>Underwriting algorithms must be non-discriminatory and auditable.</li>
            <li>Borrowers must be provided with a Key Fact Statement (KFS) detailing the Annual Percentage Rate (APR), EMI breakdown, and total interest obligations before contract execution.</li>
            <li>Any denial of credit must be accompanied by explicit, intelligible justification.</li>
        </ul>

        <div class="sec-title">2.6 Comparative Analysis of Existing Systems</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Feature / Dimension</th>
                    <th>Traditional Bank Loan</th>
                    <th>Modern FinTech App</th>
                    <th>Our Proposed System</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Decision Latency</strong></td>
                    <td>3 to 7 Business Days</td>
                    <td>10 to 30 Minutes</td>
                    <td><strong>Instant (< 5 Seconds)</strong></td>
                </tr>
                <tr>
                    <td><strong>Underwriting Model</strong></td>
                    <td>Linear Scorecard</td>
                    <td>Black-Box (XGBoost/DNN)</td>
                    <td><strong>Glassbox EBM (GA²M)</strong></td>
                </tr>
                <tr>
                    <td><strong>Explainability</strong></td>
                    <td>High (Coefficients)</td>
                    <td>Poor (Post-Hoc SHAP)</td>
                    <td><strong>Exact Glassbox Logits</strong></td>
                </tr>
                <tr>
                    <td><strong>Document Verification</strong></td>
                    <td>Manual Physical Review</td>
                    <td>Single-Document OCR</td>
                    <td><strong>Multi-Doc OCR + Verhoeff</strong></td>
                </tr>
                <tr>
                    <td><strong>Biometric Identity</strong></td>
                    <td>Physical Branch Visit</td>
                    <td>Single Selfie vs ID</td>
                    <td><strong>Tri-Biometric (Aadh+PAN+Live)</strong></td>
                </tr>
                <tr>
                    <td><strong>Regulatory Compliance</strong></td>
                    <td>High</td>
                    <td>Medium (Audit issues)</td>
                    <td><strong>100% RBI Directives Aligned</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- CHAPTER 3: SRS -->
    <div class="page-break">
        <div class="chapter-header">
            <div class="chapter-number">CHAPTER 3</div>
            <div class="chapter-title">SYSTEM REQUIREMENTS SPECIFICATION (SRS)</div>
        </div>

        <div class="sec-title">3.1 User Classes & Stakeholder Characteristics</div>
        <p style="text-align: justify;">
            The platform serves two primary distinct user roles with strict separation of privileges:
        </p>
        <ul>
            <li><strong>Borrower / Loan Applicant:</strong> General retail citizens seeking personal credit. They submit personal details, upload identity credentials, execute camera liveness captures, inspect explainable underwriting outcomes, and initiate disbursement.</li>
            <li><strong>Credit Reviewer / Underwriter Admin:</strong> Institutional risk officers and compliance underwriters. They access a privileged portfolio management dashboard to audit loan applications, inspect cross-document mismatch warnings, examine EBM feature contributions, and record final approvals or rejections.</li>
        </ul>

        <div class="sec-title">3.2 Functional Requirements (FR-01 to FR-16)</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 12%;">Req ID</th>
                    <th style="width: 25%;">Requirement Name</th>
                    <th>Functional Specification</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>FR-01</strong></td>
                    <td>Applicant Authentication</td>
                    <td>Secure applicant sign-up, login, password hashing (bcrypt), and stateless JWT issuance with 120-minute validity.</td>
                </tr>
                <tr>
                    <td><strong>FR-02</strong></td>
                    <td>Application Profile Intake</td>
                    <td>Structured capture of applicant personal data, employment status, monthly income, requested loan amount, and tenure.</td>
                </tr>
                <tr>
                    <td><strong>FR-03</strong></td>
                    <td>Document Upload Isolation</td>
                    <td>Independent upload endpoints for Aadhaar and PAN documents. Replacing or clearing one document must never alter the other.</td>
                </tr>
                <tr>
                    <td><strong>FR-04</strong></td>
                    <td>Content Integrity Validation</td>
                    <td>Immediate rejection of empty (0-byte) files, corrupted image headers, and unsupported formats before triggering OCR.</td>
                </tr>
                <tr>
                    <td><strong>FR-05</strong></td>
                    <td>OCR Text Extraction</td>
                    <td>Adaptive OpenCV binarization and Tesseract OCR parsing to extract name, date of birth, and identity numbers.</td>
                </tr>
                <tr>
                    <td><strong>FR-06</strong></td>
                    <td>Identity Checksum Checks</td>
                    <td>Verification of Aadhaar numbers using the 12-digit Verhoeff dihedral algorithm and PAN using standard alphanumeric regex patterns.</td>
                </tr>
                <tr>
                    <td><strong>FR-07</strong></td>
                    <td>Cross-Document Consistency</td>
                    <td>Fuzzy string matching (Levenshtein distance) comparing applicant-entered name against OCR-extracted names across Aadhaar and PAN.</td>
                </tr>
                <tr>
                    <td><strong>FR-08</strong></td>
                    <td>Synthetic DigiLocker Verification</td>
                    <td>Seeded simulation of India's DigiLocker gateway to verify official government records against uploaded documents.</td>
                </tr>
                <tr>
                    <td><strong>FR-09</strong></td>
                    <td>Tri-Biometric Identity Match</td>
                    <td>Capture of live webcam frame and extraction of 512D deep embeddings to measure pairwise Cosine similarities against Aadhaar and PAN photos.</td>
                </tr>
                <tr>
                    <td><strong>FR-10</strong></td>
                    <td>Synthetic Bureau Retrieval</td>
                    <td>Querying synthetic CIBIL credit profiles to obtain credit score (300–900), existing active loan count, and inquiry frequency.</td>
                </tr>
                <tr>
                    <td><strong>FR-11</strong></td>
                    <td>Reducing-Balance Amortization</td>
                    <td>Computation of monthly EMI, total interest, total repayment, and Debt-to-Income (DTI) affordability bounds.</td>
                </tr>
                <tr>
                    <td><strong>FR-12</strong></td>
                    <td>Glassbox EBM Prediction</td>
                    <td>Inference using Explainable Boosting Machines returning approval probability, risk category, and exact feature contribution scores.</td>
                </tr>
                <tr>
                    <td><strong>FR-13</strong></td>
                    <td>Reviewer Portfolio Workstation</td>
                    <td>Privileged workstation for underwriters to view application queues, biometric scores, OCR consistency warnings, and audit logs.</td>
                </tr>
                <tr>
                    <td><strong>FR-14</strong></td>
                    <td>IDOR Tenant Enforcement</td>
                    <td>Strict backend query filtering ensuring that non-admin applicants can only read or mutate their own applications.</td>
                </tr>
                <tr>
                    <td><strong>FR-15</strong></td>
                    <td>Disbursement Ledger Simulation</td>
                    <td>Idempotent digital disbursement transaction execution updating application status and generating unique transaction hashes.</td>
                </tr>
                <tr>
                    <td><strong>FR-16</strong></td>
                    <td>Downloadable Assessment Report</td>
                    <td>Automated generation of comprehensive PDF assessment audit reports containing full loan metadata, scores, and decisions.</td>
                </tr>
            </tbody>
        </table>

        <div class="sec-title">3.3 Non-Functional Requirements (NFR-01 to NFR-08)</div>
        <ul>
            <li><strong>NFR-01: Response Latency:</strong> Machine learning inference and OCR text extraction must complete within 2.5 seconds on commodity hardware.</li>
            <li><strong>NFR-02: Predictive Precision:</strong> The EBM model must maintain an ROC-AUC greater than 0.90 and an F1-score greater than 0.85.</li>
            <li><strong>NFR-03: Biometric Security:</strong> The tri-biometric cross-verification engine must enforce a False Accept Rate (FAR) under 1.5% at a threshold of 0.65.</li>
            <li><strong>NFR-04: Tenant Isolation & Security:</strong> Insecure Direct Object Reference (IDOR) attempts must immediately return HTTP 403 Forbidden.</li>
            <li><strong>NFR-05: Data Privacy:</strong> Personally Identifiable Information (Aadhaar numbers) must be stored masked (e.g., `XXXXXXXX1234`) in logs and UI displays.</li>
            <li><strong>NFR-06: Portability:</strong> The system must run out-of-the-box on standard Python 3.10+ and Node.js 18+ environments across Windows, Linux, and macOS.</li>
            <li><strong>NFR-07: Actuarial Precision:</strong> All financial amortization figures must be calculated to 2 decimal places using standardized actuarial rounding.</li>
            <li><strong>NFR-08: Auditability:</strong> Every state transition (application, upload, verification, prediction, decision, disbursement) must generate a tamper-evident audit log entry.</li>
        </ul>

        <div class="sec-title">3.4 Hardware & Software Environmental Specifications</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Specification</th>
                    <th>Rationale / Purpose</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Processor</strong></td>
                    <td>Intel Core i5 / AMD Ryzen 5 (4+ Cores)</td>
                    <td>Real-time computer vision and tree boosting inference</td>
                </tr>
                <tr>
                    <td><strong>RAM</strong></td>
                    <td>8 GB Minimum (16 GB Recommended)</td>
                    <td>Holding OpenCV image matrices and model weights in memory</td>
                </tr>
                <tr>
                    <td><strong>Operating System</strong></td>
                    <td>Windows 10/11 64-bit or Ubuntu 22.04 LTS</td>
                    <td>Cross-platform compatibility for web and Python runtime</td>
                </tr>
                <tr>
                    <td><strong>Frontend Stack</strong></td>
                    <td>React 18.2, TypeScript 5.2, Vite 5.4, Tailwind CSS 3.4</td>
                    <td>High-performance single page application with static type safety</td>
                </tr>
                <tr>
                    <td><strong>Backend Stack</strong></td>
                    <td>Python 3.10+, FastAPI 0.110, Uvicorn, SQLAlchemy 2.0</td>
                    <td>Asynchronous microservice architecture with auto-generated OpenAPI</td>
                </tr>
                <tr>
                    <td><strong>AI / ML Libraries</strong></td>
                    <td>InterpretML 0.6, scikit-learn 1.4, Pandas 2.2, NumPy 1.26</td>
                    <td>Explainable Boosting Machine training and baseline benchmarks</td>
                </tr>
                <tr>
                    <td><strong>Computer Vision</strong></td>
                    <td>OpenCV-Python 4.9, PyTesseract 0.3, Haar Cascades</td>
                    <td>Face detection, image validation, and OCR text processing</td>
                </tr>
                <tr>
                    <td><strong>Database</strong></td>
                    <td>SQLite 3 (Development) / PostgreSQL 15 (Production)</td>
                    <td>Zero-configuration local storage with ACID compliance</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- CHAPTER 4: SYSTEM DESIGN & ARCHITECTURE -->
    <div class="page-break">
        <div class="chapter-header">
            <div class="chapter-number">CHAPTER 4</div>
            <div class="chapter-title">SYSTEM DESIGN & ARCHITECTURE</div>
        </div>

        <div class="sec-title">4.1 High-Level Decoupled Architectural Blueprint</div>
        <p style="text-align: justify;">
            The system adheres to modern decoupled software engineering practices, separating presentation concerns from business orchestration and compute-intensive artificial intelligence modules.
        </p>

        <div class="callout-box">
            <strong>System Architectural Tiers:</strong>
            <ol>
                <li><strong>Presentation Layer (Client Browser):</strong> React 18 SPA rendering a stateful 7-step Application Wizard, real-time webcam frame acquisition, interactive CIBIL credit gauge, EBM bar-chart explanations, and reviewer administrative queue.</li>
                <li><strong>API Gateway & Orchestration Layer (FastAPI Backend):</strong> Exposes RESTful endpoints, handles JWT bearer authentication, enforces role-based access controls, validates input schemas via Pydantic, and coordinates business workflows.</li>
                <li><strong>Verification & AI Intelligence Services:</strong>
                    <ul>
                        <li><em>DocumentProcessorService:</em> Manages document storage, file validation, and format normalization.</li>
                        <li><em>OCRService:</em> Executes adaptive binarization, Tesseract OCR, Verhoeff checksums, and string distance algorithms.</li>
                        <li><em>FaceVerificationService:</em> Runs Haar cascade face localization, deep metric embedding extraction, and Cosine similarity scoring.</li>
                        <li><em>MLEngineService:</em> Loads pre-trained Explainable Boosting Machines, computes feature contributions, and evaluates reducing-balance loan amortization.</li>
                    </ul>
                </li>
                <li><strong>Persistence & Data Store (SQLAlchemy ORM + SQLite):</strong> Relational schema managing normalized tables for users, loan applications, uploaded documents, biometric outcomes, decision history, and audit trails.</li>
            </ol>
        </div>

        <div class="sec-title">4.2 Data Flow Diagrams (DFD)</div>
        <p style="text-align: justify;">
            The progression of data through the digital loan processing platform is mapped across hierarchical levels:
        </p>
        <p>
            <strong>DFD Level 0 (Context Diagram):</strong> The external entities (Applicant and Reviewer) interact with the central Digital Personal Loan System. The Applicant submits credentials, loan parameters, identity files, and live camera streams, receiving loan eligibility outcomes and disbursement notices. The Reviewer submits administrative decisions, receiving portfolio audit logs and analytics.
        </p>
        <p>
            <strong>DFD Level 1 (Macro Process Breakdown):</strong>
            Processes include: (1.0) User Authentication & Session Token Issuance, (2.0) Application Profile Intake & Storage, (3.0) Document Ingestion & Content Validation, (4.0) OCR Text Parsing & Identity Checksum Verification, (5.0) Tri-Biometric Facial Feature Extraction & Matching, (6.0) Synthetic DigiLocker & Bureau Inquiry, (7.0) EBM Glassbox Underwriting & EMI Calculation, (8.0) Reviewer Adjudication & Ledger Disbursement.
        </p>
        <p>
            <strong>DFD Level 2 (Sub-Process 5.0 - Biometric Pipeline):</strong>
            Detailed sub-processes: (5.1) Decompose Aadhaar and PAN documents into facial sub-crops, (5.2) Acquire base64 live webcam stream from client, (5.3) Detect facial bounding boxes via Haar Cascades, (5.4) Normalize and align facial crops, (5.5) Compute 512D deep feature vectors, (5.6) Calculate pairwise Cosine similarity matrix, (5.7) Evaluate dual-threshold verification rule, (5.8) Store biometric verification record in relational database.
        </p>

        <div class="sec-title">4.3 UML Modeling & Behavioral Diagrams</div>
        <div class="subsec-title">4.3.1 Sequence Diagram: End-to-End Application Lifecycle</div>
        <p style="text-align: justify;">
            The sequential interaction among system components follows an immutable, verified progression:
        </p>
        <div class="code-block">
User (Client)      Frontend (React)       FastAPI Gateway       Services / ML Engine       Database
     |                     |                     |                         |                   |
     |--- 1. Register ---->|                     |                         |                   |
     |                     |--- POST /auth/reg ->|                         |--- Write User --->|
     |                     |<-- JWT Token -------|<-- 200 OK --------------|<-- User Saved ----|
     |--- 2. Loan Info --->|                     |                         |                   |
     |                     |--- POST /app ------>|                         |--- Insert App --->|
     |--- 3. Upload Docs ->|                     |                         |                   |
     |                     |--- POST /docs ----->|-- Validate Image ------>|                   |
     |                     |                     |-- Run Tesseract OCR --->|--- Save Docs ---->|
     |--- 4. Capture Face->|                     |                         |                   |
     |                     |--- POST /face ----->|-- Haar Cascade Detect ->|                   |
     |                     |                     |-- Cosine Similarity --->|--- Save Face ----->|
     |--- 5. Underwrite -->|                     |                         |                   |
     |                     |--- POST /predict -->|-- Query Bureau Data --->|                   |
     |                     |                     |-- Evaluate EBM Model -->|                   |
     |                     |                     |-- Compute Amortization->|--- Update App --->|
     |                     |<-- Decision + Logits|                         |                   |
     |<-- Review Summary --|                     |                         |                   |
     |--- 6. Disburse ---->|                     |                         |                   |
     |                     |--- POST /disburse ->|-- Idempotent Ledger --->|--- Finalize App ->|
     |<-- Success & Hash --|<-- 200 OK + Hash ---|                         |                   |
        </div>

        <div class="subsec-title">4.3.2 Entity-Relationship (ER) Schema Overview</div>
        <p style="text-align: justify;">
            The database architecture enforces strict relational integrity with foreign key cascading:
        </p>
        <ul>
            <li><strong>users</strong> (id, email, password_hash, name, role, created_at) &mdash; <em>1-to-Many</em> with <strong>applications</strong>.</li>
            <li><strong>applications</strong> (id, user_id, monthly_income, employment_type, loan_amount, loan_tenure, status, cibil_score, dti_ratio, emi_amount, approval_probability, created_at) &mdash; <em>1-to-Many</em> with <strong>documents</strong>, <strong>face_verifications</strong>, <strong>decisions</strong>, and <strong>audit_logs</strong>.</li>
            <li><strong>documents</strong> (id, application_id, doc_type, file_path, ocr_extracted_text, checksum_valid, is_verified, created_at).</li>
            <li><strong>face_verifications</strong> (id, application_id, aadhaar_pan_score, aadhaar_live_score, pan_live_score, overall_status, verified_at).</li>
            <li><strong>decisions</strong> (id, application_id, reviewer_id, decision_type, justification, notes, created_at).</li>
            <li><strong>audit_logs</strong> (id, application_id, action, actor_email, metadata_json, created_at).</li>
        </ul>
    </div>
</div>
"""
