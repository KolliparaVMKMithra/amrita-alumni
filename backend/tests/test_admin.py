import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from backend.utils.security import create_admin_token


@pytest.fixture
def mock_admin_password(monkeypatch):
    # Mock admin verify helper to accept 'test_admin_pass'
    monkeypatch.setattr("backend.routes.admin.verify_admin_password", lambda p: p == "test_admin_pass")


@pytest.mark.asyncio
async def test_admin_login_success(client: AsyncClient, mock_admin_password):
    payload = {
        "username": "alumni_admin",
        "password": "test_admin_pass"
    }
    response = await client.post("/api/admin/login", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"
    assert "admin_session" in client.cookies


@pytest.mark.asyncio
async def test_admin_login_invalid(client: AsyncClient, mock_admin_password):
    payload = {
        "username": "alumni_admin",
        "password": "incorrect_password"
    }
    response = await client.post("/api/admin/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_stats_unauthorized(client: AsyncClient):
    response = await client.get("/api/admin/stats")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_stats_authorized(client: AsyncClient, mock_admin_password):
    # Login as admin
    login_payload = {
        "username": "alumni_admin",
        "password": "test_admin_pass"
    }
    await client.post("/api/admin/login", json=login_payload)
    
    # Fetch stats
    response = await client.get("/api/admin/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_alumni" in data
    assert "fully_registered" in data


@pytest.mark.asyncio
async def test_admin_list_alumni_and_filters(client: AsyncClient, mock_admin_password):
    # Register some alumni first
    user_payloads = [
        {"email": "alumni1@amrita.edu", "password": "Password123!", "full_name": "Alice Cooper"},
        {"email": "alumni2@amrita.edu", "password": "Password123!", "full_name": "Bob Marley"},
    ]
    for user_p in user_payloads:
        # Register User
        res_reg = await client.post("/api/auth/signup", json=user_p)
        token = res_reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        # Populate Alice as CS
        if user_p["email"] == "alumni1@amrita.edu":
            await client.patch("/api/profile/step/1", json={"gender": "Female"}, headers=headers)
            await client.patch("/api/profile/step/3", json={"university_name": "Amrita", "degree": "B.Tech", "department": "CSE", "batch_year": 2024}, headers=headers)
            await client.patch("/api/profile/step/4", json={"employment_status": "Employed", "current_company": "Google", "designation": "Staff Engineer"}, headers=headers)
        # Populate Bob as ECE
        else:
            await client.patch("/api/profile/step/1", json={"gender": "Male"}, headers=headers)
            await client.patch("/api/profile/step/3", json={"university_name": "Amrita", "degree": "B.Tech", "department": "ECE", "batch_year": 2023}, headers=headers)
            await client.patch("/api/profile/step/4", json={"employment_status": "Higher Studies"}, headers=headers)
            await client.patch("/api/profile/step/5", json={"university_name": "Stanford", "degree": "MS"}, headers=headers)
    
    # Login as Admin
    login_payload = {
        "username": "alumni_admin",
        "password": "test_admin_pass"
    }
    await client.post("/api/admin/login", json=login_payload)
    
    # 1. Fetch entire list
    res_list = await client.get("/api/admin/alumni")
    assert res_list.status_code == 200
    assert len(res_list.json()["items"]) >= 2
    
    # 2. Search filter
    res_search = await client.get("/api/admin/alumni?search=Alice")
    assert len(res_search.json()["items"]) == 1
    assert res_search.json()["items"][0]["full_name"] == "Alice Cooper"
    
    # 3. Department filter
    res_dept = await client.get("/api/admin/alumni?department=ECE")
    assert len(res_dept.json()["items"]) == 1
    assert res_dept.json()["items"][0]["full_name"] == "Bob Marley"
    
    # 4. Employment status filter
    res_status = await client.get("/api/admin/alumni?employment_status=Employed")
    assert len(res_status.json()["items"]) == 1
    assert res_status.json()["items"][0]["full_name"] == "Alice Cooper"


@pytest.mark.asyncio
async def test_admin_export_csv(client: AsyncClient, mock_admin_password):
    # Login as Admin
    login_payload = {
        "username": "alumni_admin",
        "password": "test_admin_pass"
    }
    await client.post("/api/admin/login", json=login_payload)
    
    # Download CSV export
    response = await client.get("/api/admin/export")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment; filename=alumni_export_" in response.headers["content-disposition"]
    
    # Verify CSV headers are present
    content = response.text
    assert "Name,Email,Batch,Department,Degree,Company,Designation,City,Country,Status" in content
