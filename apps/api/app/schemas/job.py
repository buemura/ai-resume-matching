from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    company: str
    description: str


class JobResponse(BaseModel):
    id: UUID
    title: str
    company: str
    description: str
    skills: list[str] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
