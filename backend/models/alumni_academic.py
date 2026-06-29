"""Alumni Academic information model."""

import uuid
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniAcademic(Base):
    __tablename__ = "alumni_academic"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    university_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    campus: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    program: Mapped[str | None] = mapped_column(String(255), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    degree: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    batch_year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    admission_year: Mapped[int | None] = mapped_column(Integer, nullable=True)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="academic"
    )
