import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Job, Match, Resume
from app.schemas import MatchResponse, ResumeCreate, ResumeResponse
from app.services.embedding import EmbeddingService
from app.services.file_parser import parse_file
from app.services.skill_extraction import SkillExtractionService

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

embedding_service = EmbeddingService()
skill_service = SkillExtractionService()


@router.post("", response_model=ResumeResponse, status_code=201)
async def create_resume(
    body: ResumeCreate, db: AsyncSession = Depends(get_db)
):
    embedding = await embedding_service.get_embedding(body.content)
    skills = await skill_service.extract_skills(body.content)
    resume = Resume(
        candidate_name=body.candidate_name,
        content=body.content,
        embedding=embedding,
        skills=skills,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.post("/upload", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    candidate_name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    file_bytes = await file.read()
    try:
        content = parse_file(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not content.strip():
        raise HTTPException(
            status_code=400, detail="Could not extract text from file"
        )

    embedding = await embedding_service.get_embedding(content)
    skills = await skill_service.extract_skills(content)
    resume = Resume(
        candidate_name=candidate_name,
        content=content,
        embedding=embedding,
        skills=skills,
        file_name=file.filename,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("", response_model=list[ResumeResponse])
async def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Resume)
        .order_by(Resume.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    resume = await db.get(Resume, resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/{resume_id}/matches", response_model=list[MatchResponse])
async def get_resume_matches(
    resume_id: uuid.UUID,
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    resume = await db.get(Resume, resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    stmt = (
        select(
            Match.id,
            Match.job_id,
            Match.resume_id,
            Match.similarity_score,
            Match.bias_reduced,
            Match.created_at,
            Job.title.label("job_title"),
            Job.company.label("job_company"),
        )
        .join(Job, Match.job_id == Job.id)
        .where(Match.resume_id == resume_id)
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
            job_title=row.job_title,
            job_company=row.job_company,
        )
        for row in rows
    ]
