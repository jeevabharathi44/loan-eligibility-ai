# -*- coding: utf-8 -*-
import os
import sys
import time
import socket
import subprocess
import threading
import webbrowser
import urllib.request
import tkinter as tk
from tkinter import messagebox, ttk

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:3000"

backend_process = None
frontend_process = None

def is_backend_healthy():
    try:
        resp = urllib.request.urlopen(f"{BACKEND_URL}/health", timeout=1.5)
        return resp.status == 200
    except:
        return False

def is_frontend_healthy():
    try:
        resp = urllib.request.urlopen(f"{FRONTEND_URL}/", timeout=1.5)
        return resp.status == 200
    except:
        return False

def start_backend():
    global backend_process
    if is_backend_healthy():
        return
    print("Starting FastAPI Backend...")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=BACKEND_DIR,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    )

def start_frontend():
    global frontend_process
    if is_frontend_healthy():
        return
    print("Starting React Frontend...")
    npm_bin = "npm.cmd" if os.name == "nt" else "npm"
    frontend_process = subprocess.Popen(
        [npm_bin, "run", "dev"],
        cwd=FRONTEND_DIR,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    )

def kill_process_on_port(port):
    if os.name == "nt":
        cmd = f"powershell -Command \"Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }}\""
        subprocess.run(cmd, shell=True, capture_output=True)

def stop_all_services():
    global backend_process, frontend_process
    if backend_process:
        try:
            backend_process.terminate()
        except:
            pass
        backend_process = None
    if frontend_process:
        try:
            frontend_process.terminate()
        except:
            pass
        frontend_process = None
    kill_process_on_port(8000)
    kill_process_on_port(3000)

class AppControlPanel:
    def __init__(self, root):
        self.root = root
        self.root.title("Smart Digital Lending System - Control Panel")
        self.root.geometry("560x440")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a")

        # Top Header Frame
        header = tk.Frame(root, bg="#1e293b", pady=14, padx=20)
        header.pack(fill="x")

        title_lbl = tk.Label(
            header,
            text="Smart Digital Lending System",
            font=("Segoe UI", 15, "bold"),
            fg="#38bdf8",
            bg="#1e293b"
        )
        title_lbl.pack(anchor="w")

        sub_lbl = tk.Label(
            header,
            text="SRIT CSE Viva Voce Demo • Automated KYC, Biometrics & Explainable AI",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#1e293b"
        )
        sub_lbl.pack(anchor="w", pady=(2, 0))

        # Status Card Frame
        status_card = tk.LabelFrame(
            root,
            text=" Service Status ",
            font=("Segoe UI", 10, "bold"),
            fg="#cbd5e1",
            bg="#1e293b",
            padx=15,
            pady=10
        )
        status_card.pack(fill="x", padx=20, pady=12)

        self.backend_status_lbl = tk.Label(
            status_card,
            text="FastAPI Backend (Port 8000): Checking...",
            font=("Segoe UI", 10),
            fg="#facc15",
            bg="#1e293b"
        )
        self.backend_status_lbl.pack(anchor="w", pady=2)

        self.frontend_status_lbl = tk.Label(
            status_card,
            text="React Frontend (Port 3000): Checking...",
            font=("Segoe UI", 10),
            fg="#facc15",
            bg="#1e293b"
        )
        self.frontend_status_lbl.pack(anchor="w", pady=2)

        # Actions Frame
        actions_frame = tk.Frame(root, bg="#0f172a", padx=20)
        actions_frame.pack(fill="both", expand=True)

        btn_style = {
            "font": ("Segoe UI", 10, "bold"),
            "relief": "flat",
            "cursor": "hand2",
            "pady": 6
        }

        # Row 1 Buttons
        r1 = tk.Frame(actions_frame, bg="#0f172a")
        r1.pack(fill="x", pady=4)

        btn_app = tk.Button(
            r1,
            text="🌐 Open Web Application (Port 3000)",
            bg="#0284c7",
            fg="#ffffff",
            activebackground="#0369a1",
            activeforeground="#ffffff",
            command=self.open_app,
            **btn_style
        )
        btn_app.pack(side="left", fill="x", expand=True, padx=(0, 6))

        btn_audit = tk.Button(
            r1,
            text="🛡️ Institutional Audit Cockpit",
            bg="#4f46e5",
            fg="#ffffff",
            activebackground="#4338ca",
            activeforeground="#ffffff",
            command=self.open_audit,
            **btn_style
        )
        btn_audit.pack(side="right", fill="x", expand=True, padx=(6, 0))

        # Row 2 Buttons
        r2 = tk.Frame(actions_frame, bg="#0f172a")
        r2.pack(fill="x", pady=4)

        btn_docs = tk.Button(
            r2,
            text="⚡ Backend API Docs (Swagger)",
            bg="#0d9488",
            fg="#ffffff",
            activebackground="#0f766e",
            activeforeground="#ffffff",
            command=self.open_docs,
            **btn_style
        )
        btn_docs.pack(side="left", fill="x", expand=True, padx=(0, 6))

        btn_perf = tk.Button(
            r2,
            text="📊 Model Performance & Metrics",
            bg="#059669",
            fg="#ffffff",
            activebackground="#047857",
            activeforeground="#ffffff",
            command=self.open_perf,
            **btn_style
        )
        btn_perf.pack(side="right", fill="x", expand=True, padx=(6, 0))

        # Row 3 Buttons: Restart and Exit
        r3 = tk.Frame(actions_frame, bg="#0f172a")
        r3.pack(fill="x", pady=(12, 0))

        btn_restart = tk.Button(
            r3,
            text="🔄 Restart Services",
            bg="#d97706",
            fg="#ffffff",
            activebackground="#b45309",
            activeforeground="#ffffff",
            command=self.restart_services,
            **btn_style
        )
        btn_restart.pack(side="left", fill="x", expand=True, padx=(0, 6))

        btn_stop = tk.Button(
            r3,
            text="🛑 Stop Services & Exit",
            bg="#dc2626",
            fg="#ffffff",
            activebackground="#b91c1c",
            activeforeground="#ffffff",
            command=self.on_closing,
            **btn_style
        )
        btn_stop.pack(side="right", fill="x", expand=True, padx=(6, 0))

        # Bottom info
        footer = tk.Label(
            root,
            text="Closing this window will cleanly shut down all local servers.",
            font=("Segoe UI", 8),
            fg="#64748b",
            bg="#0f172a",
            pady=8
        )
        footer.pack(side="bottom")

        # Handle window close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

        # Launch monitor thread
        self.running = True
        self.monitor_thread = threading.Thread(target=self.monitor_loop, daemon=True)
        self.monitor_thread.start()

        # Startup initial launch
        self.initial_spinup()

    def initial_spinup(self):
        def spinup():
            start_backend()
            start_frontend()
            for _ in range(15):
                if is_backend_healthy() and is_frontend_healthy():
                    break
                time.sleep(0.5)
            # Auto-open browser on first start
            webbrowser.open(FRONTEND_URL)

        t = threading.Thread(target=spinup, daemon=True)
        t.start()

    def monitor_loop(self):
        while self.running:
            b_ok = is_backend_healthy()
            f_ok = is_frontend_healthy()

            def update_ui(b=b_ok, f=f_ok):
                if b:
                    self.backend_status_lbl.config(
                        text="● FastAPI Backend: Running (http://127.0.0.1:8000)",
                        fg="#4ade80"
                    )
                else:
                    self.backend_status_lbl.config(
                        text="○ FastAPI Backend: Offline",
                        fg="#f87171"
                    )

                if f:
                    self.frontend_status_lbl.config(
                        text="● React Frontend: Running (http://localhost:3000)",
                        fg="#4ade80"
                    )
                else:
                    self.frontend_status_lbl.config(
                        text="○ React Frontend: Offline",
                        fg="#f87171"
                    )

            self.root.after(0, update_ui)
            time.sleep(2)

    def open_app(self):
        webbrowser.open(FRONTEND_URL)

    def open_audit(self):
        webbrowser.open(f"{FRONTEND_URL}/#/audit")

    def open_docs(self):
        webbrowser.open(f"{BACKEND_URL}/docs")

    def open_perf(self):
        webbrowser.open(f"{FRONTEND_URL}/#/performance")

    def restart_services(self):
        def do_restart():
            stop_all_services()
            time.sleep(1)
            start_backend()
            start_frontend()
            for _ in range(15):
                if is_backend_healthy() and is_frontend_healthy():
                    break
                time.sleep(0.5)
            webbrowser.open(FRONTEND_URL)

        t = threading.Thread(target=do_restart, daemon=True)
        t.start()

    def on_closing(self):
        self.running = False
        stop_all_services()
        self.root.destroy()
        sys.exit(0)

if __name__ == "__main__":
    root = tk.Tk()
    app = AppControlPanel(root)
    root.mainloop()
