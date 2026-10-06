"""
Helper script to package the loan-eligibility-ai project into a clean, distributable ZIP file.
Excludes node_modules, cache directories, and temporary files.
"""
import os
import zipfile

PROJECT_DIR = r"C:\Users\Jeeva\.gemini\antigravity\scratch\loan-eligibility-ai"
ZIP_OUTPUT_PATH = r"C:\Users\Jeeva\.gemini\antigravity\scratch\loan-eligibility-ai.zip"

EXCLUDE_DIRS = {
    'node_modules',
    '__pycache__',
    '.pytest_cache',
    '.git',
    '.turbo',
    '.next'
}

EXCLUDE_EXTS = {
    '.pyc',
    '.pyo',
    '.pyd',
    '.log'
}


def make_clean_zip(source_dir, output_zip):
    print(f"Creating zip file at: {output_zip}")
    total_files = 0
    total_bytes = 0

    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Modify dirs in-place to avoid walking into excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in EXCLUDE_EXTS:
                    continue
                if file.endswith('.zip'):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, os.path.dirname(source_dir))

                zipf.write(full_path, rel_path)
                total_files += 1
                total_bytes += os.path.getsize(full_path)

    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"Zip created successfully! Total files: {total_files}, Uncompressed size: {total_bytes / (1024*1024):.2f} MB, Compressed ZIP size: {zip_size_mb:.2f} MB")
    return output_zip


if __name__ == "__main__":
    make_clean_zip(PROJECT_DIR, ZIP_OUTPUT_PATH)
