"""
HydroGuard-XAI - Unified Server Launcher
Launches FastAPI backend (port 8000) and Vite frontend (port 5173) simultaneously.
"""

import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 65)
    print("  Starting HydroGuard-XAI Full-Stack Platform")
    print("=" * 65)
    print("Backend:  http://127.0.0.1:8000 (FastAPI Swagger: http://127.0.0.1:8000/docs)")
    print("Frontend: http://localhost:5173")
    print("=" * 65)

    # Launch backend
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    # Launch frontend
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=True
    )

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Servers stopped.")

if __name__ == "__main__":
    main()
