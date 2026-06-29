"""Alumni Contact information model."""

import uuid
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniContact(Base):
    __tablename__ = "alumni_contact"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alumni_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("alumni_profile.id"), unique=True, nullable=False
    )
    mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(20), nullable=True)
    alternate_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    permanent_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pin_code: Mapped[str | None] = mapped_column(String(10), nullable=True)

    alumni_profile: Mapped["AlumniProfile"] = relationship(
        "AlumniProfile", back_populates="contact"
    )
