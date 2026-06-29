"""Alumni Career information model."""

import uuid
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniCareer(Base):
    __tablename__ = "alumni_career"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    employment_status: Mapped[str | None] = mapped_column(
        String(50), nullable=True, index=True
    )
    current_company: Mapped[str | None] = mapped_column(
        String(255), nullable=True, index=True
    )
    designation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    industry_sector: Mapped[str | None] = mapped_column(String(255), nullable=True)
    employment_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    work_city: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True
    )
    work_country: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True
    )
    ctc_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    years_of_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    skills: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="career"
    )
