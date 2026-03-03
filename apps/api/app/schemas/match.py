from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MatchResponse(BaseModel):
    id: UUID
    job_id: UUID
    resume_id: UUID
    similarity_score: float
    bias_reduced: bool = False
    created_at: datetime
    job_title: str | None = None
    job_company: str | None = None
    candidate_name: str | None = None

    model_config = {"from_attributes": True}


class MatchComputeRequest(BaseModel):
    job_id: UUID | None = None
    resume_id: UUID | None = None
    bias_reduced: bool = False
