"""Alumni Career History — multiple rows per alumni for previous companies."""

import uuid
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniCareerHistory(Base):
    __tablename__ = "alumni_career_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), nullable=False
    )
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    from_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    to_year: Mapped[int | None] = mapped_column(Integer, nullable=True)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="career_history"
    )
