"""SQLAlchemy ORM models for the Alumni Portal."""

from backend.models.user import User
from backend.models.alumni_profile import AlumniProfile
from backend.models.alumni_contact import AlumniContact
from backend.models.alumni_academic import AlumniAcademic
from backend.models.alumni_career import AlumniCareer
from backend.models.alumni_career_history import AlumniCareerHistory
from backend.models.alumni_higher_education import AlumniHigherEducation
from backend.models.alumni_entrepreneurship import AlumniEntrepreneurship
from backend.models.alumni_engagement import AlumniEngagement
from backend.models.alumni_networking import AlumniNetworking
from backend.models.alumni_social import AlumniSocial
from backend.models.alumni_activity import AlumniActivity

__all__ = [
    "User",
    "AlumniProfile",
    "AlumniContact",
    "AlumniAcademic",
    "AlumniCareer",
    "AlumniCareerHistory",
    "AlumniHigherEducation",
    "AlumniEntrepreneurship",
    "AlumniEngagement",
    "AlumniNetworking",
    "AlumniSocial",
    "AlumniActivity",
]
