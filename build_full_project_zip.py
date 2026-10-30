# -*- coding: utf-8 -*-
"""
Packages the complete Smart Digital Lending System project into a clean,
distributable ZIP file containing:
- Full Backend (FastAPI, OCR, DigiLocker integration, biometric matching)
- Full Frontend (React + Vite, prebuilt dist/, modern UI modules 1-6)
- ML Service (EBM Glass-Box Model, Tri-Biometric Model, Random Forest, Datasets)
- Complete Academic Materials:
    * 16-Slide Viva Voce Presentation (.pptx)
    * Viva Voce Speaker Notes & Defense Guide (.md)
    * SRIT / Anna University Phase-I Project Report (.pdf)
    * IEEE Research Paper (.pdf)
    * Project Dossier with Bills, Receipts & Research Literature (.pdf)
- 1-Click Launchers (launcher.py, start_app.bat, start.bat)
"""
import os
import sys
import zipfile
import shutil

SOURCE_DIR = r"C:\Users\Jeeva\.gemini\antigravity\scratch\loan-eligibility-ai"
ARTIFACT_DIR = r"C:\Users\Jeeva\.gemini\antigravity\brain\e905d853-ffc3-4e6a-aec2-a3c083d192f0"
DESKTOP_DIR = r"C:\Users\Jeeva\Desktop"

ZIP_NAME = "Smart_Digital_Lending_System_Full_Project.zip"

OUTPUT_WORKSPACE_ZIP = os.path.join(SOURCE_DIR, ZIP_NAME)
OUTPUT_ARTIFACT_ZIP = os.path.join(ARTIFACT_DIR, ZIP_NAME)
OUTPUT_DESKTOP_ZIP = os.path.join(DESKTOP_DIR, ZIP_NAME)

EXCLUDE_DIRS = {
    'node_modules',
    '__pycache__',
    '.pytest_cache',
    '.git',
    '.turbo',
    '.next',
    'venv',
    '.venv'
}

EXCLUDE_EXTS = {
    '.pyc',
    '.pyo',
    '.pyd',
    '.log',
    '.tmp'
}

def create_project_zip():
    print(f"Starting zip packaging from: {SOURCE_DIR}")
    
    total_files = 0
    total_uncompressed_bytes = 0
    
    # We will package into a root directory named 'Smart_Digital_Lending_System'
    archive_root = "Smart_Digital_Lending_System"
    
    with zipfile.ZipFile(OUTPUT_WORKSPACE_ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for root, dirs, files in os.walk(SOURCE_DIR):
            # In-place directory exclusion
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in EXCLUDE_EXTS:
                    continue
                if f.endswith('.zip'):  # do not re-zip existing zip files
                    continue
                if f == 'build_full_project_zip.py':
                    pass
                
                full_path = os.path.join(root, f)
                rel_to_source = os.path.relpath(full_path, SOURCE_DIR)
                arcname = os.path.join(archive_root, rel_to_source)
                
                zf.write(full_path, arcname)
                total_files += 1
                total_uncompressed_bytes += os.path.getsize(full_path)
    
    print(f"Testing zip archive integrity...")
    with zipfile.ZipFile(OUTPUT_WORKSPACE_ZIP, 'r') as zf:
        bad_file = zf.testzip()
        if bad_file:
            raise RuntimeError(f"Corrupt file found in zip: {bad_file}")
    
    zip_size_bytes = os.path.getsize(OUTPUT_WORKSPACE_ZIP)
    zip_size_mb = zip_size_bytes / (1024 * 1024)
    uncompressed_mb = total_uncompressed_bytes / (1024 * 1024)
    
    print(f"Archive verified cleanly!")
    print(f"Total files packaged: {total_files}")
    print(f"Uncompressed size: {uncompressed_mb:.2f} MB")
    print(f"Compressed size:   {zip_size_mb:.2f} MB")
    
    # Copy to Desktop and Artifacts Directory
    print(f"Copying to Desktop: {OUTPUT_DESKTOP_ZIP}")
    shutil.copy2(OUTPUT_WORKSPACE_ZIP, OUTPUT_DESKTOP_ZIP)
    
    print(f"Copying to Artifacts directory: {OUTPUT_ARTIFACT_ZIP}")
    shutil.copy2(OUTPUT_WORKSPACE_ZIP, OUTPUT_ARTIFACT_ZIP)
    
    print("All zip outputs successfully generated!")

if __name__ == "__main__":
    create_project_zip()
