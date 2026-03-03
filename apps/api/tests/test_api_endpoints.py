"""Integration tests for API endpoints using httpx + test database."""

import pytest
from httpx import AsyncClient


class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_health_returns_ok(self, client: AsyncClient):
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestJobsAPI:
    @pytest.mark.asyncio
    async def test_create_job(
        self, client: AsyncClient, mock_embedding_service, mock_skill_extraction
    ):
        payload = {
            "title": "Software Engineer",
            "company": "Acme Corp",
            "description": "Build and maintain web applications",
        }
        resp = await client.post("/api/jobs", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Software Engineer"
        assert data["company"] == "Acme Corp"
        assert data["skills"] == ["Python", "FastAPI", "SQL"]
        assert "id" in data

    @pytest.mark.asyncio
    async def test_list_jobs_empty(self, client: AsyncClient):
        resp = await client.get("/api/jobs")
        assert resp.status_code == 200
        assert resp.json() == []

    @pytest.mark.asyncio
    async def test_list_jobs_with_data(
        self, client: AsyncClient, mock_embedding_service, mock_skill_extraction
    ):
        await client.post(
            "/api/jobs",
            json={
                "title": "Job 1",
                "company": "Co",
                "description": "Desc",
            },
        )
        resp = await client.get("/api/jobs")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    @pytest.mark.asyncio
    async def test_get_job_by_id(
        self, client: AsyncClient, mock_embedding_service, mock_skill_extraction
    ):
        create_resp = await client.post(
            "/api/jobs",
            json={
                "title": "Dev",
                "company": "Co",
                "description": "Work",
            },
        )
        job_id = create_resp.json()["id"]

        resp = await client.get(f"/api/jobs/{job_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == job_id

    @pytest.mark.asyncio
    async def test_get_job_not_found(self, client: AsyncClient):
        resp = await client.get("/api/jobs/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_job_matches_empty(
        self, client: AsyncClient, mock_embedding_service, mock_skill_extraction
    ):
        create_resp = await client.post(
            "/api/jobs",
            json={
                "title": "Dev",
                "company": "Co",
                "description": "Work",
            },
        )
        job_id = create_resp.json()["id"]

        resp = await client.get(f"/api/jobs/{job_id}/matches")
        assert resp.status_code == 200
        assert resp.json() == []


class TestResumesAPI:
    @pytest.mark.asyncio
    async def test_create_resume(
        self, client: AsyncClient, mock_embedding_service, mock_skill_extraction
    ):
        payload = {
            "candidate_name": "John Doe",
            "content": "Experienced Python developer with 5 years of experience",
        }
        resp = await client.post("/api/resumes", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["candidate_name"] == "John Doe"
        assert "id" in data

    @pytest.mark.asyncio
    async def test_list_resumes_empty(self, client: AsyncClient):
        resp = await client.get("/api/resumes")
        assert resp.status_code == 200
        assert resp.json() == []

    @pytest.mark.asyncio
    async def test_get_resume_by_id(
        self, client: AsyncClient, mock_embedding_service, mock_skill_extraction
    ):
        create_resp = await client.post(
            "/api/resumes",
            json={
                "candidate_name": "Jane",
                "content": "Full stack developer",
            },
        )
        resume_id = create_resp.json()["id"]

        resp = await client.get(f"/api/resumes/{resume_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == resume_id

    @pytest.mark.asyncio
    async def test_get_resume_not_found(self, client: AsyncClient):
        resp = await client.get(
            "/api/resumes/00000000-0000-0000-0000-000000000000"
        )
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_resume_matches_empty(
        self, client: AsyncClient, mock_embedding_service, mock_skill_extraction
    ):
        create_resp = await client.post(
            "/api/resumes",
            json={
                "candidate_name": "Jane",
                "content": "Engineer",
            },
        )
        resume_id = create_resp.json()["id"]

        resp = await client.get(f"/api/resumes/{resume_id}/matches")
        assert resp.status_code == 200
        assert resp.json() == []


class TestMatchesAPI:
    @pytest.mark.asyncio
    async def test_compute_matches_no_ids(self, client: AsyncClient):
        resp = await client.post("/api/matches/compute", json={})
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_compute_matches_job_not_found(self, client: AsyncClient):
        resp = await client.post(
            "/api/matches/compute",
            json={"job_id": "00000000-0000-0000-0000-000000000000"},
        )
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_list_matches_empty(self, client: AsyncClient):
        resp = await client.get("/api/matches")
        assert resp.status_code == 200
        assert resp.json() == []
