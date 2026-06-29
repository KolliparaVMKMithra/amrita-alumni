"""Alumni Profile model — core profile record."""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import String, Boolean, Integer, Date, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class AlumniProfile(Base):
    __tablename__ = "alumni_profile"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False
    )
    student_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(100), nullable=True)
    registration_complete: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    current_step: Mapped[int] = mapped_column(Integer, default=1)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="alumni_profile")
    contact: Mapped["AlumniContact"] = relationship(
        "AlumniContact", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    academic: Mapped["AlumniAcademic"] = relationship(
        "AlumniAcademic", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    career: Mapped["AlumniCareer"] = relationship(
        "AlumniCareer", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    career_history: Mapped[list["AlumniCareerHistory"]] = relationship(
        "AlumniCareerHistory", back_populates="alumni_profile", lazy="selectin", cascade="all, delete-orphan"
    )
    higher_education: Mapped["AlumniHigherEducation"] = relationship(
        "AlumniHigherEducation", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    entrepreneurship: Mapped["AlumniEntrepreneurship"] = relationship(
        "AlumniEntrepreneurship", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    engagement: Mapped["AlumniEngagement"] = relationship(
        "AlumniEngagement", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    networking: Mapped["AlumniNetworking"] = relationship(
        "AlumniNetworking", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    social: Mapped["AlumniSocial"] = relationship(
        "AlumniSocial", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    activity: Mapped["AlumniActivity"] = relationship(
        "AlumniActivity", back_populates="alumni_profile", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
