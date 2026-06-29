"""Pydantic schemas for alumni profile endpoints."""

from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import date
from typing import Optional
from uuid import UUID


# ── Step 1: Basic Personal Information ──
class Step1Schema(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    photo_url: Optional[str] = None
    student_id: Optional[str] = None
    nationality: Optional[str] = None


# ── Step 2: Contact Information ──
class Step2Schema(BaseModel):
    mobile: Optional[str] = None
    whatsapp: Optional[str] = None
    alternate_email: Optional[str] = None
    linkedin_url: Optional[str] = None
    current_address: Optional[str] = None
    permanent_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pin_code: Optional[str] = None


# ── Step 3: Academic Information ──
class Step3Schema(BaseModel):
    university_name: Optional[str] = None
    campus: Optional[str] = None
    department: Optional[str] = None
    program: Optional[str] = None
    specialization: Optional[str] = None
    degree: Optional[str] = None
    batch_year: Optional[int] = None
    admission_year: Optional[int] = None


# ── Step 4: Employment / Career Information ──
class CareerHistoryItem(BaseModel):
    company_name: Optional[str] = None
    designation: Optional[str] = None
    from_year: Optional[int] = None
    to_year: Optional[int] = None


class Step4Schema(BaseModel):
    employment_status: Optional[str] = None
    current_company: Optional[str] = None
    designation: Optional[str] = None
    industry_sector: Optional[str] = None
    employment_type: Optional[str] = None
    work_city: Optional[str] = None
    work_country: Optional[str] = None
    ctc_range: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: Optional[list[str]] = None
    career_history: Optional[list[CareerHistoryItem]] = None


# ── Step 5: Higher Education ──
class Step5Schema(BaseModel):
    university_name: Optional[str] = None
    country: Optional[str] = None
    degree: Optional[str] = None
    specialization: Optional[str] = None
    admission_year: Optional[int] = None
    graduation_year: Optional[int] = None
    is_ongoing: Optional[bool] = False


# ── Step 6: Entrepreneurship ──
class Step6Schema(BaseModel):
    startup_name: Optional[str] = None
    domain: Optional[str] = None
    website: Optional[str] = None
    funding_status: Optional[str] = None
    team_size: Optional[int] = None
    incubation_details: Optional[str] = None
    not_applicable: Optional[bool] = False


# ── Step 7: Engagement Preferences ──
class Step7Schema(BaseModel):
    mentoring: Optional[bool] = False
    guest_lectures: Optional[bool] = False
    recruitment_support: Optional[bool] = False
    internship_support: Optional[bool] = False
    donations_csr: Optional[bool] = False
    alumni_chapters: Optional[bool] = False
    preferred_communication: Optional[str] = None
    available_for_events: Optional[bool] = False


# ── Step 8: Placement & Networking ──
class Step8Schema(BaseModel):
    can_refer: Optional[bool] = False
    hiring_capacity: Optional[int] = None
    internship_opportunities: Optional[bool] = False
    industry_contacts: Optional[str] = None
    recruitment_areas: Optional[list[str]] = None


# ── Step 9: Social & Documents ──
class Step9Schema(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    resume_url: Optional[str] = None
    other_doc_url: Optional[str] = None


# ── Full Profile Response ──
class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    student_id: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    photo_url: Optional[str] = None
    nationality: Optional[str] = None
    registration_complete: bool
    current_step: int
    contact: Optional[Step2Schema] = None
    academic: Optional[Step3Schema] = None
    career: Optional[Step4Schema] = None
    higher_education: Optional[Step5Schema] = None
    entrepreneurship: Optional[Step6Schema] = None
    engagement: Optional[Step7Schema] = None
    networking: Optional[Step8Schema] = None
    social: Optional[Step9Schema] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ── Admin Alumni List Item ──
class AlumniListItem(BaseModel):
    id: str
    full_name: str
    email: str
    photo_url: Optional[str] = None
    batch_year: Optional[int] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    current_company: Optional[str] = None
    designation: Optional[str] = None
    work_city: Optional[str] = None
    work_country: Optional[str] = None
    employment_status: Optional[str] = None
    registration_complete: bool = False
    created_at: Optional[str] = None


class PaginatedAlumniResponse(BaseModel):
    items: list[AlumniListItem]
    total: int
    page: int
    per_page: int
    total_pages: int


class StatsResponse(BaseModel):
    total_alumni: int
    fully_registered: int
    employed: int
    higher_studies: int
    entrepreneurs: int
    mentors_available: int
    can_refer: int
