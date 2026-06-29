"""Alumni Activity tracking model."""

import uuid
from datetime import date
from sqlalchemy import String, Integer, Date, Text, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniActivity(Base):
    __tablename__ = "alumni_activity"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    last_interaction: Mapped[date | None] = mapped_column(Date, nullable=True)
    events_attended: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    donations_made: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    talks_delivered: Mapped[int] = mapped_column(Integer, default=0)
    mentorship_sessions: Mapped[int] = mapped_column(Integer, default=0)
    awards_achievements: Mapped[str | None] = mapped_column(Text, nullable=True)
    membership_status: Mapped[str] = mapped_column(String(50), default="Active")

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="activity"
    )
