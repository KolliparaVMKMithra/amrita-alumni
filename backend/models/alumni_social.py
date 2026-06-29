"""Alumni Social profiles and documents model."""

import uuid
from sqlalchemy import Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniSocial(Base):
    __tablename__ = "alumni_social"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    linkedin: Mapped[str | None] = mapped_column(Text, nullable=True)
    github: Mapped[str | None] = mapped_column(Text, nullable=True)
    portfolio: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    other_doc_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="social"
    )
