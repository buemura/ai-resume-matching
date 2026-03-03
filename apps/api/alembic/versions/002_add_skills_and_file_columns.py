"""Add skills JSONB, file_name, and bias_reduced columns

Revision ID: 002
Revises: 001
Create Date: 2026-03-03

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("skills", sa.JSON(), nullable=True))
    op.add_column("resumes", sa.Column("skills", sa.JSON(), nullable=True))
    op.add_column(
        "resumes", sa.Column("file_name", sa.String(255), nullable=True)
    )
    op.add_column(
        "matches",
        sa.Column(
            "bias_reduced", sa.Boolean(), server_default="false", nullable=False
        ),
    )


def downgrade() -> None:
    op.drop_column("matches", "bias_reduced")
    op.drop_column("resumes", "file_name")
    op.drop_column("resumes", "skills")
    op.drop_column("jobs", "skills")
