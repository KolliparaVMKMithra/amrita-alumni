"""Alumni Networking model — referral and hiring support."""

import uuid
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniNetworking(Base):
    __tablename__ = "alumni_networking"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    can_refer: Mapped[bool] = mapped_column(Boolean, default=False)
    hiring_capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    internship_opportunities: Mapped[bool] = mapped_column(Boolean, default=False)
    industry_contacts: Mapped[str | None] = mapped_column(Text, nullable=True)
    recruitment_areas: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="networking"
    )
