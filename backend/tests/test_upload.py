import pytest
from httpx import AsyncClient


import uuid

async def get_auth_token(client: AsyncClient) -> str:
    signup_payload = {
        "email": f"upload_{uuid.uuid4().hex}@amrita.edu",
        "password": "Password123!",
        "full_name": "Upload Tester"
    }
    response = await client.post("/api/auth/signup", json=signup_payload)
    return response.json()["access_token"]



@pytest.mark.asyncio
async def test_upload_photo_success(client: AsyncClient):
    token = await get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test valid image file
    files = {"file": ("test.png", b"fake image bytes", "image/png")}
    response = await client.post("/api/upload/photo", files=files, headers=headers)
    assert response.status_code == 200
    assert "url" in response.json()
    assert "/uploads/photos/" in response.json()["url"]


@pytest.mark.asyncio
async def test_upload_photo_invalid_type(client: AsyncClient):
    token = await get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test invalid file type (e.g. text file instead of image)
    files = {"file": ("test.txt", b"plain text content", "text/plain")}
    response = await client.post("/api/upload/photo", files=files, headers=headers)
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_resume_success(client: AsyncClient):
    token = await get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test valid PDF file
    files = {"file": ("resume.pdf", b"%PDF-1.4 fake pdf data", "application/pdf")}
    response = await client.post("/api/upload/resume", files=files, headers=headers)
    assert response.status_code == 200
    assert "url" in response.json()
    assert "/uploads/resumes/" in response.json()["url"]


@pytest.mark.asyncio
async def test_upload_file_oversized(client: AsyncClient):
    token = await get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test file exceeding 5MB max limit (e.g. 5.1 MB of content)
    oversized_content = b"0" * (5 * 1024 * 1024 + 100)
    files = {"file": ("huge.pdf", oversized_content, "application/pdf")}
    response = await client.post("/api/upload/resume", files=files, headers=headers)
    assert response.status_code == 400
    assert "File too large" in response.json()["detail"]
