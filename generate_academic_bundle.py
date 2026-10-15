# generate_academic_bundle.py
# Part 1: Styling and IEEE Conference Paper
import os
import sys
import subprocess
import shutil

print("Initializing Academic Bundle Generator...")

CSS_STYLES = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

@page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @bottom-center {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 9pt;
        color: #64748b;
    }
}

body {
    margin: 0;
    padding: 0;
    color: #0f172a;
    background-color: #ffffff;
    font-size: 10.5pt;
    line-height: 1.6;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
}

.page-break {
    page-break-before: always;
}

/* =========================================================================
   IEEE CONFERENCE PAPER STYLING
   ========================================================================= */
.ieee-wrapper {
    font-family: 'Times New Roman', Times, Georgia, serif;
    color: #000000;
    line-height: 1.25;
    font-size: 10pt;
}

.ieee-title {
    text-align: center;
    font-size: 20pt;
    font-weight: bold;
    margin-bottom: 12px;
    line-height: 1.2;
    text-transform: capitalize;
}

.ieee-authors {
    text-align: center;
    font-size: 10.5pt;
    margin-bottom: 24px;
    line-height: 1.4;
}

.ieee-author-name {
    font-weight: bold;
    font-size: 11pt;
}

.ieee-columns {
    column-count: 2;
    column-gap: 7mm;
    column-rule: 0.5px solid #d1d5db;
    text-align: justify;
}

.ieee-abstract-box {
    margin-bottom: 14px;
    font-size: 9pt;
    line-height: 1.35;
    text-align: justify;
}

.ieee-abstract-heading {
    font-weight: bold;
    font-style: italic;
    display: inline;
}

.ieee-keywords {
    margin-top: 6px;
    font-size: 9pt;
}

.ieee-section-title {
    font-size: 10pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 14px;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
}

.ieee-subsection-title {
    font-size: 9.5pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 10px;
    margin-bottom: 4px;
}

.ieee-equation {
    text-align: center;
    margin: 8px 0;
    font-family: 'Crimson Pro', Georgia, serif;
    font-size: 10.5pt;
    background: #f8fafc;
    padding: 6px;
    border-radius: 4px;
    border-left: 2px solid #2563eb;
}

.ieee-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
    margin: 10px 0;
    font-family: 'Inter', sans-serif;
}

.ieee-table th {
    background: #1e293b;
    color: #ffffff;
    font-weight: 600;
    padding: 5px 6px;
    text-align: left;
    border: 1px solid #cbd5e1;
}

.ieee-table td {
    padding: 4px 6px;
    border: 1px solid #e2e8f0;
}

.ieee-table tr:nth-child(even) {
    background: #f8fafc;
}

.ieee-reference-item {
    font-size: 8pt;
    line-height: 1.35;
    margin-bottom: 4px;
    padding-left: 18px;
    text-indent: -18px;
}

/* =========================================================================
   COLLEGE PROJECT REPORT STYLING
   ========================================================================= */
.report-wrapper {
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    line-height: 1.7;
    font-size: 10.5pt;
}

.cover-page {
    text-align: center;
    min-height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 30px 10px;
}

.cover-title {
    font-size: 24pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.25;
    text-transform: uppercase;
    margin-top: 20px;
    margin-bottom: 15px;
}

.cover-subtitle {
    font-size: 13pt;
    font-weight: 600;
    color: #2563eb;
    margin-bottom: 40px;
}

.cover-badge {
    display: inline-block;
    padding: 6px 16px;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 10pt;
    margin-bottom: 25px;
}

.cover-meta {
    font-size: 11pt;
    color: #475569;
    margin: 30px 0;
    line-height: 1.8;
}

.chapter-header {
    margin-top: 35px;
    margin-bottom: 20px;
    border-bottom: 2.5px solid #2563eb;
    padding-bottom: 8px;
}

.chapter-number {
    font-size: 12pt;
    font-weight: 800;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.chapter-title {
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    margin-top: 4px;
    line-height: 1.2;
}

.sec-title {
    font-size: 14pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 24px;
    margin-bottom: 10px;
    border-left: 3.5px solid #059669;
    padding-left: 10px;
}

.subsec-title {
    font-size: 12pt;
    font-weight: 600;
    color: #334155;
    margin-top: 16px;
    margin-bottom: 8px;
}

.callout-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #2563eb;
    border-radius: 8px;
    padding: 14px 18px;
    margin: 16px 0;
    font-size: 10pt;
}

.callout-box.success {
    border-left-color: #059669;
    background: #f0fdf4;
}

.callout-box.warning {
    border-left-color: #d97706;
    background: #fffbeb;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin: 16px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.data-table th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 600;
    padding: 9px 12px;
    text-align: left;
    border: 1px solid #334155;
}

.data-table td {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
}

.data-table tr:nth-child(even) {
    background: #f8fafc;
}

.code-block {
    background: #0f172a;
    color: #f8fafc;
    padding: 14px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    line-height: 1.5;
    overflow-x: auto;
    margin: 14px 0;
    border: 1px solid #1e293b;
}

.badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 600;
}

.badge-pass {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
}

.badge-tech {
    background: #e0e7ff;
    color: #3730a3;
    border: 1px solid #c7d2fe;
}
</style>
"""

print("Loaded CSS Styles.")
