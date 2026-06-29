"""Pydantic schemas for authentication endpoints."""

from pydantic import BaseModel, EmailStr, field_validator
import re
from typing import Optional


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 255:
            raise ValueError("Name must be less than 255 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    message: str


class SendOTPRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


class SyncUserResponse(BaseModel):
    id: str
    firebase_uid: Optional[str] = None
    full_name: str
    email: str
    is_email_verified: bool
    has_profile: bool
    registration_complete: bool
    current_step: int = 1


class OTPResponse(BaseModel):
    message: str


class VerifyOTPResponse(BaseModel):
    custom_token: str
    message: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


