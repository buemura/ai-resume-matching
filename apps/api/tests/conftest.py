import asyncio
from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.database import Base, get_db
from app.main import app


# Use an in-memory SQLite database for tests.
# pgvector features (cosine distance) are not available in SQLite,
# so integration tests that exercise vector queries need mocking.
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession]:
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def mock_embedding():
    """Return a deterministic fake embedding vector (1536 dims)."""
    return [0.01 * i for i in range(1536)]


@pytest.fixture
def mock_embedding_service(mock_embedding):
    """Patch EmbeddingService.get_embedding to return a fake vector."""
    with patch(
        "app.services.embedding.EmbeddingService.get_embedding",
        new_callable=AsyncMock,
        return_value=mock_embedding,
    ) as m:
        yield m


@pytest.fixture
def mock_skill_extraction():
    """Patch SkillExtractionService.extract_skills to return fake skills."""
    with patch(
        "app.services.skill_extraction.SkillExtractionService.extract_skills",
        new_callable=AsyncMock,
        return_value=["Python", "FastAPI", "SQL"],
    ) as m:
        yield m
