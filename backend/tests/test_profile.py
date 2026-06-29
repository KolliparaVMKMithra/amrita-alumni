import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from backend.models.user import User
from backend.models.alumni_profile import AlumniProfile
from backend.utils.security import create_user_token


async def register_and_get_token(client: AsyncClient, email: str) -> tuple[str, str]:
    signup_payload = {
        "email": email,
        "password": "Password123!",
        "full_name": "Test User"
    }
    response = await client.post("/api/auth/signup", json=signup_payload)
    token = response.json()["access_token"]
    
    # We also need the user's UUID (from the DB)
    return token, email


@pytest.mark.asyncio
async def test_get_my_profile_unauthorized(client: AsyncClient):
    response = await client.get("/api/profile/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_my_profile_authorized(client: AsyncClient, db_session: AsyncSession):
    token, email = await register_and_get_token(client, "profiletest@amrita.edu")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = await client.get("/api/profile/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["full_name"] == "Test User"
    assert data["current_step"] == 1
    assert data["registration_complete"] is False


@pytest.mark.asyncio
async def test_step_by_step_branching_higher_studies(client: AsyncClient):
    token, _ = await register_and_get_token(client, "higheredu@amrita.edu")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 1: Personal Info
    res1 = await client.patch("/api/profile/step/1", json={"gender": "Male", "student_id": "CB.EN.U4CSE20001"}, headers=headers)
    assert res1.status_code == 200
    assert res1.json()["current_step"] == 2
    
    # Step 2: Contact
    res2 = await client.patch("/api/profile/step/2", json={"mobile": "9876543210", "whatsapp": "9876543210", "city": "Coimbatore"}, headers=headers)
    assert res2.status_code == 200
    assert res2.json()["current_step"] == 3
    
    # Step 3: Academic
    res3 = await client.patch("/api/profile/step/3", json={"university_name": "Amrita", "degree": "B.Tech", "batch_year": 2024}, headers=headers)
    assert res3.status_code == 200
    assert res3.json()["current_step"] == 4
    
    # Step 4: Career - Select "Higher Studies"
    res4 = await client.patch("/api/profile/step/4", json={"employment_status": "Higher Studies"}, headers=headers)
    assert res4.status_code == 200
    assert res4.json()["current_step"] == 5  # Resolves to Step 5
    
    # Step 5: Higher Education
    res5 = await client.patch("/api/profile/step/5", json={"university_name": "CMU", "degree": "MS"}, headers=headers)
    assert res5.status_code == 200
    assert res5.json()["current_step"] == 7  # Jumps to Step 7
    
    # Complete
    res_comp = await client.patch("/api/profile/complete", headers=headers)
    assert res_comp.status_code == 200
    assert res_comp.json()["message"] == "Registration completed!"


@pytest.mark.asyncio
async def test_step_by_step_branching_employed(client: AsyncClient):
    token, _ = await register_and_get_token(client, "employed@amrita.edu")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 4: Career - Select "Employed"
    res4 = await client.patch("/api/profile/step/4", json={"employment_status": "Employed", "current_company": "Google", "designation": "SWE"}, headers=headers)
    assert res4.status_code == 200
    assert res4.json()["current_step"] == 7  # Jumps directly to 7, skipping 5 & 6


@pytest.mark.asyncio
async def test_step_by_step_branching_entrepreneur(client: AsyncClient):
    token, _ = await register_and_get_token(client, "startup@amrita.edu")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 4: Career - Select "Entrepreneur"
    res4 = await client.patch("/api/profile/step/4", json={"employment_status": "Entrepreneur"}, headers=headers)
    assert res4.status_code == 200
    assert res4.json()["current_step"] == 6  # Resolves to Step 6


@pytest.mark.asyncio
async def test_profile_privacy_boundaries(client: AsyncClient, db_session: AsyncSession):
    # Register Owner
    owner_token, owner_email = await register_and_get_token(client, "owner@amrita.edu")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    
    # Complete owner's profile with sensitive details
    await client.patch("/api/profile/step/1", json={"gender": "Female", "nationality": "Indian"}, headers=owner_headers)
    await client.patch("/api/profile/step/2", json={
        "mobile": "9999999999", 
        "whatsapp": "8888888888", 
        "alternate_email": "alt@gmail.com", 
        "current_address": "Secret St 12",
        "city": "Coimbatore",
        "pin_code": "641105"
    }, headers=owner_headers)
    await client.patch("/api/profile/complete", headers=owner_headers)
    
    # Get owner's profile id
    res_db = await db_session.execute(select(User).where(User.email == owner_email))
    owner_user = res_db.scalar_one()
    owner_profile_id = str(owner_user.id)
    
    # Register Viewer
    viewer_token, _ = await register_and_get_token(client, "viewer@amrita.edu")
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}
    
    # Fetch owner's profile as viewer
    response = await client.get(f"/api/profile/{owner_profile_id}", headers=viewer_headers)
    assert response.status_code == 200
    data = response.json()
    
    # Verify non-sensitive fields are visible
    assert data["full_name"] == "Test User"
    assert data["contact"]["city"] == "Coimbatore"
    
    # Verify sensitive fields are stripped
    assert "whatsapp" not in data["contact"]
    assert "alternate_email" not in data["contact"]
    assert "current_address" not in data["contact"]
    assert "permanent_address" not in data["contact"]
    assert "pin_code" not in data["contact"]
