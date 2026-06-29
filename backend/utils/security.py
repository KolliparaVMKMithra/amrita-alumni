"""Security utilities — bcrypt, admin JWT, rate limiting helpers."""

import os
import time
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt
from fastapi import Request, HTTPException, Response
from dotenv import load_dotenv

# Find the backend directory dynamically and load of backend/.env
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path=env_path)  # No override=True to protect production env vars in Azure

def get_env_var_live(var_name: str, default: str = "") -> str:
    """Read a variable from .env file directly without modifying os.environ, falling back to os.environ."""
    if os.path.exists(env_path):
        try:
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() == var_name:
                            val = v.strip()
                            if val.startswith(('"', "'")) and val.endswith(('"', "'")):
                                val = val[1:-1]
                            return val
        except Exception:
            pass
    return os.getenv(var_name, default)

ADMIN_USERNAME = get_env_var_live("ADMIN_USERNAME", "alumni_admin")
ADMIN_PASSWORD_HASH = get_env_var_live("ADMIN_PASSWORD_HASH", "")
ADMIN_JWT_SECRET = get_env_var_live("ADMIN_JWT_SECRET", "change-this-secret-in-production")
ADMIN_JWT_EXPIRY_HOURS = 8
ADMIN_COOKIE_NAME = "admin_session"


def verify_admin_password(password: str) -> bool:
    """Verify admin password against bcrypt hash. Re-reads from env each call."""
    current_hash = get_env_var_live("ADMIN_PASSWORD_HASH", "")
    if not current_hash:
        return False
    return bcrypt.checkpw(
        password.encode("utf-8"),
        current_hash.encode("utf-8"),
    )


def create_admin_token() -> str:
    """Create a signed JWT for admin session."""
    payload = {
        "sub": ADMIN_USERNAME,
        "role": "admin",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=ADMIN_JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, ADMIN_JWT_SECRET, algorithm="HS256")


def verify_admin_token(token: str) -> dict | None:
    """Verify and decode admin JWT. Returns payload or None."""
    try:
        payload = jwt.decode(token, ADMIN_JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            return None
        return payload
    except JWTError:
        return None


def set_admin_cookie(response: Response, token: str):
    """Set httpOnly secure admin session cookie."""
    is_prod = os.getenv("ENVIRONMENT", "development") == "production"
    response.set_cookie(
        key=ADMIN_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="lax" if not is_prod else "strict",
        max_age=ADMIN_JWT_EXPIRY_HOURS * 3600,
        path="/",
    )


def clear_admin_cookie(response: Response):
    """Clear admin session cookie."""
    is_prod = os.getenv("ENVIRONMENT", "development") == "production"
    response.delete_cookie(
        key=ADMIN_COOKIE_NAME,
        httponly=True,
        secure=is_prod,
        samesite="lax" if not is_prod else "strict",
        path="/",
    )


async def require_admin(request: Request) -> dict:
    """FastAPI dependency to require admin authentication via cookie."""
    token = request.cookies.get(ADMIN_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    
    payload = verify_admin_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired admin session")
    
    return payload


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


USER_JWT_SECRET = os.getenv("USER_JWT_SECRET", "change-this-user-secret-in-production")
USER_JWT_EXPIRY_DAYS = 30


def create_user_token(user_id: str, email: str) -> str:
    """Create a signed JWT for a user session."""
    payload = {
        "sub": user_id,
        "email": email,
        "role": "user",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=USER_JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, USER_JWT_SECRET, algorithm="HS256")


def verify_user_token(token: str) -> dict | None:
    """Verify and decode user JWT. Returns payload or None."""
    try:
        payload = jwt.decode(token, USER_JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "user":
            return None
        return payload
    except JWTError:
        return None

