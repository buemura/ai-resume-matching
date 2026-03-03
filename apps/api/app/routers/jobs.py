import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Job, Match, Resume
from app.schemas import JobCreate, JobResponse, MatchResponse
from app.services.embedding import EmbeddingService
from app.services.skill_extraction import SkillExtractionService

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

embedding_service = EmbeddingService()
skill_service = SkillExtractionService()


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(body: JobCreate, db: AsyncSession = Depends(get_db)):
    job_text = f"{body.title} at {body.company}\n\n{body.description}"
    embedding = await embedding_service.get_embedding(job_text)
    skills = await skill_service.extract_skills(job_text)
    job = Job(
        title=body.title,
        company=body.company,
        description=body.description,
        embedding=embedding,
        skills=skills,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Job)
        .order_by(Job.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/matches", response_model=list[MatchResponse])
async def get_job_matches(
    job_id: uuid.UUID,
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    stmt = (
        select(
            Match.id,
            Match.job_id,
            Match.resume_id,
            Match.similarity_score,
            Match.bias_reduced,
            Match.created_at,
            Resume.candidate_name,
        )
        .join(Resume, Match.resume_id == Resume.id)
        .where(Match.job_id == job_id)
        .order_by(Match.similarity_score.desc())
        .limit(limit)
    )
    rows = (await db.execute(stmt)).all()
    return [
        MatchResponse(
            id=row.id,
            job_id=row.job_id,
            resume_id=row.resume_id,
            similarity_score=row.similarity_score,
            bias_reduced=row.bias_reduced,
            created_at=row.created_at,
            candidate_name=row.candidate_name,
        )
        for row in rows
    ]
