"""
HydroGuard-XAI - Explainable AI-Based River Pollution Risk Prediction System
FastAPI Backend Application Entrypoint (Production & Cloud Ready)
"""

import sys
import os

# Ensure backend directory and root directory are on python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from api.routes import router as api_router

app = FastAPI(
    title="HydroGuard-XAI API",
    description="Explainable AI Framework for Early River Pollution Risk Prediction & Actionable Environmental Intelligence",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Origins
cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
if cors_origins_env.strip() == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router, prefix="/api", tags=["HydroGuard-XAI Core API"])

# Check for compiled static frontend build directory
# Checks common relative production locations: frontend/dist, ../frontend/dist, ./dist
dist_candidates = [
    os.path.join(ROOT_DIR, "frontend", "dist"),
    os.path.join(CURRENT_DIR, "dist"),
    os.path.join(CURRENT_DIR, "static"),
]

dist_dir = None
for candidate in dist_candidates:
    if os.path.isdir(candidate) and os.path.isfile(os.path.join(candidate, "index.html")):
        dist_dir = candidate
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Ignore API, Docs, OpenAPI routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        # Check if a specific file exists in dist
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Default to index.html for SPA client-side routing
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "system": "HydroGuard-XAI",
            "subtitle": "Explainable AI for Early River Pollution Risk Prediction",
            "version": "1.0.0",
            "status": "online",
            "docs": "/docs",
            "endpoints": {
                "predict": "POST /api/predict",
                "stations": "GET /api/stations",
                "trends": "GET /api/trends/{location}?range=30d",
                "alerts": "GET /api/alerts",
                "scenarios": "GET /api/scenarios",
                "health": "GET /api/health",
                "simulate_stream": "POST /api/simulate-stream"
            }
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
