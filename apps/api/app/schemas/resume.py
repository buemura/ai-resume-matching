from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResumeCreate(BaseModel):
    candidate_name: str
    content: str


class ResumeResponse(BaseModel):
    id: UUID
    candidate_name: str
    content: str
    skills: list[str] | None = None
    file_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
