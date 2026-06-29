"""Alumni Entrepreneurship model."""

import uuid
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniEntrepreneurship(Base):
    __tablename__ = "alumni_entrepreneurship"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    startup_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(Text, nullable=True)
    funding_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    team_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    incubation_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    not_applicable: Mapped[bool] = mapped_column(Boolean, default=False)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="entrepreneurship"
    )
