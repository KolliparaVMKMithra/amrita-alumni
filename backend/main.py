import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv

from backend.routes import auth, profile, upload, admin
from backend.database import engine, Base

load_dotenv()

# Initialize Rate Limiter with proxy support
def get_real_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host or "127.0.0.1"

limiter = Limiter(key_func=get_real_client_ip, default_limits=["100/minute"])

app = FastAPI(
    title="Amrita University Alumni Portal",
    description="Backend API for the Amrita Alumni Portal",
    version="1.0.0",
)

# Apply Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Apply CORS
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=()"
    # Enforce HTTPS if we're not running locally
    if "localhost" not in str(request.base_url) and "127.0.0.1" not in str(request.base_url):
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Mount static files for local uploads fallback
from fastapi.staticfiles import StaticFiles
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(upload.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Amrita University Alumni Portal API"}

@app.on_event("startup")
async def startup_event():
    # Only for development, in production use Alembic.
    # Wrapped in try-except to prevent crash during concurrent startup in cloud.
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[STARTUP] Resilient database creation skipped or failed: {e}")
