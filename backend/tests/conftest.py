import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from httpx import AsyncClient

from backend.database import Base, get_db
from backend.main import app

# In-memory SQLite for isolated tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def init_test_db():
    """Create database tables in SQLite memory, overriding dialect array columns."""
    from backend.models.alumni_career import AlumniCareer
    from backend.models.alumni_networking import AlumniNetworking
    from backend.models.alumni_activity import AlumniActivity
    from sqlalchemy import JSON

    AlumniCareer.skills.property.columns[0].type = JSON()
    AlumniNetworking.recruitment_areas.property.columns[0].type = JSON()
    AlumniActivity.events_attended.property.columns[0].type = JSON()



    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)



@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async test database session."""
    async with TestSessionLocal() as session:
        yield session
        await session.commit()


@pytest_asyncio.fixture(autouse=True)
def override_db_dependency(db_session: AsyncSession):
    """Override FastAPI's database session dependency."""
    async def _get_test_db():
        yield db_session
    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.pop(get_db, None)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Yield an async client bound to our FastAPI app."""
    from httpx import ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

