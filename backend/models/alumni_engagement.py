"""Alumni Engagement preferences model."""

import uuid
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniEngagement(Base):
    __tablename__ = "alumni_engagement"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    mentoring: Mapped[bool] = mapped_column(Boolean, default=False)
    guest_lectures: Mapped[bool] = mapped_column(Boolean, default=False)
    recruitment_support: Mapped[bool] = mapped_column(Boolean, default=False)
    internship_support: Mapped[bool] = mapped_column(Boolean, default=False)
    donations_csr: Mapped[bool] = mapped_column(Boolean, default=False)
    alumni_chapters: Mapped[bool] = mapped_column(Boolean, default=False)
    preferred_communication: Mapped[str | None] = mapped_column(String(50), nullable=True)
    available_for_events: Mapped[bool] = mapped_column(Boolean, default=False)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="engagement"
    )
