from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Job, Match, Resume
from app.schemas import MatchComputeRequest, MatchResponse
from app.services.matching import MatchingService

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.post("/compute", response_model=list[MatchResponse], status_code=201)
async def compute_matches(
    body: MatchComputeRequest, db: AsyncSession = Depends(get_db)
):
    if body.job_id is None and body.resume_id is None:
        raise HTTPException(
            status_code=400,
            detail="Either job_id or resume_id must be provided",
        )

    service = MatchingService(db)
    try:
        if body.job_id is not None:
            matches = await service.compute_matches(
                body.job_id, bias_reduced=body.bias_reduced
            )
        else:
            matches = await service.compute_matches_for_resume(
                body.resume_id, bias_reduced=body.bias_reduced
            )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    await db.commit()

    results: list[MatchResponse] = []
    for m in matches:
        await db.refresh(m)
        job = await db.get(Job, m.job_id)
        resume = await db.get(Resume, m.resume_id)
        results.append(
            MatchResponse(
                id=m.id,
                job_id=m.job_id,
                resume_id=m.resume_id,
                similarity_score=m.similarity_score,
                bias_reduced=m.bias_reduced,
                created_at=m.created_at,
                job_title=job.title if job else None,
                job_company=job.company if job else None,
                candidate_name=resume.candidate_name if resume else None,
            )
        )
    return results


@router.get("", response_model=list[MatchResponse])
async def list_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    job_id: str | None = Query(None),
    resume_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
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
            Resume.candidate_name,
        )
        .join(Job, Match.job_id == Job.id)
        .join(Resume, Match.resume_id == Resume.id)
        .order_by(Match.created_at.desc())
    )

    if job_id is not None:
        stmt = stmt.where(Match.job_id == job_id)
    if resume_id is not None:
        stmt = stmt.where(Match.resume_id == resume_id)

    stmt = stmt.offset(skip).limit(limit)
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
            candidate_name=row.candidate_name,
        )
        for row in rows
    ]
