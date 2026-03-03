import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Job, Match, Resume
from app.services.embedding import EmbeddingService
from app.services.pii_stripper import PIIStripperService


class MatchingService:
    def __init__(self, session: AsyncSession, top_n: int = 10):
        self.session = session
        self.top_n = top_n

    async def compute_matches(
        self, job_id: uuid.UUID, bias_reduced: bool = False
    ) -> list[Match]:
        """Find top-N most similar resumes for a given job and persist results."""
        job = await self.session.get(Job, job_id)
        if job is None:
            raise ValueError(f"Job {job_id} not found")
        if job.embedding is None:
            raise ValueError(f"Job {job_id} has no embedding")

        # For bias-reduced mode, re-embed the job text with PII stripped
        if bias_reduced:
            pii_service = PIIStripperService()
            embedding_service = EmbeddingService()
            stripped = await pii_service.strip_pii(
                f"{job.title} at {job.company}\n\n{job.description}"
            )
            query_embedding = await embedding_service.get_embedding(stripped)
        else:
            query_embedding = job.embedding

        # Query pgvector for most similar resumes using cosine distance
        stmt = (
            select(
                Resume.id,
                Resume.embedding.cosine_distance(query_embedding).label(
                    "distance"
                ),
            )
            .where(Resume.embedding.isnot(None))
            .order_by("distance")
            .limit(self.top_n)
        )
        rows = (await self.session.execute(stmt)).all()

        # Remove existing matches for this job before inserting new ones
        await self.session.execute(
            delete(Match).where(Match.job_id == job_id)
        )

        matches: list[Match] = []
        for resume_id, distance in rows:
            similarity = 1.0 - float(distance)
            match = Match(
                job_id=job_id,
                resume_id=resume_id,
                similarity_score=similarity,
                bias_reduced=bias_reduced,
            )
            self.session.add(match)
            matches.append(match)

        await self.session.flush()
        return matches

    async def compute_matches_for_resume(
        self, resume_id: uuid.UUID, bias_reduced: bool = False
    ) -> list[Match]:
        """Find top-N most similar jobs for a given resume and persist results."""
        resume = await self.session.get(Resume, resume_id)
        if resume is None:
            raise ValueError(f"Resume {resume_id} not found")
        if resume.embedding is None:
            raise ValueError(f"Resume {resume_id} has no embedding")

        # For bias-reduced mode, re-embed the resume text with PII stripped
        if bias_reduced:
            pii_service = PIIStripperService()
            embedding_service = EmbeddingService()
            stripped = await pii_service.strip_pii(resume.content)
            query_embedding = await embedding_service.get_embedding(stripped)
        else:
            query_embedding = resume.embedding

        # Query pgvector for most similar jobs using cosine distance
        stmt = (
            select(
                Job.id,
                Job.embedding.cosine_distance(query_embedding).label(
                    "distance"
                ),
            )
            .where(Job.embedding.isnot(None))
            .order_by("distance")
            .limit(self.top_n)
        )
        rows = (await self.session.execute(stmt)).all()

        # Remove existing matches for this resume before inserting new ones
        await self.session.execute(
            delete(Match).where(Match.resume_id == resume_id)
        )

        matches: list[Match] = []
        for job_id, distance in rows:
            similarity = 1.0 - float(distance)
            match = Match(
                job_id=job_id,
                resume_id=resume_id,
                similarity_score=similarity,
                bias_reduced=bias_reduced,
            )
            self.session.add(match)
            matches.append(match)

        await self.session.flush()
        return matches
