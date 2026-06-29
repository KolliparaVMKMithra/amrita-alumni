"""Alumni Higher Education model."""

import uuid
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniHigherEducation(Base):
    __tablename__ = "alumni_higher_education"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    university_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    degree: Mapped[str | None] = mapped_column(String(100), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    admission_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_ongoing: Mapped[bool] = mapped_column(Boolean, default=False)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="higher_education"
    )
