"""
College Project Report Part 2: Chapters 5, 6, 7
"""

def get_college_report_p2_html():
    return """
<div class="report-wrapper page-break">
    <!-- CHAPTER 5: METHODOLOGY & IMPLEMENTATION MODULES -->
    <div class="chapter-header">
        <div class="chapter-number">CHAPTER 5</div>
        <div class="chapter-title">METHODOLOGY & IMPLEMENTATION MODULES</div>
    </div>

    <div class="sec-title">5.1 Module 1: Secure Authentication & Role-Based Access Control (RBAC)</div>
    <p style="text-align: justify;">
        User authentication provides identity assurance and role delineation across the digital lending ecosystem. The system implements stateless JSON Web Token (JWT) authorization signed using an HMAC-SHA256 secret key. Passwords submitted during registration are salted and hashed using the bcrypt algorithm with a cost factor of 12 rounds:
    </p>
    <div class="code-block">
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash(raw_password)
verified = pwd_context.verify(submitted_password, hashed_password)
    </div>
    <p style="text-align: justify;">
        Tokens encode the applicant's unique identifier, email address, assigned role (`APPLICANT` or `REVIEWER`), and expiration timestamp (set to 120 minutes). A custom FastAPI dependency `get_current_user` decodes the token from the HTTP Authorization header, verifies signature integrity, checks expiration bounds, and injects the active database user entity into route handlers.
    </p>

    <div class="sec-title">5.2 Module 2: Applicant Information & Financial Profile Processing</div>
    <p style="text-align: justify;">
        The loan intake workflow captures essential socio-demographic and financial attributes:
    </p>
    <ul>
        <li><strong>Demographics:</strong> Full legal name, date of birth, age (must be $\ge 18$ years), residential address, and state.</li>
        <li><strong>Employment Information:</strong> Employment type (`salaried` or `self-employed`), employer/business name, job tenure, and certified monthly gross income.</li>
        <li><strong>Loan Parameters:</strong> Requested loan principal (INR 10,000 to INR 2,000,000), loan tenure (6 to 60 months), and declared loan purpose (e.g., medical, education, debt consolidation, home improvement).</li>
    </ul>
    <p style="text-align: justify;">
        Input validation is enforced using Pydantic schemas, rejecting non-positive numbers, negative tenures, and invalid alphanumeric strings before database persistence.
    </p>

    <div class="sec-title">5.3 Module 3: Document Acquisition & Content Integrity Validation</div>
    <p style="text-align: justify;">
        A major vulnerability in early digital lending prototypes is the uncritical acceptance of client-uploaded files. To prevent system crashes and false verifications, the document ingestion pipeline enforces strict content validation:
    </p>
    <div class="callout-box warning">
        <strong>Content Validation Safeguards:</strong>
        <ol>
            <li><strong>Empty File Rejection:</strong> Files with a size of zero bytes are rejected immediately with HTTP 400 Bad Request.</li>
            <li><strong>MIME & Magic Header Inspection:</strong> File streams are inspected for valid magic numbers corresponding to JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), and PDF (`25 50 44 46`). Renamed executable or plain text files are blocked.</li>
            <li><strong>OpenCV Image Integrity Decoding:</strong> Uploaded images are passed to `cv2.imdecode`. If OpenCV returns a `None` matrix or empty dimensions, the file is rejected as corrupted.</li>
            <li><strong>Independent Document State:</strong> Aadhaar and PAN documents operate under separate state lifecycles. Modifying or replacing an Aadhaar image resets only the Aadhaar OCR results, leaving the PAN card verification untouched.</li>
        </ol>
    </div>

    <div class="sec-title">5.4 Module 4: Optical Character Recognition & Cross-Document Verification</div>
    <p style="text-align: justify;">
        Once validated, document images are processed by the Optical Character Recognition engine. Mobile photos frequently exhibit uneven shadows and skewed angles. To maximize character recognition accuracy, the image undergoes adaptive pre-processing:
    </p>
    <div class="code-block">
# Pre-processing pipeline in ocr_service.py
gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
denoised = cv2.fastNlMeansDenoising(gray, h=10)
# Otsu's automated thresholding
_, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
# PyTesseract character recognition
extracted_text = pytesseract.image_to_string(binary, config="--oem 3 --psm 6")
    </div>
    <p style="text-align: justify;">
        <strong>Identity Number Extraction & Checksum Verification:</strong>
    </p>
    <ul>
        <li><strong>Aadhaar Card:</strong> Regular expressions search for 12-digit numeric sequences formatted as `\d{4}\s\d{4}\s\d{4}`. The extracted number is validated against the <strong>Verhoeff dihedral checksum</strong>. Transposed digits or fabricated numbers immediately fail validation.</li>
        <li><strong>PAN Card:</strong> Parsed using regex `^[A-Z]{5}[0-9]{4}[A-Z]$`. The 4th character must equal 'P' (signifying an Individual taxpayer).</li>
    </ul>
    <p style="text-align: justify;">
        <strong>Cross-Document Name Consistency:</strong> Extracted names from Aadhaar and PAN are normalized (lowercased, punctuation removed) and compared against the applicant's entered name using Levenshtein edit distance:
    </p>
    <div class="ieee-equation">
        $$Lev(s_1, s_2) = \text{Minimum number of single-character edits to transform } s_1 \to s_2$$
    </div>
    <p style="text-align: justify;">
        If normalized similarity falls below 75%, a warning flag is raised for reviewer intervention.
    </p>

    <div class="sec-title">5.5 Module 5: Tri-Biometric Identity Cross-Verification Pipeline</div>
    <p style="text-align: justify;">
        To eliminate remote identity theft, the platform mandates a three-way biometric comparison combining:
    </p>
    <ol>
        <li><strong>Photo A:</strong> Cropped facial portrait extracted from the Aadhaar card.</li>
        <li><strong>Photo B:</strong> Cropped facial portrait extracted from the PAN card.</li>
        <li><strong>Photo C:</strong> Live webcam selfie captured by the applicant during the application session.</li>
    </ol>
    <p style="text-align: justify;">
        Facial regions are localized using OpenCV Haar Feature-based Cascade Classifiers (`haarcascade_frontalface_default.xml`). If zero faces or multiple faces are detected in any single document, the upload is rejected with a request for re-capture.
    </p>
    <p style="text-align: justify;">
        Detected facial regions are normalized to $112 \times 112$ pixels and passed through a deep convolutional feature extractor, producing a 512-dimensional vector $\mathbf{e} \in \mathbb{R}^{512}$. Pairwise Cosine distances are evaluated across all three pairs:
    </p>
    <table class="data-table">
        <thead>
            <tr>
                <th>Biometric Pair</th>
                <th>Comparison Metric</th>
                <th>Passing Threshold</th>
                <th>Failure Implication</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Aadhaar vs Live Selfie</strong></td>
                <td>Cosine Similarity $S(e_A, e_C)$</td>
                <td>$\ge 0.65$</td>
                <td>Applicant does not match Aadhaar identity record</td>
            </tr>
            <tr>
                <td><strong>PAN vs Live Selfie</strong></td>
                <td>Cosine Similarity $S(e_P, e_C)$</td>
                <td>$\ge 0.65$</td>
                <td>Applicant does not match PAN tax identity record</td>
            </tr>
            <tr>
                <td><strong>Aadhaar vs PAN</strong></td>
                <td>Cosine Similarity $S(e_A, e_P)$</td>
                <td>$\ge 0.60$</td>
                <td>Aadhaar and PAN documents belong to different individuals</td>
            </tr>
        </tbody>
    </table>

    <div class="sec-title">5.6 Module 6: Synthetic Credit Bureau & DigiLocker Simulation Engine</div>
    <p style="text-align: justify;">
        To facilitate production-grade demonstration without incurring commercial API subscription charges, the backend integrates deterministic synthetic gateway adapters:
    </p>
    <ul>
        <li><strong>DigiLocker Adapter:</strong> Simulates official e-KYC XML verification. If the uploaded Aadhaar number matches a pre-seeded synthetic registry, the adapter returns authentic verification timestamps, masked mobile numbers, and digital signatures.</li>
        <li><strong>Synthetic CIBIL Bureau:</strong> Evaluates applicant PAN and demographics against a seeded credit registry containing 1,000 calibrated profiles. Returns credit score (300 to 900), bureau risk band (`EXCELLENT`, `GOOD`, `FAIR`, `POOR`), count of active credit accounts, and default history.</li>
    </ul>

    <div class="sec-title">5.7 Module 7: Explainable Boosting Machine (EBM) Underwriting Engine</div>
    <p style="text-align: justify;">
        The underwriting engine relies upon Microsoft's InterpretML implementation of Generalized Additive Models with Pairwise Interactions (GA²M). Unlike conventional tree ensembles that split across multiple features simultaneously, EBM builds tree ensembles iteratively for one feature at a time in round-robin fashion:
    </p>
    <div class="code-block">
# EBM Training Logic in train_models.py
from interpret.glassbox import ExplainableBoostingClassifier

ebm = ExplainableBoostingClassifier(
    interactions=15,             # 15 automated pairwise bivariate interaction terms
    learning_rate=0.015,         # Very low learning rate for smooth splines
    max_bins=256,                # High resolution discretization
    outer_bags=16,               # Variance reduction via bagging
    inner_bags=0,
    random_state=42
)
ebm.fit(X_train, y_train)
    </div>
    <p style="text-align: justify;">
        <strong>Local Glassbox Explanation Generation:</strong> When evaluating a new loan application, the model computes the log-odds of loan approval by summing the individual feature scores:
    </p>
    <div class="ieee-equation">
        $$\text{Logit Score} = \beta_0 + f_{\text{cibil}}(\text{score}) + f_{\text{income}}(\text{salary}) + f_{\text{dti}}(\text{ratio}) + f_{\text{loan}}(\text{amount}) + \sum f_{ij}(x_i, x_j)$$
    </div>
    <p style="text-align: justify;">
        Each component $f_i(x_i)$ directly represents the positive or negative contribution of that attribute. The API returns these exact logit contributions to the frontend, rendering a dynamic waterfall chart explaining the precise reasons behind an approval or denial.
    </p>

    <div class="sec-title">5.8 Module 8: Reducing-Balance Amortization, Affordability & Business Rules</div>
    <p style="text-align: justify;">
        Before credit approval, the engine assesses applicant repayment capacity using standard actuarial formulas:
    </p>
    <div class="ieee-equation">
        $$EMI = \frac{P \cdot r \cdot (1 + r)^n}{(1 + r)^n - 1}$$
    </div>
    <p style="text-align: justify;">
        where $P$ is principal, $r$ is monthly rate, and $n$ is tenure. The engine enforces the statutory <strong>Debt-to-Income (DTI) Limit</strong>:
    </p>
    <div class="ieee-equation">
        $$DTI = \frac{EMI_{\text{new}} + \text{Existing Obligations}}{\text{Monthly Income}} \le 0.50$$
    </div>
    <p style="text-align: justify;">
        Applications with $DTI > 50\%$ are automatically routed to manual underwriter review or assigned reduced principal caps.
    </p>

    <div class="sec-title">5.9 Module 9: Reviewer/Admin Workstation & IDOR Security</div>
    <p style="text-align: justify;">
        The system provides a dedicated workstation for financial risk officers (`ROLE_REVIEWER`). Reviewers can inspect the complete underwriting queue, filter applications by risk tier, scrutinize face matching similarity scores, examine OCR extracted snippets, and execute final approvals or rejections with obligatory justification notes.
    </p>
    <p style="text-align: justify;">
        To prevent <strong>Insecure Direct Object Reference (IDOR)</strong> attacks, all application lookups execute under tenant-scoped query boundaries:
    </p>
    <div class="code-block">
# IDOR defense in application_routes.py
app = db.query(Application).filter(Application.id == app_id).first()
if current_user.role != "REVIEWER" and app.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Not authorized to access this application")
    </div>

    <div class="sec-title">5.10 Module 10: Disbursement Ledger & Automated Assessment PDF Generation</div>
    <p style="text-align: justify;">
        Following final approval, the applicant executes the digital loan disbursement transaction. The disbursement engine generates a unique 64-character SHA-256 cryptographic transaction hash, logs the simulated payment gateway reference, marks the loan status as `DISBURSED`, and enables the applicant to download an official Key Fact Statement and Underwriting Assessment Report in PDF format.
    </p>

    <!-- CHAPTER 6: DATABASE ARCHITECTURE -->
    <div class="page-break">
        <div class="chapter-header">
            <div class="chapter-number">CHAPTER 6</div>
            <div class="chapter-title">DATABASE ARCHITECTURE & DATA DICTIONARY</div>
        </div>

        <div class="sec-title">6.1 Database Design Principles</div>
        <p style="text-align: justify;">
            The relational database architecture is designed in Third Normal Form (3NF) to eliminate data redundancy, maintain transactional consistency, and support rapid analytical querying. Foreign key relationships enforce referential integrity across all operational tables.
        </p>

        <div class="sec-title">6.2 Relational Data Dictionary</div>
        <p style="text-align: justify;">
            <strong>Table 1: `users` (Applicant & Reviewer Identity Store)</strong>
        </p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Constraints</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>id</td><td>VARCHAR(36)</td><td>PRIMARY KEY</td><td>UUID unique user identifier</td></tr>
                <tr><td>email</td><td>VARCHAR(255)</td><td>UNIQUE, NOT NULL</td><td>Login email address</td></tr>
                <tr><td>password_hash</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Bcrypt salted password hash</td></tr>
                <tr><td>name</td><td>VARCHAR(100)</td><td>NOT NULL</td><td>Applicant full legal name</td></tr>
                <tr><td>role</td><td>VARCHAR(20)</td><td>DEFAULT 'APPLICANT'</td><td>Access role (`APPLICANT`, `REVIEWER`)</td></tr>
                <tr><td>created_at</td><td>DATETIME</td><td>NOT NULL</td><td>Account creation timestamp</td></tr>
            </tbody>
        </table>

        <p style="text-align: justify; margin-top: 20px;">
            <strong>Table 2: `applications` (Loan Lifecycle Records)</strong>
        </p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Constraints</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>id</td><td>VARCHAR(36)</td><td>PRIMARY KEY</td><td>UUID unique loan application identifier</td></tr>
                <tr><td>user_id</td><td>VARCHAR(36)</td><td>FOREIGN KEY (users.id)</td><td>Associated applicant user ID</td></tr>
                <tr><td>monthly_income</td><td>FLOAT</td><td>NOT NULL</td><td>Certified monthly income in INR</td></tr>
                <tr><td>employment_type</td><td>VARCHAR(50)</td><td>NOT NULL</td><td>`salaried` or `self_employed`</td></tr>
                <tr><td>loan_amount</td><td>FLOAT</td><td>NOT NULL</td><td>Requested principal amount</td></tr>
                <tr><td>loan_tenure</td><td>INTEGER</td><td>NOT NULL</td><td>Tenure in months (6 to 60)</td></tr>
                <tr><td>status</td><td>VARCHAR(30)</td><td>NOT NULL</td><td>`DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `DISBURSED`</td></tr>
                <tr><td>cibil_score</td><td>INTEGER</td><td>NULLABLE</td><td>Retrieved credit bureau score (300–900)</td></tr>
                <tr><td>dti_ratio</td><td>FLOAT</td><td>NULLABLE</td><td>Debt-to-Income percentage ratio</td></tr>
                <tr><td>emi_amount</td><td>FLOAT</td><td>NULLABLE</td><td>Calculated monthly reducing-balance EMI</td></tr>
                <tr><td>approval_probability</td><td>FLOAT</td><td>NULLABLE</td><td>EBM model approval probability</td></tr>
                <tr><td>disbursement_tx_id</td><td>VARCHAR(64)</td><td>NULLABLE</td><td>Cryptographic transaction disbursement hash</td></tr>
                <tr><td>created_at</td><td>DATETIME</td><td>NOT NULL</td><td>Submission timestamp</td></tr>
            </tbody>
        </table>

        <p style="text-align: justify; margin-top: 20px;">
            <strong>Table 3: `documents` (Uploaded KYC Credentials)</strong>
        </p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Constraints</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>id</td><td>VARCHAR(36)</td><td>PRIMARY KEY</td><td>UUID document record identifier</td></tr>
                <tr><td>application_id</td><td>VARCHAR(36)</td><td>FOREIGN KEY (applications.id)</td><td>Associated loan application ID</td></tr>
                <tr><td>doc_type</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>`AADHAAR`, `PAN`, `SALARY_SLIP`</td></tr>
                <tr><td>file_path</td><td>VARCHAR(500)</td><td>NOT NULL</td><td>Server filesystem storage path</td></tr>
                <tr><td>ocr_extracted_text</td><td>TEXT</td><td>NULLABLE</td><td>Raw OCR extracted text stream</td></tr>
                <tr><td>checksum_valid</td><td>BOOLEAN</td><td>DEFAULT FALSE</td><td>Verhoeff / PAN regex validation result</td></tr>
                <tr><td>is_verified</td><td>BOOLEAN</td><td>DEFAULT FALSE</td><td>Overall document verification status</td></tr>
                <tr><td>created_at</td><td>DATETIME</td><td>NOT NULL</td><td>Upload timestamp</td></tr>
            </tbody>
        </table>

        <p style="text-align: justify; margin-top: 20px;">
            <strong>Table 4: `face_verifications` (Biometric Comparison Records)</strong>
        </p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Constraints</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>id</td><td>VARCHAR(36)</td><td>PRIMARY KEY</td><td>UUID verification record identifier</td></tr>
                <tr><td>application_id</td><td>VARCHAR(36)</td><td>FOREIGN KEY (applications.id)</td><td>Associated loan application ID</td></tr>
                <tr><td>aadhaar_pan_score</td><td>FLOAT</td><td>NOT NULL</td><td>Cosine similarity: Aadhaar vs PAN</td></tr>
                <tr><td>aadhaar_live_score</td><td>FLOAT</td><td>NOT NULL</td><td>Cosine similarity: Aadhaar vs Live</td></tr>
                <tr><td>pan_live_score</td><td>FLOAT</td><td>NOT NULL</td><td>Cosine similarity: PAN vs Live</td></tr>
                <tr><td>overall_status</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>`MATCHED`, `INCONCLUSIVE`, `FAILED`</td></tr>
                <tr><td>verified_at</td><td>DATETIME</td><td>NOT NULL</td><td>Verification timestamp</td></tr>
            </tbody>
        </table>
    </div>

    <!-- CHAPTER 7: API SPECIFICATIONS -->
    <div class="page-break">
        <div class="chapter-header">
            <div class="chapter-number">CHAPTER 7</div>
            <div class="chapter-title">API SPECIFICATIONS & INTEGRATION CONTRACTS</div>
        </div>

        <div class="sec-title">7.1 RESTful Architectural Principles</div>
        <p style="text-align: justify;">
            The backend exposes stateless, versioned RESTful APIs conforming to the OpenAPI 3.0 specification. Requests and responses communicate via JSON serialization with standard HTTP status code conventions: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, and 500 Internal Server Error.
        </p>

        <div class="sec-title">7.2 Core API Endpoint Catalog</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>HTTP Verb</th>
                    <th>Endpoint Route</th>
                    <th>Auth Role</th>
                    <th>Function & Payload Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/auth/register`</td>
                    <td>Public</td>
                    <td>Registers new applicant. Payload: `name`, `email`, `password`.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/auth/login`</td>
                    <td>Public</td>
                    <td>Authenticates credentials. Returns JWT bearer access token.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/applications`</td>
                    <td>Applicant</td>
                    <td>Creates new loan application. Payload: `income`, `loanAmount`, `tenure`.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">GET</span></td>
                    <td>`/api/applications/{id}`</td>
                    <td>Owner / Reviewer</td>
                    <td>Retrieves loan application details. Protected by IDOR tenant check.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/documents/upload`</td>
                    <td>Applicant</td>
                    <td>Multipart file upload. Validates magic bytes, dimensions, and saves file.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/documents/ocr-process`</td>
                    <td>Applicant</td>
                    <td>Triggers Tesseract OCR, Verhoeff checksums, and string distance matching.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/face/verify-triplet`</td>
                    <td>Applicant</td>
                    <td>Submits live base64 selfie; extracts embeddings; evaluates cosine similarity.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/credit/query-bureau`</td>
                    <td>Applicant</td>
                    <td>Queries synthetic credit bureau database by applicant PAN and demographics.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/predictions/evaluate`</td>
                    <td>Applicant</td>
                    <td>Executes Explainable Boosting Machine inference. Returns logits and EMI.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/decisions/reviewer-action/{id}`</td>
                    <td>Reviewer</td>
                    <td>Records final approval or rejection with mandatory justification note.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">POST</span></td>
                    <td>`/api/disbursements/execute/{id}`</td>
                    <td>Applicant</td>
                    <td>Executes idempotent digital loan disbursement. Returns SHA-256 hash.</td>
                </tr>
                <tr>
                    <td><span class="badge badge-tech">GET</span></td>
                    <td>`/api/reports/assessment/{id}`</td>
                    <td>Owner / Reviewer</td>
                    <td>Streams generated comprehensive loan assessment audit report in PDF format.</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
"""
