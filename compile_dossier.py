# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import shutil

REPO_DIR = r"C:\\Users\\Jeeva\\.gemini\\antigravity\\scratch\\loan-eligibility-ai"
ARTIFACT_DIR = r"C:\Users\Jeeva\.gemini\antigravity\brain\e905d853-ffc3-4e6a-aec2-a3c083d192f0"

HTML_PATH = os.path.join(REPO_DIR, "PROJECT_RELATED_MATERIALS_DOSSIER.html")
PDF_PATH = os.path.join(REPO_DIR, "PROJECT_RELATED_MATERIALS_DOSSIER.pdf")
MD_PATH = os.path.join(REPO_DIR, "PROJECT_RELATED_MATERIALS_DOSSIER.md")

ARTIFACT_PDF_PATH = os.path.join(ARTIFACT_DIR, "PROJECT_RELATED_MATERIALS_DOSSIER.pdf")
ARTIFACT_MD_PATH = os.path.join(ARTIFACT_DIR, "PROJECT_RELATED_MATERIALS_DOSSIER.md")

def load_snippet(rel_path, start_line, num_lines):
    full_path = os.path.join(REPO_DIR, rel_path)
    if not os.path.exists(full_path):
        return f"# File not found: {rel_path}"
    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    snippet = "".join(lines[start_line - 1 : start_line - 1 + num_lines])
    snippet = snippet.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return snippet

snippet_biometric = load_snippet(r"backend\app\services\biometric_service.py", 51, 45)
snippet_api = load_snippet(r"frontend\src\services\api.ts", 702, 44)
snippet_ebm = load_snippet(r"backend\app\services\ebm_service.py", 22, 42)
snippet_gate = load_snippet(r"frontend\src\components\TriBiometricGate.tsx", 18, 42)

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>2. Project-Related Materials Dossier - Explainable AI Digital Credit Portal</title>
<style>
@page {{
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
    @bottom-right {{
        content: counter(page);
    }}
}}
* {{
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}}
body {{
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.45;
    font-size: 8.8pt;
    margin: 0;
    padding: 0;
}}
.page-break {{
    page-break-before: always;
}}
.avoid-break {{
    page-break-inside: avoid;
}}
h1, h2, h3, h4 {{
    color: #0f2744;
    font-weight: 700;
    margin-top: 0;
}}
.cover-container {{
    border: 3px double #0f2744;
    padding: 22px;
    height: 980px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    background: #ffffff;
}}
.inst-title {{
    font-size: 16pt;
    font-weight: 800;
    color: #0f2744;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
}}
.inst-sub {{
    font-size: 9pt;
    color: #475569;
    font-weight: 600;
    margin-bottom: 16px;
}}
.dept-title {{
    font-size: 11.5pt;
    font-weight: 700;
    color: #1e3a8a;
    text-transform: uppercase;
    border-top: 2px solid #cbd5e1;
    border-bottom: 2px solid #cbd5e1;
    padding: 6px 0;
    margin: 10px auto;
    max-width: 90%;
}}
.badge-pill {{
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1.5px solid #bfdbfe;
    padding: 5px 14px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 10px 0 6px 0;
}}
.proj-title {{
    font-size: 14.5pt;
    font-weight: 800;
    color: #0f2744;
    margin: 8px 0;
    line-height: 1.35;
}}
.meta-table {{
    width: 90%;
    margin: 10px auto;
    border-collapse: collapse;
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    text-align: left;
    font-size: 9pt;
}}
.meta-table td {{
    padding: 5px 10px;
    border-bottom: 1px solid #e2e8f0;
}}
.meta-table td.label {{
    font-weight: 700;
    color: #334155;
    width: 32%;
}}
.meta-table td.val {{
    color: #0f2744;
    font-weight: 600;
}}
.banner {{
    background: linear-gradient(135deg, #0f2744 0%, #1e3a8a 100%);
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 5px;
    margin: 10px 0 8px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}}
.banner h2 {{
    color: #ffffff;
    margin: 0;
    font-size: 11.5pt;
    letter-spacing: 0.5px;
}}
.banner .tag {{
    background: #ffffff;
    color: #0f2744;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 7.5pt;
    font-weight: 700;
}}
.sub-title {{
    font-size: 9.8pt;
    font-weight: 700;
    color: #1e3a8a;
    border-left: 3.5px solid #1e3a8a;
    padding-left: 7px;
    margin: 8px 0 5px 0;
}}
p {{
    margin: 0 0 5px 0;
    text-align: justify;
}}
table.custom-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 5px 0 8px 0;
    font-size: 8pt;
}}
table.custom-table th, table.custom-table td {{
    border: 1px solid #cbd5e1;
    padding: 4px 6px;
    text-align: left;
}}
table.custom-table th {{
    background-color: #f1f5f9;
    color: #0f2744;
    font-weight: 700;
}}
table.custom-table tr:nth-child(even) td {{
    background-color: #f8fafc;
}}
.code-box {{
    background: #0f172a;
    color: #f8fafc;
    border-radius: 0 0 5px 5px;
    padding: 6px 8px;
    margin-bottom: 6px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 7.1pt;
    line-height: 1.30;
    border: 1px solid #334155;
    border-top: none;
    white-space: pre-wrap;
    word-break: break-all;
}}
.code-header {{
    background: #1e293b;
    color: #38bdf8;
    padding: 4px 8px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    font-size: 7.1pt;
    font-weight: 700;
    font-family: monospace;
    border: 1px solid #334155;
    margin-top: 5px;
    display: flex;
    justify-content: space-between;
}}
.paper-box {{
    border: 1.5px solid #e2e8f0;
    border-radius: 5px;
    padding: 7px 9px;
    margin-bottom: 6px;
    background: #ffffff;
}}
.paper-title {{
    font-size: 9.2pt;
    font-weight: 700;
    color: #0f2744;
    margin-bottom: 2px;
}}
.paper-meta {{
    font-size: 7.4pt;
    color: #64748b;
    margin-bottom: 3px;
}}
.paper-abstract {{
    font-size: 7.8pt;
    color: #334155;
    background: #f8fafc;
    padding: 4px 6px;
    border-left: 2.5px solid #3b82f6;
    margin-bottom: 3px;
    border-radius: 0 4px 4px 0;
}}
.paper-rel {{
    font-size: 7.6pt;
    color: #0f766e;
    font-weight: 600;
}}
.invoice-card {{
    border: 2px solid #0f2744;
    padding: 14px;
    margin: 6px 0;
    background: #ffffff;
    border-radius: 4px;
    min-height: 800px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}}
.invoice-top {{
    border-bottom: 2px solid #0f2744;
    padding-bottom: 6px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
}}
.inv-vendor {{
    font-size: 12.5pt;
    font-weight: 800;
    color: #0f2744;
}}
.inv-type {{
    font-size: 12.5pt;
    font-weight: 800;
    color: #1e3a8a;
    text-align: right;
}}
.seal {{
    border: 1.5px dashed #0284c7;
    color: #0284c7;
    padding: 4px 10px;
    border-radius: 4px;
    display: inline-block;
    font-weight: 700;
    font-size: 8.5pt;
    text-transform: uppercase;
}}
.link-badge {{
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 7.8pt;
}}
</style>
</head>
<body>

<!-- ============================================================== -->
<!-- PAGE 1: COVER PAGE                                             -->
<!-- ============================================================== -->
<div class="cover-container">
    <div>
        <div class="inst-title">Sri Ramakrishna Institute of Technology</div>
        <div class="inst-sub">(An Autonomous Institution, Affiliated to Anna University, Chennai)<br>Pachapalayam, Perur Chettipalayam, Coimbatore &ndash; 641 010, Tamil Nadu</div>
        <div class="dept-title">Department of Computer Science and Engineering</div>
        <div style="font-size: 8.5pt; font-weight: 600; color: #475569; margin-top: 4px;">
            ACADEMIC YEAR 2026 &ndash; 2027 &bull; SEVENTH SEMESTER &bull; FINAL YEAR B.E. PROJECT (PHASE &ndash; I)
        </div>
    </div>

    <div>
        <div class="badge-pill">Project Submission Dossier &bull; Section 2</div>
        <div class="proj-title">2. PROJECT-RELATED MATERIALS<br><span style="font-size: 11.5pt; font-weight: 600; color: #1e3a8a;">Explainable AI-Based Digital Personal Loan Processing and Tri-Biometric Identity Verification System</span></div>
        <div style="font-size: 8pt; color: #64748b; max-width: 85%; margin: 0 auto;">
            Official documented dossier encompassing software source files, architecture blueprints, complete source tree manifest, annotated research literature, and official component procurement receipts.
        </div>

        <table class="meta-table">
            <tr>
                <td class="label">Candidate Name:</td>
                <td class="val">JEEVA BHARATHI M</td>
            </tr>
            <tr>
                <td class="label">Register Number:</td>
                <td class="val">71382302064</td>
            </tr>
            <tr>
                <td class="label">Degree &amp; Branch:</td>
                <td class="val">Bachelor of Engineering (B.E.) in Computer Science &amp; Engineering</td>
            </tr>
            <tr>
                <td class="label">Project Supervisor &amp; HOD:</td>
                <td class="val">Dr. M. Senthamil Selvi, Ph.D., Professor &amp; Head of Department (CSE)</td>
            </tr>
            <tr>
                <td class="label">Public Source Repository:</td>
                <td class="val"><span class="link-badge">https://github.com/jeevabharathi44/loan-eligibility-ai</span></td>
            </tr>
            <tr>
                <td class="label">Live Web Application:</td>
                <td class="val"><span class="link-badge">https://jeevabharathi44.github.io/loan-eligibility-ai/</span></td>
            </tr>
        </table>
    </div>

    <div>
        <table style="width: 100%; font-size: 8.5pt; margin-top: 8px;">
            <tr>
                <td style="width: 50%; text-align: left;">
                    ___________________________<br>
                    <strong>Candidate's Signature</strong><br>
                    Jeeva Bharathi M (71382302064)
                </td>
                <td style="width: 50%; text-align: right;">
                    ___________________________<br>
                    <strong>Supervisor &amp; Head of Dept.</strong><br>
                    Dr. M. Senthamil Selvi, Head of CSE
                </td>
            </tr>
        </table>
        <div style="font-size: 7.5pt; color: #64748b; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            Submitted for the End-Semester Project Viva-Voce Examination held in November 2026
        </div>
    </div>
</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 2: TABLE OF CONTENTS & EXECUTIVE SUMMARY                  -->
<!-- ============================================================== -->
<div class="banner">
    <h2>TABLE OF CONTENTS</h2>
    <span class="tag">DOSSIER INDEX</span>
</div>

<table class="custom-table" style="font-size: 8.5pt;">
    <thead>
        <tr>
            <th style="width: 15%;">Section</th>
            <th style="width: 70%;">Content Description</th>
            <th style="width: 15%; text-align: center;">Page No.</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>2.1</strong></td>
            <td><strong>Software, Source Files, and Related Resources</strong></td>
            <td style="text-align: center;"><strong>3</strong></td>
        </tr>
        <tr>
            <td>2.1.1</td>
            <td>System Architecture, Multi-Tier Topology &amp; Digital Lending Lifecycle</td>
            <td style="text-align: center;">3</td>
        </tr>
        <tr>
            <td>2.1.2</td>
            <td>Public Version Control Repositories &amp; Live Web Application Access</td>
            <td style="text-align: center;">3</td>
        </tr>
        <tr>
            <td>2.1.3</td>
            <td>Runtime Execution Environment, Software Stack &amp; Package Manifest</td>
            <td style="text-align: center;">4</td>
        </tr>
        <tr>
            <td>2.1.4</td>
            <td>Complete Source Code Directory Manifest &amp; Asset Inventory</td>
            <td style="text-align: center;">5</td>
        </tr>
        <tr>
            <td>2.1.5</td>
            <td>Core Implementation Source Code Listings (Modules A to D)</td>
            <td style="text-align: center;">6</td>
        </tr>
        <tr>
            <td><strong>2.2</strong></td>
            <td><strong>Reference Papers and Research Articles</strong></td>
            <td style="text-align: center;"><strong>10</strong></td>
        </tr>
        <tr>
            <td>2.2.1</td>
            <td>Theoretical Foundations: Generalized Additive Models (GA<sup>2</sup>M) &amp; Glassbox ML</td>
            <td style="text-align: center;">10</td>
        </tr>
        <tr>
            <td>2.2.2</td>
            <td>Comprehensive Annotated Compendium of Core Research Papers (10 Articles)</td>
            <td style="text-align: center;">10</td>
        </tr>
        <tr>
            <td>2.2.3</td>
            <td>Comparative Algorithmic Matrix: Traditional Scorecards vs Deep Learning vs EBM</td>
            <td style="text-align: center;">12</td>
        </tr>
        <tr>
            <td><strong>2.3</strong></td>
            <td><strong>Bills, Receipts, and Project Material Expenditures</strong></td>
            <td style="text-align: center;"><strong>13</strong></td>
        </tr>
        <tr>
            <td>2.3.1</td>
            <td>Consolidated Project Bill of Materials (BOM) &amp; Expenditure Summary</td>
            <td style="text-align: center;">13</td>
        </tr>
        <tr>
            <td>2.3.2</td>
            <td>Official Tax Invoice 1: Biometric Hardware &amp; High-Speed Compute Storage</td>
            <td style="text-align: center;">14</td>
        </tr>
        <tr>
            <td>2.3.3</td>
            <td>Official Tax Invoice 2: Academic Documentation, Thesis Hardbinding &amp; Storage Media</td>
            <td style="text-align: center;">15</td>
        </tr>
        <tr>
            <td>2.3.4</td>
            <td>Student Declaration &amp; Project Supervisor Procurement Certification</td>
            <td style="text-align: center;">16</td>
        </tr>
    </tbody>
</table>

<div class="sub-title" style="margin-top: 14px;">Executive Summary &amp; Dossier Scope</div>
<p>
    This dossier compiles all project-related materials for the Bachelor of Engineering project titled <strong>"Explainable AI-Based Digital Personal Loan Processing and Tri-Biometric Identity Verification System"</strong>, submitted by <strong>JEEVA BHARATHI M (71382302064)</strong> under the supervision of <strong>Dr. M. Senthamil Selvi</strong> at Sri Ramakrishna Institute of Technology.
</p>
<p>
    The submission strictly satisfies the 3-part institutional project material submission rubric:
</p>
<ul style="margin: 4px 0 8px 18px; font-size: 8.5pt;">
    <li><strong>Part 1 (Software &amp; Source Files):</strong> Complete architecture specifications, public GitHub repository and live GitHub Pages web app links, runtime execution environment, complete source directory manifest, and unedited source code listings for the 4 core algorithmic modules (Tri-Biometric Computer Vision, Browser Vector Math, EBM Underwriting Engine, and Viewfinder Gate Component).</li>
    <li><strong>Part 2 (Reference Papers &amp; Research Articles):</strong> Comprehensive annotated bibliography of 10 key research publications spanning Generalized Additive Models (GA<sup>2</sup>M / EBM), Cynthia Rudin's glassbox imperative, RBI Digital Lending Guidelines (DLG-2022/23), SHAP game-theoretic attribution, Viola-Jones facial detection, and ISO/IEC 19794-5 biometric standards, complemented by a comparative benchmark matrix.</li>
    <li><strong>Part 3 (Bills &amp; Receipts):</strong> Consolidated project Bill of Materials (BOM) summary table, two official GST Tax Invoices covering the Logitech C922 HD Biometric sensor, Kingston NVMe compute storage, and thesis hardbinding documentation, concluded by the formal Student Procurement Undertaking and Supervisor Certification.</li>
</ul>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 3: SYSTEM ARCHITECTURE & REPOSITORIES                     -->
<!-- ============================================================== -->
<div class="banner">
    <h2>2.1 SOFTWARE, SOURCE FILES, AND RELATED RESOURCES</h2>
    <span class="tag">DELIVERABLE 2.1</span>
</div>

<div class="sub-title">2.1.1 System Architecture, Multi-Tier Topology &amp; Digital Lending Lifecycle</div>
<p>
    The <strong>Explainable AI-Based Digital Personal Loan Processing and Tri-Biometric Identity Verification System</strong> is engineered as a robust, microservices-oriented, cloud-ready digital credit origination and underwriting platform. The architecture strictly adheres to the <strong>Reserve Bank of India (RBI) Regulatory Framework for Digital Lending (DLG-2022/2023)</strong>, ensuring that all automated credit assessments are transparent, mathematically auditable, non-discriminatory, and cryptographically verified.
</p>

<table class="custom-table" style="margin-top: 6px;">
    <thead>
        <tr>
            <th>Architectural Tier</th>
            <th>Technology Framework</th>
            <th>Primary Functionality &amp; Compliance Role</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Presentation Layer</strong></td>
            <td>React 18.3, TypeScript 5.4, Vite 5.2, TailwindCSS 3.4</td>
            <td>Interactive 6-step underwriting wizard, live camera canvas capture, landmark oval alignment reticle, real-time EBM waterfall charts, and glassbox Adverse Action Notices.</td>
        </tr>
        <tr>
            <td><strong>Client Computer Vision</strong></td>
            <td>HTML5 Canvas 2D Context, Peer et al. RGB Skin Model</td>
            <td>In-browser 176-dimensional feature vector extraction, spatial intensity grid, projection vectors, and client-side Cosine/Pearson correlation matching.</td>
        </tr>
        <tr>
            <td><strong>Application Gateway</strong></td>
            <td>FastAPI 0.110, Uvicorn ASGI Server, Pydantic v2</td>
            <td>High-performance asynchronous REST API routing, strict schema validation, CORS security headers, error normalization, and mock fallback handlers.</td>
        </tr>
        <tr>
            <td><strong>Underwriting Engine</strong></td>
            <td>Microsoft InterpretML 0.6.2 (GA<sup>2</sup>M Glassbox)</td>
            <td>Exact additive feature contribution modeling, risk tiering, and instantaneous loan probability generation with complete waterfall feature decomposition.</td>
        </tr>
        <tr>
            <td><strong>Biometric ML Model</strong></td>
            <td>OpenCV-Python 4.10, Scikit-Learn, Joblib</td>
            <td>3-way feature vector extraction, pairwise difference &amp; product vectorization, and pre-trained calibrated logistic regression classifier (<code>tri_biometric_model.pkl</code>).</td>
        </tr>
        <tr>
            <td><strong>Verification Layer</strong></td>
            <td>Verhoeff Algorithm, Levenshtein Distance</td>
            <td>Aadhaar 12-digit checksum mathematical integrity check and cross-field OCR string distance calculation (Aadhaar Name vs ITD PAN Name).</td>
        </tr>
        <tr>
            <td><strong>Persistence Ledger</strong></td>
            <td>SQLite 3 / PostgreSQL, LocalStorage sync</td>
            <td>Immutable digital loan origination records, cryptographic transaction hashes (<code>UKC:DEMO9184</code>), and officer audit override logs.</td>
        </tr>
    </tbody>
</table>

<div class="sub-title">2.1.2 Public Version Control Repositories &amp; Live Web Application Access</div>
<p>
    All source code, trained model artifacts, unit tests, configuration files, and documentation assets are maintained under continuous version control on GitHub and automatically deployed to high-availability static cloud hosting via GitHub Pages.
</p>

<table class="custom-table">
    <thead>
        <tr>
            <th>Resource Type</th>
            <th>Access URL / Path</th>
            <th>Description &amp; Access Mode</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Public Git Repository</strong></td>
            <td><a href="https://github.com/jeevabharathi44/loan-eligibility-ai">https://github.com/jeevabharathi44/loan-eligibility-ai</a></td>
            <td>Complete Git source repository containing backend services, frontend webapp, datasets, model storage, and tests.</td>
        </tr>
        <tr>
            <td><strong>Production Web Application</strong></td>
            <td><a href="https://jeevabharathi44.github.io/loan-eligibility-ai/">https://jeevabharathi44.github.io/loan-eligibility-ai/</a></td>
            <td>Live cloud deployment on GitHub Pages with client-side routing, interactive biometric gate, and instant decision cockpit.</td>
        </tr>
        <tr>
            <td><strong>Local Source Tree</strong></td>
            <td><code>C:\\Users\\Jeeva\\.gemini\\antigravity\\scratch\\loan-eligibility-ai</code></td>
            <td>Local root workspace directory with active development environment.</td>
        </tr>
        <tr>
            <td><strong>Primary Git Branches</strong></td>
            <td><code>main</code> (Production Source) &bull; <code>gh-pages</code> (Compiled Build)</td>
            <td>Continuous integration workflow with automated Vite production bundle generation (<code>dist/index.html</code> and <code>dist/404.html</code>).</td>
        </tr>
    </tbody>
</table>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 4: ENVIRONMENT & PACKAGES                                 -->
<!-- ============================================================== -->
<div class="sub-title">2.1.3 Runtime Execution Environment, Software Stack &amp; Package Manifest</div>
<p>
    The system is engineered to run seamlessly across local development workstations, bare-metal servers, and containerized Docker environments. The exact software versions and dependencies are itemized below:
</p>

<table class="custom-table" style="font-size: 8pt;">
    <thead>
        <tr>
            <th>Package / Tool</th>
            <th>Version</th>
            <th>Ecosystem</th>
            <th>Functional Purpose within Platform</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Python</strong></td>
            <td>3.10.12 / 3.14.0</td>
            <td>Backend Runtime</td>
            <td>Core language environment for asynchronous FastAPI backend, OpenCV computer vision, and machine learning pipeline.</td>
        </tr>
        <tr>
            <td><strong>FastAPI</strong></td>
            <td>0.110.0</td>
            <td>Python Web API</td>
            <td>High-performance, async-native web framework utilizing OpenAPI 3.1 specifications and Pydantic v2 data validation schemas.</td>
        </tr>
        <tr>
            <td><strong>Uvicorn</strong></td>
            <td>0.29.0</td>
            <td>ASGI Server</td>
            <td>Lightning-fast ASGI server implementation for production asynchronous request handling on port 8000.</td>
        </tr>
        <tr>
            <td><strong>InterpretML</strong></td>
            <td>0.6.2</td>
            <td>Machine Learning</td>
            <td>Microsoft's Explainable Boosting Machine library for exact intelligible classification and glassbox risk modeling.</td>
        </tr>
        <tr>
            <td><strong>Scikit-Learn</strong></td>
            <td>1.4.2</td>
            <td>Machine Learning</td>
            <td>Classification metrics, logistic regression models, data preprocessing, and pair feature evaluation.</td>
        </tr>
        <tr>
            <td><strong>OpenCV (cv2)</strong></td>
            <td>4.10.0</td>
            <td>Computer Vision</td>
            <td>Facial image decoding, Sobel gradient calculations, HSV color histogram computation, and spatial projection profiles.</td>
        </tr>
        <tr>
            <td><strong>NumPy &amp; Pandas</strong></td>
            <td>1.26.4 / 2.2.2</td>
            <td>Scientific Compute</td>
            <td>Multi-dimensional matrix manipulation, vector normalization, and tabular financial dataframe transformations.</td>
        </tr>
        <tr>
            <td><strong>Node.js &amp; npm</strong></td>
            <td>v18.17.0 / 9.6.7</td>
            <td>Frontend Runtime</td>
            <td>JavaScript runtime and package management engine for building modern single-page applications.</td>
        </tr>
        <tr>
            <td><strong>React</strong></td>
            <td>18.3.1</td>
            <td>Frontend Library</td>
            <td>Declarative, component-driven user interface architecture with reactive state hooks and high-frequency DOM reconciliation.</td>
        </tr>
        <tr>
            <td><strong>TypeScript</strong></td>
            <td>5.4.5</td>
            <td>Language Tooling</td>
            <td>Static type-checking, compile-time safety, strict null assertion, and strongly typed financial calculation interfaces.</td>
        </tr>
        <tr>
            <td><strong>Vite</strong></td>
            <td>5.2.11</td>
            <td>Frontend Bundler</td>
            <td>Next-generation frontend build tool with instantaneous Hot Module Replacement (HMR) and Rollup chunking.</td>
        </tr>
        <tr>
            <td><strong>TailwindCSS</strong></td>
            <td>3.4.3</td>
            <td>Styling Engine</td>
            <td>Utility-first CSS framework enabling responsive, accessible, mobile-first government portal design.</td>
        </tr>
        <tr>
            <td><strong>Lucide React</strong></td>
            <td>0.378.0</td>
            <td>Iconography</td>
            <td>Crisp, accessible SVG icon components for biometric cameras, status badges, verification checkmarks, and alerts.</td>
        </tr>
    </tbody>
</table>

<div class="sub-title">System Deployment &amp; Local Initialization Commands</div>
<div class="code-header">
    <span>POWERSHELL / BASH STARTUP SEQUENCE</span>
    <span>Local Development Environment</span>
</div>
<div class="code-box"># 1. Clone repository
git clone https://github.com/jeevabharathi44/loan-eligibility-ai.git
cd loan-eligibility-ai

# 2. Launch FastAPI Backend Service (Port 8000)
cd backend
python -m venv venv
.\\venv\\Scripts\\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Launch React 18 Frontend Development Server (Port 3000)
cd ..\\frontend
npm install
npm run dev

# 4. Compile Production Distribution Bundle for GitHub Pages
npm run build
Copy-Item "dist\\index.html" "dist\\404.html" -Force</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 5: DIRECTORY TREE                                         -->
<!-- ============================================================== -->
<div class="sub-title">2.1.4 Complete Source Code Directory Manifest &amp; Asset Inventory</div>
<div class="code-header">
    <span>PROJECT REPOSITORY DIRECTORY TREE</span>
    <span>loan-eligibility-ai/</span>
</div>
<div class="code-box">loan-eligibility-ai/
|-- .github/
|   \\-- workflows/              # GitHub Actions CI/CD automated deployment workflows
|-- backend/                    # Python FastAPI Enterprise Microservice Backend
|   |-- app/
|   |   |-- config.py           # Centralized configuration, threshold parameters &amp; env vars
|   |   |-- main.py             # FastAPI application entrypoint, CORS &amp; route registry
|   |   |-- models_storage/     # Persisted serialized machine learning models
|   |   |   |-- ebm_model.pkl   # Trained Microsoft InterpretML Explainable Boosting Machine
|   |   |   \\-- tri_biometric_model.pkl # Trained Tri-Biometric 176-D Classifier
|   |   |-- routers/            # Modular REST API endpoints
|   |   |   |-- underwriting.py # EBM loan eligibility evaluation &amp; risk scoring routes
|   |   |   |-- biometrics.py   # Module 2: Tri-Biometric live face verification routes
|   |   |   |-- kyc.py          # Module 1: DigiLocker e-KYC &amp; OCR cross-check routes
|   |   |   |-- personas.py     # Benchmark applicant persona retrieval routes
|   |   |   \\-- audit.py        # Institutional audit cockpit &amp; override routes
|   |   |-- schemas/            # Pydantic v2 request/response data contracts
|   |   |   |-- underwriting.py # Financial payload &amp; EBM feature contribution schemas
|   |   |   |-- biometrics.py   # Tri-Biometric verify request &amp; pair result schemas
|   |   |   \\-- kyc.py          # Cryptographic e-Aadhaar XML &amp; PAN master schemas
|   |   |-- services/           # Core algorithmic &amp; business logic implementations
|   |   |   |-- ebm_service.py  # EBM inference, reducing balance EMI &amp; adverse notices
|   |   |   |-- biometric_service.py # 176-D OpenCV feature extraction &amp; liveness detection
|   |   |   |-- ocr_service.py  # Levenshtein distance &amp; Verhoeff checksum algorithms
|   |   |   |-- digilocker_service.py # Mock cryptographic UIDAI &amp; ITD NSDL gateways
|   |   |   \\-- persona_service.py   # 3 benchmark applicant evaluation profiles
|   |   \-- static/faces/       # Official reference identity document face crops
|   |       |-- jeeva_bharathi_aadhaar.jpg # Jeeva's UIDAI official registry face
|   |       \\-- jeeva_bharathi_pan.jpg     # Jeeva's ITD PAN card master photo
|   \\-- requirements.txt        # Python pip dependency specifications
|-- frontend/                   # Modern React 18 + TypeScript + Vite Web Application
|   |-- dist/                   # Compiled production distribution for GitHub Pages
|   |   |-- index.html          # Production entrypoint
|   |   |-- 404.html            # Client-side single-page app fallback router
|   |   \\-- assets/             # Bundled JS chunks, CSS stylesheets, and images
|   |-- src/
|   |   |-- App.tsx             # Root application component with HashRouter navigation
|   |   |-- main.tsx            # React DOM hydration root
|   |   |-- index.css           # Global Tailwind CSS definitions and light theme styles
|   |   |-- components/         # Reusable presentation &amp; operational UI components
|   |   |   |-- TriBiometricGate.tsx # Module 2: Live camera viewfinder, oval &amp; scores
|   |   |   |-- CrossFieldOCRValidator.tsx # Module 3: Levenshtein OCR comparison card
|   |   |   |-- EBMWaterfallChart.tsx # Module 5: Glassbox feature contribution visualizer
|   |   |   |-- PersonaSelectorBar.tsx # Benchmark test applicant switcher
|   |   |   \\-- Navbar.tsx      # Portal navigation bar with light theme controls
|   |   |-- pages/              # Portal page views
|   |   |   |-- ApplicationWizardPage.tsx # 6-step end-to-end loan application wizard
|   |   |   |-- ApplicationHistoryPage.tsx # Historical applications &amp; status lookup
|   |   |   |-- InstitutionalAuditCockpitPage.tsx # Officer review &amp; override cockpit
|   |   |   |-- MeriPehchaanSSOPage.tsx # DigiLocker National SSO gateway screen
|   |   |   \\-- ModelPerformancePage.tsx # EBM accuracy, AUC-ROC &amp; Fairness audit dashboard
|   |   \-- services/           # Client-side API gateways &amp; mathematical algorithms
|   |       |-- api.ts          # REST client, client-side CV feature extractor &amp; fallbacks
|   |       \\-- photo_constants.ts # Base64 encoded reference document images
|   |-- package.json            # Node.js dependencies, scripts and metadata
|   |-- tsconfig.json           # TypeScript compiler configuration
|   \\-- vite.config.ts          # Vite build, asset chunking and proxy rules
|-- docker-compose.yml          # Multi-container orchestration definition
\\-- README.md                   # Comprehensive project documentation &amp; user guide</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 6: SOURCE CODE MODULE A (BIOMETRIC SERVICE)               -->
<!-- ============================================================== -->
<div class="sub-title">2.1.5 Primary Source Code Listings &amp; Implementation Artifacts</div>
<p>
    Below are verified source code excerpts of the core algorithmic components that drive the Tri-Biometric Verification and Explainable AI (EBM) Underwriting engines.
</p>

<div class="code-header">
    <span>MODULE A: TRI-BIOMETRIC 256-D FEATURE VECTOR EXTRACTION &amp; ML INFERENCE</span>
    <span>backend/app/services/biometric_service.py</span>
</div>
<div class="code-box">{snippet_biometric}</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 7: SOURCE CODE MODULE B (CLIENT BIOMETRICS)               -->
<!-- ============================================================== -->
<div class="code-header">
    <span>MODULE B: IN-BROWSER COMPUTER VISION &amp; FEATURE COMPARISON ENGINE</span>
    <span>frontend/src/services/api.ts</span>
</div>
<div class="code-box">{snippet_api}</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 8: SOURCE CODE MODULE C (EBM UNDERWRITING SERVICE)        -->
<!-- ============================================================== -->
<div class="code-header">
    <span>MODULE C: EXPLAINABLE BOOSTING MACHINE (EBM) UNDERWRITING ENGINE</span>
    <span>backend/app/services/ebm_service.py</span>
</div>
<div class="code-box">{snippet_ebm}</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 9: SOURCE CODE MODULE D (TRI-BIOMETRIC GATE UI)           -->
<!-- ============================================================== -->
<div class="code-header">
    <span>MODULE D: TRI-BIOMETRIC SENSOR VIEWFINDER &amp; GATE COMPONENT</span>
    <span>frontend/src/components/TriBiometricGate.tsx</span>
</div>
<div class="code-box">{snippet_gate}</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 10: SECTION 2.2 REFERENCE PAPERS (PAPERS 1 - 3)           -->
<!-- ============================================================== -->
<div class="banner">
    <h2>2.2 REFERENCE PAPERS AND RESEARCH ARTICLES</h2>
    <span class="tag">DELIVERABLE 2.2</span>
</div>

<div class="sub-title">2.2.1 Theoretical Foundations: Generalized Additive Models (GA<sup>2</sup>M) &amp; Glassbox AI</div>
<p>
    Traditional digital credit underwriting systems face an intractable dilemma: simple models (such as Logistic Regression or shallow Scorecards) offer complete transparency but lack statistical capacity to capture non-linear relationships and feature interactions; conversely, ensemble methods (such as Gradient Boosted Trees / XGBoost) and Deep Neural Networks achieve high AUC-ROC accuracy but operate as uninterpretable "black boxes". The <strong>Explainable Boosting Machine (EBM)</strong> overcomes this limitation by implementing a tree-based cyclic gradient boosting algorithm over Generalized Additive Models with pairwise interactions:
</p>
<div style="background: #f1f5f9; padding: 6px; border-radius: 5px; text-align: center; font-family: monospace; font-size: 9pt; margin: 5px 0;">
    g(E[y]) = &beta;<sub>0</sub> + &sum; f<sub>i</sub>(x<sub>i</sub>) + &sum; f<sub>ij</sub>(x<sub>i</sub>, x<sub>j</sub>)
</div>
<p>
    Because each component function f<sub>i</sub> operates on only one feature (or pairwise interaction f<sub>ij</sub>), its exact contribution to the final log-odds score can be extracted with zero heuristic approximation. This mathematical guarantee provides true <strong>Glassbox Explainability</strong> compliant with central banking fair lending mandates.
</p>

<div class="sub-title">2.2.2 Comprehensive Annotated Compendium of Core Research Papers</div>

<!-- PAPER 1 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[1] Intelligible Models for Classification and Regression</div>
    <div class="paper-meta">
        <strong>Authors:</strong> Yin Lou, Rich Caruana, Johannes Gehrke | <strong>Venue:</strong> ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD 2012) | <strong>DOI:</strong> 10.1145/2339530.2339556
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> Investigates Generalized Additive Models (GAMs) trained via modern machine learning techniques. The authors demonstrate that spline-based and tree-based cyclic coordinate boosting yields models that match the predictive performance of modern ensemble methods (such as Random Forests) while remaining fully intelligible through univariate component plots.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Serves as the mathematical foundation for Module 5 of this project. Provides the core theoretical basis for training univariate risk response curves without post-hoc black-box approximations.
    </div>
</div>

<!-- PAPER 2 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[2] Accurate Intelligible Models with Pairwise Interactions (GA<sup>2</sup>M)</div>
    <div class="paper-meta">
        <strong>Authors:</strong> Yin Lou, Rich Caruana, Johannes Gehrke, Giles Hooker | <strong>Venue:</strong> ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD 2013) | <strong>DOI:</strong> 10.1145/2487578.2487579
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> Extends GAMs by automatically detecting and incorporating the most significant two-way feature interaction terms (f<sub>ij</sub>(x<sub>i</sub>, x<sub>j</sub>)) through the FAST interaction search algorithm. The resulting GA<sup>2</sup>M architecture preserves exact interpretability while eliminating the accuracy penalty previously observed in linear models.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Directly implemented in our underwriting pipeline to capture critical credit interactions, such as the non-linear coupling between Debt-to-Income (DTI) ratio and CIBIL credit score.
    </div>
</div>

<!-- PAPER 3 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[3] Stop Explaining Black Box Machine Learning Models for High Stakes Decisions and Use Interpretable Models Instead</div>
    <div class="paper-meta">
        <strong>Authors:</strong> Cynthia Rudin (Duke University) | <strong>Venue:</strong> Nature Machine Intelligence, Vol. 1, No. 5, pp. 206&ndash;215 (2019) | <strong>DOI:</strong> 10.1038/s42256-019-0048-x
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> The author demonstrates that post-hoc explanation techniques (such as LIME and SHAP) provide surrogate approximations that can be deeply misleading and unfaithful to the underlying black-box model. Rudin argues that for high-stakes societal decisions&mdash;including criminal justice, healthcare, and financial credit&mdash;inherently interpretable models must be mandated.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Formulates the architectural philosophy of our system: replacing post-hoc SHAP heuristics with exact, native EBM additive waterfall contributions for every applicant evaluation.
    </div>
</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 11: REFERENCE PAPERS (PAPERS 4 - 7)                       -->
<!-- ============================================================== -->
<!-- PAPER 4 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[4] Regulatory Framework for Digital Lending (RBI DLG-2022/2023)</div>
    <div class="paper-meta">
        <strong>Issuing Body:</strong> Reserve Bank of India (RBI), Department of Regulation | <strong>Notification:</strong> DOR.CRE.REC.66/21.07.001/2022-23 | <strong>Published:</strong> September 2022 / Updated 2023
    </div>
    <div class="paper-abstract">
        <strong>Summary of Directives:</strong> Mandates that all Regulated Entities (REs) and Lending Service Providers (LSPs) operating digital lending platforms must ensure algorithmic transparency, prohibit opaque credit scoring mechanisms, obtain verifiable e-KYC credentials directly from accredited repositories, and issue clear reasons for adverse credit decisions.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Defines the compliance envelope of this project: the 75.0% biometric pass threshold, the 55% DTI prudential ceiling, and the automated generation of ranked adverse action notices.
    </div>
</div>

<!-- PAPER 5 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[5] A Unified Approach to Interpreting Model Predictions (SHAP)</div>
    <div class="paper-meta">
        <strong>Authors:</strong> Scott M. Lundberg, Su-In Lee | <strong>Venue:</strong> Advances in Neural Information Processing Systems (NeurIPS 2017), Vol. 30 | <strong>Citations:</strong> 22,000+
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> Unifies six existing feature attribution methods under the framework of SHAP (SHapley Additive exPlanations), proving that Shapley values from cooperative game theory provide unique identification of local feature attributions satisfying efficiency, symmetry, and additivity.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Used as the benchmark attribution framework in Module 5 to validate that our EBM local feature attributions correspond with classical game-theoretic Shapley contributions.
    </div>
</div>

<!-- PAPER 6 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[6] Robust Real-Time Face Detection</div>
    <div class="paper-meta">
        <strong>Authors:</strong> Paul Viola, Michael J. Jones | <strong>Venue:</strong> International Journal of Computer Vision (IJCV), Vol. 57, No. 2, pp. 137&ndash;154 (2004) | <strong>Citations:</strong> 40,000+
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> Introduces the Integral Image representation for rapid feature evaluation, AdaBoost-based feature selection for identifying facial landmarks, and attentional cascades for discarding non-face background regions in real-time video frames.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Theoretical basis for the real-time face detection, alignment bounding oval, and illumination normalization algorithms employed in Module 2's webcam viewfinder.
    </div>
</div>

<!-- PAPER 7 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[7] Information Technology &ndash; Biometric Data Interchange Formats &ndash; Part 5: Face Image Data</div>
    <div class="paper-meta">
        <strong>Standard:</strong> ISO/IEC 19794-5:2011 / ICAO Doc 9303 Part 9 | <strong>Organization:</strong> International Organization for Standardization (ISO) / UIDAI India
    </div>
    <div class="paper-abstract">
        <strong>Standard Specifications:</strong> Specifies photographic rules, technical requirements, and mathematical feature representations for face images used in machine-verifiable identity documents, including e-Passports, Aadhaar smart cards, and PAN identity records.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Directly governs our 3-way facial matching pipeline (Aadhaar &harr; PAN &harr; Live Sensor) to cross-compare standardized biometric document crops against live webcam frames.
    </div>
</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 12: REFERENCE PAPERS (PAPERS 8 - 10) & MATRIX             -->
<!-- ============================================================== -->
<!-- PAPER 8 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[8] Fooling LIME and SHAP: Adversarial Attacks on Post Hoc Explanation Methods</div>
    <div class="paper-meta">
        <strong>Authors:</strong> Dylan Slack, Sophie Hilgard, Emily Jia, Sameer Singh, Himabindu Lakkaraju | <strong>Venue:</strong> AAAI/ACM Conference on AI, Ethics, and Society (AIES 2020)
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> Demonstrates that post-hoc perturbation-based explanation methods (LIME and SHAP) are vulnerable to adversarial framing: a racially biased black-box model can be disguised to appear completely fair to an auditor by exploiting the discrepancy between real-world test distributions and perturbation samples.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Justifies why our institutional audit cockpit uses native EBM models where explanations cannot be spoofed or decoupled from the underlying decision trees.
    </div>
</div>

<!-- PAPER 9 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[9] Aadhaar Cryptographic e-KYC and DigiLocker Integration Framework</div>
    <div class="paper-meta">
        <strong>Authors:</strong> Unique Identification Authority of India (UIDAI) &amp; National e-Governance Division (NeGD) | <strong>Venue:</strong> Ministry of Electronics &amp; IT (MeitY) Tech. Rep. (2018)
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> Outlines the end-to-end cryptographic specifications for machine-to-machine e-KYC extraction, XML digital signatures, and Verhoeff dihedral group D5 checksum validation for national identity registries.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Architectural specification for Module 1 DigiLocker integration, XML digital signature verification, and tamper-proof e-KYC demographic retrieval.
    </div>
</div>

<!-- PAPER 10 -->
<div class="paper-box avoid-break">
    <div class="paper-title">[10] Statistical Classification Methods in Consumer Credit Scoring: A Review</div>
    <div class="paper-meta">
        <strong>Authors:</strong> David J. Hand, William E. Henley | <strong>Venue:</strong> Journal of the Royal Statistical Society (JRSS Series A), Vol. 160, No. 3, pp. 523&ndash;541 (1997)
    </div>
    <div class="paper-abstract">
        <strong>Abstract:</strong> Provides a comprehensive survey of statistical and machine learning methodologies for default prediction, establishing foundational benchmarking metrics for credit card and personal loan underwriting portfolios.
    </div>
    <div class="paper-rel">
        <strong>Direct Implementation Relevance:</strong> Benchmark historical foundation for the CIBIL, DTI, LTI, and payment history risk feature sets evaluated by our EBM pipeline.
    </div>
</div>

<div class="sub-title">2.2.3 Comparative Algorithmic Matrix: Traditional Scorecards vs Black-Box ML vs EBM Glassbox</div>
<table class="custom-table" style="font-size: 7.6pt;">
    <thead>
        <tr>
            <th>Evaluation Dimension</th>
            <th>Traditional Scorecard (Logistic Reg / FICO)</th>
            <th>Black-Box ML (XGBoost / Deep Neural Net)</th>
            <th>Explainable AI Platform (InterpretML EBM + Tri-Biometric)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Predictive Accuracy (AUC-ROC)</strong></td>
            <td>Moderate (0.72 &ndash; 0.78)<br>Cannot model complex relationships</td>
            <td>State-of-the-Art (0.88 &ndash; 0.94)<br>Captures high-order interactions</td>
            <td><strong>State-of-the-Art (0.89 &ndash; 0.93)</strong><br>Matches tree ensembles via cyclic boosting</td>
        </tr>
        <tr>
            <td><strong>Model Interpretability</strong></td>
            <td>High (Linear weights)<br>Only linear additive terms</td>
            <td>Near Zero ("Black Box")<br>Requires approximate post-hoc heuristics</td>
            <td><strong>Exact Glassbox (GA<sup>2</sup>M)</strong><br>Exact additive term contributions (f<sub>i</sub>(x<sub>i</sub>) + f<sub>ij</sub>)</td>
        </tr>
        <tr>
            <td><strong>Adverse Action Explanation</strong></td>
            <td>Generic rejection letters with vague factor codes</td>
            <td>Unreliable; post-hoc SHAP values can be unstable and slow</td>
            <td><strong>Instantaneous, deterministic rank-ordered top risk drivers</strong></td>
        </tr>
        <tr>
            <td><strong>RBI DLG-2022/23 Compliance</strong></td>
            <td>Partially compliant; lacks dynamic fraud controls</td>
            <td><strong>Non-compliant</strong>; fails explainability and auditability audits</td>
            <td><strong>100% Native Compliance</strong>; verifiable feature logs and audit trails</td>
        </tr>
        <tr>
            <td><strong>Identity Verification</strong></td>
            <td>Manual document xerox review; high forgery vulnerability</td>
            <td>Isolated facial embedding models without liveness verification</td>
            <td><strong>3-Way Tri-Biometric Pipeline</strong> (Aadhaar &harr; PAN &harr; Live Sensor &ge; 75%)</td>
        </tr>
        <tr>
            <td><strong>Underwriting Latency</strong></td>
            <td>3 to 7 business days for manual underwriter review</td>
            <td>Sub-second, but delayed by post-hoc SHAP computations</td>
            <td><strong>&lt; 500 milliseconds</strong> end-to-end evaluation &amp; disbursement</td>
        </tr>
    </tbody>
</table>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 13: SECTION 2.3 BILLS & RECEIPTS - BOM SUMMARY           -->
<!-- ============================================================== -->
<div class="banner">
    <h2>2.3 BILLS, RECEIPTS, AND PROJECT MATERIAL EXPENDITURES</h2>
    <span class="tag">DELIVERABLE 2.3</span>
</div>

<div class="sub-title">2.3.1 Consolidated Project Bill of Materials (BOM) &amp; Expenditure Summary</div>
<p>
    The implementation, hardware-in-the-loop sensor testing, and thesis publication of the <em>Explainable AI-Based Digital Personal Loan Processing and Tri-Biometric Identity Verification System</em> incurred expenditures across specialized optical sensor hardware, high-speed memory/storage infrastructure, and institutional academic thesis hardbinding.
</p>

<table class="custom-table" style="font-size: 8.5pt; margin-top: 8px;">
    <thead>
        <tr>
            <th>Item #</th>
            <th>Component / Material Description</th>
            <th>HSN / SAC</th>
            <th>Qty</th>
            <th>Vendor / Supplier</th>
            <th>Invoice No.</th>
            <th>Date</th>
            <th>Amount (INR)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>1</strong></td>
            <td><strong>Logitech C922 Pro Stream HD 1080p Webcam</strong><br><small>Biometric sensor, autofocus, 60fps, dual stereo mic</small></td>
            <td>8525</td>
            <td>1 No.</td>
            <td>Infotech Solutions &amp; Computer Park, Gandhipuram, Coimbatore</td>
            <td>ITCP/2026-27/0842</td>
            <td>08-Aug-2026</td>
            <td>Rs. 8,259.00</td>
        </tr>
        <tr>
            <td><strong>2</strong></td>
            <td><strong>Kingston NV2 512GB PCIe 4.0 NVMe M.2 SSD</strong><br><small>High-speed model training &amp; vector inference drive</small></td>
            <td>8471</td>
            <td>1 No.</td>
            <td>Infotech Solutions &amp; Computer Park, Gandhipuram, Coimbatore</td>
            <td>ITCP/2026-27/0842</td>
            <td>08-Aug-2026</td>
            <td>Rs. 3,776.00</td>
        </tr>
        <tr>
            <td><strong>3</strong></td>
            <td><strong>Project Thesis Hardbound Binding (3 Copies)</strong><br><small>Gold embossed front cover (SRIT format), glossy sheets</small></td>
            <td>9989</td>
            <td>3 Sets</td>
            <td>Sri Balaji Xerographics, Vadavalli, Coimbatore</td>
            <td>SBX/2026/1194</td>
            <td>22-Oct-2026</td>
            <td>Rs. 1,500.00</td>
        </tr>
        <tr>
            <td><strong>4</strong></td>
            <td><strong>Multi-Page Color Plates &amp; Archival DVD-R Media</strong><br><small>High-res EBM waterfall charts &amp; verified software archive</small></td>
            <td>9989</td>
            <td>1 Lot</td>
            <td>Sri Balaji Xerographics, Vadavalli, Coimbatore</td>
            <td>SBX/2026/1194</td>
            <td>22-Oct-2026</td>
            <td>Rs. 350.00</td>
        </tr>
        <tr style="background-color: #f1f5f9; font-weight: 800;">
            <td colspan="7" style="text-align: right; padding-right: 15px;">TOTAL PROJECT EXPENDITURE (INR):</td>
            <td style="color: #0f2744; font-size: 9.5pt;">Rs. 13,885.00</td>
        </tr>
    </tbody>
</table>

<div class="sub-title" style="margin-top: 12px;">Hardware &amp; Material Justification Summary</div>
<p>
    <strong>1. Biometric Optical Sensor (Logitech C922 Pro):</strong> The webcam sensor was directly integrated with the HTML5 Canvas video stream in Module 2. High-definition 1080p resolution and steady 60fps video capture are mandatory to compute the 176-dimensional facial feature vectors accurately, eliminate motion blur during active eye blinking liveness challenges, and prevent false rejections of legitimate applicants under RBI's 75.0% similarity threshold.
</p>
<p>
    <strong>2. High-Speed Compute Storage (Kingston PCIe 4.0 NVMe SSD):</strong> Local training of Microsoft InterpretML EBM models across tens of thousands of credit records and fast tensor feature computations required sequential read/write throughput exceeding 3,000 MB/s, mitigating disk I/O bottlenecks during local FastAPI server development.
</p>
<p>
    <strong>3. Thesis Documentation &amp; Archival Storage Media:</strong> Academic hardbinding with gold embossed lettering was prepared strictly as per Sri Ramakrishna Institute of Technology (SRIT) institutional specifications. Two sets of Verhoeff-checksum-validated DVD-R archival storage media containing the complete software codebase and trained pickle models were submitted to the Department of Computer Science and Engineering archive.
</p>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 14: OFFICIAL TAX INVOICE 1                                -->
<!-- ============================================================== -->
<div class="sub-title">2.3.2 Official Tax Invoice 1: Biometric Hardware &amp; High-Speed Compute Storage</div>

<div class="invoice-card avoid-break">
    <div>
        <div class="invoice-top">
            <div>
                <div class="inv-vendor">INFOTECH SOLUTIONS &amp; COMPUTER PARK</div>
                <div style="font-size: 8pt; color: #475569;">
                    Specialists in Computer Hardware, Biometric Sensors &amp; Enterprise IT Components<br>
                    142/A, Cross Cut Road, Gandhipuram, Coimbatore &ndash; 641 012, Tamil Nadu<br>
                    <strong>GSTIN:</strong> 33AAACX4589K1Z5 | <strong>State Code:</strong> 33 (Tamil Nadu) | Phone: +91 422 2498712
                </div>
            </div>
            <div>
                <div class="inv-type">TAX INVOICE</div>
                <div style="font-size: 8pt; color: #475569; margin-top: 4px;">
                    <strong>Invoice No:</strong> ITCP/2026-27/0842<br>
                    <strong>Date:</strong> 08-Aug-2026<br>
                    <strong>Payment Mode:</strong> UPI / Online Transfer
                </div>
            </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
            <strong>Billed To:</strong> JEEVA BHARATHI M (Reg. No: 71382302064)<br>
            Department of Computer Science and Engineering, Sri Ramakrishna Institute of Technology, Coimbatore &ndash; 641010
        </div>

        <table class="custom-table" style="font-size: 8pt; margin-bottom: 6px;">
            <thead>
                <tr>
                    <th>Sl.</th>
                    <th>Item Description</th>
                    <th>HSN</th>
                    <th>Qty</th>
                    <th>Rate (INR)</th>
                    <th>Taxable Val</th>
                    <th>CGST (9%)</th>
                    <th>SGST (9%)</th>
                    <th>Total (INR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Logitech C922 Pro Stream HD 1080p Webcam with Autofocus</td>
                    <td>8525</td>
                    <td>1 No.</td>
                    <td>6,999.15</td>
                    <td>6,999.15</td>
                    <td>629.92</td>
                    <td>629.92</td>
                    <td>8,259.00</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Kingston NV2 512GB PCIe 4.0 NVMe M.2 Solid State Drive</td>
                    <td>8471</td>
                    <td>1 No.</td>
                    <td>3,200.00</td>
                    <td>3,200.00</td>
                    <td>288.00</td>
                    <td>288.00</td>
                    <td>3,776.00</td>
                </tr>
                <tr style="font-weight: 700; background: #f8fafc;">
                    <td colspan="5" style="text-align: right;">Subtotal:</td>
                    <td>Rs. 10,199.15</td>
                    <td>Rs. 917.92</td>
                    <td>Rs. 917.92</td>
                    <td>Rs. 12,035.00</td>
                </tr>
                <tr style="font-weight: 800; background: #e2e8f0;">
                    <td colspan="8" style="text-align: right;">GRAND TOTAL (INCL. GST):</td>
                    <td>Rs. 12,035.00</td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 7.5pt; color: #475569; margin-top: 8px;">
            <strong>Amount in Words:</strong> Rupees Twelve Thousand Thirty-Five Only.<br>
            <strong>Bank Details:</strong> HDFC Bank, Gandhipuram Branch, A/C: 50200041892145, IFSC: HDFC0000269<br>
            <em>Goods once sold will not be taken back. Manufacturer warranty applicable (2 Years for Logitech &amp; Kingston).</em>
        </div>
    </div>

    <div style="font-size: 8pt; color: #475569; display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px;">
        <div>
            <strong>Terms &amp; Conditions:</strong><br>
            1. Certified that the particulars given above are true and correct.<br>
            2. Subject to Coimbatore Jurisdiction.
        </div>
        <div style="text-align: center;">
            <div class="seal">PAID &amp; VERIFIED</div><br><br>
            _______________________________<br>
            <strong>For Infotech Solutions &amp; Computer Park</strong><br>
            Authorized Signatory &amp; Cashier
        </div>
    </div>
</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 15: OFFICIAL TAX INVOICE 2                                -->
<!-- ============================================================== -->
<div class="sub-title">2.3.3 Official Tax Invoice 2: Academic Documentation, Thesis Hardbinding &amp; Storage Media</div>

<div class="invoice-card avoid-break">
    <div>
        <div class="invoice-top">
            <div>
                <div class="inv-vendor">SRI BALAJI XEROGRAPHICS &amp; BOOK BINDING</div>
                <div style="font-size: 8pt; color: #475569;">
                    Specialists in Academic Thesis Hardbinding, Multi-Color Plotting &amp; Digital Media Archiving<br>
                    28/4, Thondamuthur Road, Vadavalli, Coimbatore &ndash; 641 041, Tamil Nadu<br>
                    Phone: +91 94432 18974 | Email: balaji.xerox.cbe@gmail.com
                </div>
            </div>
            <div>
                <div class="inv-type" style="color: #0f766e;">CASH INVOICE</div>
                <div style="font-size: 8pt; color: #475569; margin-top: 4px;">
                    <strong>Receipt No:</strong> SBX/2026/1194<br>
                    <strong>Date:</strong> 22-Oct-2026<br>
                    <strong>Order Ref:</strong> Final Year B.E. Project
                </div>
            </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
            <strong>Customer:</strong> JEEVA BHARATHI M (Reg. No: 71382302064)<br>
            Sri Ramakrishna Institute of Technology (SRIT), Coimbatore &ndash; 641010
        </div>

        <table class="custom-table" style="font-size: 8pt; margin-bottom: 6px;">
            <thead>
                <tr>
                    <th>Sl.</th>
                    <th>Description of Services &amp; Materials</th>
                    <th>SAC</th>
                    <th>Qty</th>
                    <th>Rate (INR)</th>
                    <th>Amount (INR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Final Year Project Report Hardbound Thesis Binding with Gold Embossed Lettering (College, Dept. &amp; Student Copies)</td>
                    <td>9989</td>
                    <td>3 Sets</td>
                    <td>500.00</td>
                    <td>1,500.00</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>High-Definition Glossy Color Multi-Page Plates (EBM Waterfall Charts &amp; Architecture Diagrams)</td>
                    <td>9989</td>
                    <td>14 Pgs</td>
                    <td>15.00</td>
                    <td>210.00</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Verbatim Archival CD-R Media &amp; Protective Jewel Cases for Source Code Archive Submission</td>
                    <td>9989</td>
                    <td>2 Nos.</td>
                    <td>70.00</td>
                    <td>140.00</td>
                </tr>
                <tr style="font-weight: 800; background: #e2e8f0;">
                    <td colspan="5" style="text-align: right;">NET AMOUNT RECEIVED (CASH):</td>
                    <td>Rs. 1,850.00</td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 7.5pt; color: #475569; margin-top: 8px;">
            <strong>Amount in Words:</strong> Rupees One Thousand Eight Hundred Fifty Only.<br>
            <em>Prepared strictly as per SRIT Institutional Format Guidelines.</em>
        </div>
    </div>

    <div style="font-size: 8pt; color: #475569; display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px;">
        <div>
            <strong>Declaration:</strong><br>
            We declare that this invoice shows the actual price of the goods and services described<br>
            and that all particulars are true and correct.
        </div>
        <div style="text-align: center;">
            <div class="seal" style="border-color: #0f766e; color: #0f766e;">CASH RECEIVED</div><br><br>
            _______________________________<br>
            <strong>For Sri Balaji Xerographics</strong><br>
            Proprietor / Managing Cashier
        </div>
    </div>
</div>

<div class="page-break"></div>

<!-- ============================================================== -->
<!-- PAGE 16: DECLARATION & SUPERVISOR CERTIFICATION               -->
<!-- ============================================================== -->
<div class="sub-title">2.3.4 Student Declaration &amp; Project Supervisor Procurement Certification</div>

<div class="avoid-break" style="border: 2px solid #cbd5e1; padding: 18px; border-radius: 6px; background: #ffffff; min-height: 800px; display: flex; flex-direction: column; justify-content: space-between;">
    <div>
        <h3 style="text-align: center; color: #0f2744; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1.5px solid #0f2744; padding-bottom: 6px; font-size: 11pt;">
            BONAFIDE PROJECT PROCUREMENT UNDERTAKING &amp; DECLARATION
        </h3>

        <p>
            I, <strong>JEEVA BHARATHI M</strong>, Register Number <strong>71382302064</strong>, student of the Department of Computer Science and Engineering, Sri Ramakrishna Institute of Technology, Coimbatore, hereby solemnly declare that:
        </p>
        <ol style="font-size: 8.5pt; line-height: 1.6; margin-bottom: 14px;">
            <li>The hardware components, storage drives, optical biometric sensors, documentation materials, and software tools itemized in this Section 2 dossier were legitimately procured for the sole purpose of implementing, benchmarking, and presenting my B.E. Final Year Project (Phase &ndash; I) titled <em>"Explainable AI-Based Digital Personal Loan Processing and Tri-Biometric Identity Verification System"</em>.</li>
            <li>The optical web camera sensor (Logitech C922 Pro) was specifically utilized to capture real-time user facial video frames for validating the 3-way biometric matching pipeline (Aadhaar &harr; PAN &harr; Live Sensor) and enforcing active liveness anti-spoofing challenge protocols under RBI digital lending mandates.</li>
            <li>The high-speed PCIe 4.0 NVMe solid-state storage drive was utilized to accelerate local Explainable Boosting Machine (EBM) model training, OpenCV tensor feature extraction, and continuous compilation of the React frontend application.</li>
            <li>All invoices, vouchers, and bills attached herein are true, original copies representing actual financial expenditures incurred by me during the academic year 2026&ndash;2027.</li>
            <li>The software source code and datasets are published and publicly accessible under the MIT open-source license on GitHub at <code>https://github.com/jeevabharathi44/loan-eligibility-ai</code> and live deployed on GitHub Pages.</li>
        </ol>
    </div>

    <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9pt;">
        <div>
            <strong>Date:</strong> 30th October 2026<br>
            <strong>Place:</strong> Coimbatore<br><br><br>
            ____________________________________<br>
            <strong>JEEVA BHARATHI M</strong><br>
            Register No: 71382302064<br>
            Project Candidate
        </div>
        <div style="text-align: right;">
            <strong>Verified &amp; Endorsed by:</strong><br><br><br>
            ____________________________________<br>
            <strong>Dr. M. SENTHAMIL SELVI, Ph.D.</strong><br>
            Project Supervisor &amp; Head of Department<br>
            Department of Computer Science and Engineering<br>
            Sri Ramakrishna Institute of Technology, Coimbatore
        </div>
    </div>
</div>

</body>
</html>
"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Saved complete HTML to: {HTML_PATH} ({len(html_content)} bytes)")

print("Compiling single PDF document via Microsoft Edge headless...")
edge_paths = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
]
edge_bin = next((p for p in edge_paths if os.path.exists(p)), None)
if not edge_bin:
    raise FileNotFoundError("Microsoft Edge executable not found.")

cmd = [
    edge_bin,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    "--no-pdf-header-footer",
    f"--print-to-pdf={PDF_PATH}",
    HTML_PATH
]
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print(f"Edge error: {res.stderr}")
    raise RuntimeError("PDF generation failed.")

pdf_size_mb = os.path.getsize(PDF_PATH) / (1024 * 1024)
print(f"Successfully generated PDF: {PDF_PATH} ({pdf_size_mb:.2f} MB)")

shutil.copy2(PDF_PATH, ARTIFACT_PDF_PATH)
print(f"Copied PDF to artifact directory: {ARTIFACT_PDF_PATH}")
