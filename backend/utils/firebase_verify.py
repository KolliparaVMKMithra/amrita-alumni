"""Token verification middleware for backend user sessions."""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.utils.security import verify_user_token

security = HTTPBearer()


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify backend JWT token from Authorization header.
    
    Returns the decoded token with sub (uid), email, etc.
    """
    token = credentials.credentials
    payload = verify_user_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    return payload


async def get_current_user_uid(
    token_data: dict = Depends(verify_firebase_token),
) -> str:
    """Extract the user ID (stored in sub) from the verified token."""
    uid = token_data.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token: no user ID")
    return uid


async def get_current_user_email(
    token_data: dict = Depends(verify_firebase_token),
) -> str:
    """Extract the user email from the verified token."""
    email = token_data.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token: no email")
    return email

