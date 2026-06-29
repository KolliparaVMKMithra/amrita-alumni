import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.user import User


@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient, db_session: AsyncSession):
    # Test valid signup
    payload = {
        "email": "newuser@amrita.edu",
        "password": "Password123!",
        "full_name": "Test Alumni"
    }
    response = await client.post("/api/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "Bearer"
    
    # Check DB entry
    res = await db_session.execute(select(User).where(User.email == "newuser@amrita.edu"))
    user = res.scalar_one_or_none()
    assert user is not None
    assert user.full_name == "Test Alumni"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient, db_session: AsyncSession):
    # Pre-populate user
    payload = {
        "email": "duplicate@amrita.edu",
        "password": "Password123!",
        "full_name": "Alumni One"
    }
    await client.post("/api/auth/signup", json=payload)
    
    # Try signing up again with same email
    response = await client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Account already exists with this email."


@pytest.mark.asyncio
async def test_signup_invalid_password(client: AsyncClient):
    # Passwords must satisfy custom regex: min 8, uppercase, number, special char
    payloads = [
        {"email": "weak1@amrita.edu", "password": "weak", "full_name": "Weak One"},
        {"email": "weak2@amrita.edu", "password": "NoSpecialChar123", "full_name": "Weak Two"},
        {"email": "weak3@amrita.edu", "password": "no_digits_caps!", "full_name": "Weak Three"},
    ]
    for p in payloads:
        response = await client.post("/api/auth/signup", json=p)
        assert response.status_code == 422 or response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    # Register first
    signup_payload = {
        "email": "loginuser@amrita.edu",
        "password": "SecurePassword1!",
        "full_name": "Login Alumni"
    }
    await client.post("/api/auth/signup", json=signup_payload)
    
    # Perform login
    login_payload = {
        "email": "loginuser@amrita.edu",
        "password": "SecurePassword1!"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "Bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    # Non-existent email login
    payload = {
        "email": "nonexistent@amrita.edu",
        "password": "SecurePassword1!"
    }
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    
    # Existing email but incorrect password
    signup_payload = {
        "email": "wrongpass@amrita.edu",
        "password": "SecurePassword1!",
        "full_name": "Wrong Pass Alumni"
    }
    await client.post("/api/auth/signup", json=signup_payload)
    
    payload["email"] = "wrongpass@amrita.edu"
    payload["password"] = "IncorrectPassword2!"
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_forgot_password_success(client: AsyncClient):
    # Submit password reset request for non-existent email (should return 200 to prevent enumeration)
    payload = {"email": "stranger@amrita.edu"}
    response = await client.post("/api/auth/forgot-password", json=payload)
    assert response.status_code == 200
    assert "If your email is registered" in response.json()["message"]
    
    # Submit password reset request for pre-existing email
    signup_payload = {
        "email": "member@amrita.edu",
        "password": "InitialPass1!",
        "full_name": "Portal Member"
    }
    await client.post("/api/auth/signup", json=signup_payload)
    
    payload = {"email": "member@amrita.edu"}
    response = await client.post("/api/auth/forgot-password", json=payload)
    assert response.status_code == 200
    assert "If your email is registered" in response.json()["message"]
