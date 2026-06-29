"""Authentication routes — custom signup, login, sync-user."""
import uuid
import secrets
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models.user import User
from backend.models.alumni_profile import AlumniProfile
from backend.schemas.auth import (
    SignupRequest, LoginRequest, LoginResponse, SyncUserResponse, ForgotPasswordRequest
)
from backend.utils.security import (
    hash_password, verify_password, create_user_token
)
from backend.utils.email import send_reset_password_email
from backend.utils.firebase_verify import get_current_user_uid

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=LoginResponse)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    email = request.email.lower().strip()
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(400, "Account already exists with this email.")
        
    hashed = hash_password(request.password)
    user_id = uuid.uuid4()
    local_uid = f"local_{user_id.hex}"
    
    user = User(
        id=user_id,
        email=email,
        full_name=request.full_name,
        hashed_password=hashed,
        firebase_uid=local_uid,
        is_email_verified=True
    )
    db.add(user)
    await db.flush()
    
    profile = AlumniProfile(user_id=user.id, current_step=1)
    db.add(profile)
    await db.flush()
    
    token = create_user_token(str(user.id), user.email)
    return LoginResponse(access_token=token, message="Registration successful!")


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = request.email.lower().strip()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "Invalid email or password.")
        
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password.")
        
    token = create_user_token(str(user.id), user.email)
    return LoginResponse(access_token=token, message="Login successful!")


@router.post("/sync-user", response_model=SyncUserResponse)
async def sync_user(uid: str = Depends(get_current_user_uid), db: AsyncSession = Depends(get_db)):
    # Try looking up by User.id (UUID)
    try:
        user_uuid = uuid.UUID(uid)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalar_one_or_none()
    except ValueError:
        user = None

    if not user:
        # Fallback to firebase_uid string lookup for backwards compatibility
        result = await db.execute(select(User).where(User.firebase_uid == uid))
        user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, "User not found")
        
    result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = AlumniProfile(user_id=user.id, current_step=1)
        db.add(profile)
        await db.flush()
        
    return SyncUserResponse(
        id=str(user.id),
        firebase_uid=user.firebase_uid,
        full_name=user.full_name,
        email=user.email,
        is_email_verified=user.is_email_verified,
        has_profile=True,
        registration_complete=profile.registration_complete,
        current_step=profile.current_step
    )


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = request.email.lower().strip()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if user:
        import string
        alphabet = string.ascii_letters + string.digits
        temp_pass = ''.join(secrets.choice(alphabet) for _ in range(10))
        
        hashed = hash_password(temp_pass)
        user.hashed_password = hashed
        await db.flush()
        
        sent = await send_reset_password_email(email, temp_pass)
        if not sent:
            raise HTTPException(500, "Failed to send email. Try again.")
            
    return {"message": "If your email is registered, we have sent a temporary password. Check your inbox."}


