"""Profile routes — alumni profile CRUD and step saves."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from backend.database import get_db
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
from backend.schemas.profile import *
from backend.utils.firebase_verify import get_current_user_uid

router = APIRouter(prefix="/api/profile", tags=["Profile"])


async def get_user_and_profile(uid: str, db: AsyncSession):
    import uuid
    user = None
    try:
        user_uuid = uuid.UUID(uid)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalar_one_or_none()
    except ValueError:
        pass

    if not user:
        result = await db.execute(select(User).where(User.firebase_uid == uid))
        user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, "User not found")
        
    result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = AlumniProfile(user_id=user.id, current_step=1)
        db.add(profile)
        await db.flush()
    return user, profile



def profile_to_dict(user, profile):
    data = {
        "id": str(profile.id), "user_id": str(user.id),
        "full_name": user.full_name, "email": user.email,
        "student_id": profile.student_id, "gender": profile.gender,
        "date_of_birth": str(profile.date_of_birth) if profile.date_of_birth else None,
        "photo_url": profile.photo_url, "nationality": profile.nationality,
        "registration_complete": profile.registration_complete,
        "current_step": profile.current_step,
        "created_at": str(profile.created_at) if profile.created_at else None,
    }
    if profile.contact:
        c = profile.contact
        data["contact"] = {"mobile": c.mobile, "whatsapp": c.whatsapp,
            "alternate_email": c.alternate_email, "linkedin_url": c.linkedin_url,
            "current_address": c.current_address, "permanent_address": c.permanent_address,
            "city": c.city, "state": c.state, "country": c.country, "pin_code": c.pin_code}
    if profile.academic:
        a = profile.academic
        data["academic"] = {"university_name": a.university_name, "campus": a.campus,
            "department": a.department, "program": a.program, "specialization": a.specialization,
            "degree": a.degree, "batch_year": a.batch_year, "admission_year": a.admission_year}
    if profile.career:
        cr = profile.career
        data["career"] = {"employment_status": cr.employment_status, "current_company": cr.current_company,
            "designation": cr.designation, "industry_sector": cr.industry_sector,
            "employment_type": cr.employment_type, "work_city": cr.work_city,
            "work_country": cr.work_country, "ctc_range": cr.ctc_range,
            "years_of_experience": cr.years_of_experience, "skills": cr.skills or [],
            "career_history": [{"company_name": h.company_name, "designation": h.designation,
                "from_year": h.from_year, "to_year": h.to_year} for h in (profile.career_history or [])]}
    if profile.higher_education:
        h = profile.higher_education
        data["higher_education"] = {"university_name": h.university_name, "country": h.country,
            "degree": h.degree, "specialization": h.specialization,
            "admission_year": h.admission_year, "graduation_year": h.graduation_year, "is_ongoing": h.is_ongoing}
    if profile.entrepreneurship:
        e = profile.entrepreneurship
        data["entrepreneurship"] = {"startup_name": e.startup_name, "domain": e.domain,
            "website": e.website, "funding_status": e.funding_status, "team_size": e.team_size,
            "incubation_details": e.incubation_details, "not_applicable": e.not_applicable}
    if profile.engagement:
        eg = profile.engagement
        data["engagement"] = {"mentoring": eg.mentoring, "guest_lectures": eg.guest_lectures,
            "recruitment_support": eg.recruitment_support, "internship_support": eg.internship_support,
            "donations_csr": eg.donations_csr, "alumni_chapters": eg.alumni_chapters,
            "preferred_communication": eg.preferred_communication, "available_for_events": eg.available_for_events}
    if profile.networking:
        n = profile.networking
        data["networking"] = {"can_refer": n.can_refer, "hiring_capacity": n.hiring_capacity,
            "internship_opportunities": n.internship_opportunities, "industry_contacts": n.industry_contacts,
            "recruitment_areas": n.recruitment_areas or []}
    if profile.social:
        s = profile.social
        data["social"] = {"linkedin": s.linkedin, "github": s.github, "portfolio": s.portfolio,
            "resume_url": s.resume_url, "other_doc_url": s.other_doc_url}
    return data


@router.get("/me")
async def get_my_profile(uid: str = Depends(get_current_user_uid), db: AsyncSession = Depends(get_db)):
    user, profile = await get_user_and_profile(uid, db)
    return profile_to_dict(user, profile)


@router.get("/{alumni_id}")
async def get_profile(alumni_id: str, uid: str = Depends(get_current_user_uid), db: AsyncSession = Depends(get_db)):
    # Verify caller is authenticated by fetching their profile
    requesting_user, _ = await get_user_and_profile(uid, db)

    # Fetch the requested profile (supports both profile ID and user ID)
    import uuid
    try:
        query_id = uuid.UUID(alumni_id)
    except ValueError:
        query_id = None

    profile = None
    if query_id:
        result = await db.execute(
            select(AlumniProfile).where(
                or_(AlumniProfile.id == query_id, AlumniProfile.user_id == query_id)
            )
        )
        profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(404, "Profile not found")
    result = await db.execute(select(User).where(User.id == profile.user_id))
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(404, "User not found")

    data = profile_to_dict(target_user, profile)

    # If not the owner, hide sensitive contact fields
    is_owner = str(requesting_user.id) == str(target_user.id)
    if not is_owner and "contact" in data and data["contact"]:
        # Remove sensitive contact data for privacy
        data["contact"].pop("whatsapp", None)
        data["contact"].pop("alternate_email", None)
        data["contact"].pop("current_address", None)
        data["contact"].pop("permanent_address", None)
        data["contact"].pop("pin_code", None)

    return data


@router.patch("/step/{step_num}")
async def save_step(step_num: int, data: dict, uid: str = Depends(get_current_user_uid), db: AsyncSession = Depends(get_db)):
    if step_num < 1 or step_num > 9:
        raise HTTPException(400, "Invalid step")
    user, profile = await get_user_and_profile(uid, db)

    if step_num == 1:
        if data.get("full_name"): user.full_name = data["full_name"]
        for f in ["gender", "date_of_birth", "photo_url", "student_id", "nationality"]:
            if f in data: setattr(profile, f, data[f])
    elif step_num == 2:
        contact = profile.contact
        if not contact:
            contact = AlumniContact(alumni_id=profile.id)
            db.add(contact)
        for f in ["mobile","whatsapp","alternate_email","linkedin_url","current_address","permanent_address","city","state","country","pin_code"]:
            if f in data: setattr(contact, f, data[f])
    elif step_num == 3:
        acad = profile.academic
        if not acad:
            acad = AlumniAcademic(alumni_id=profile.id)
            db.add(acad)
        for f in ["university_name","campus","department","program","specialization","degree","batch_year","admission_year"]:
            if f in data: setattr(acad, f, data[f])
    elif step_num == 4:
        career = profile.career
        if not career:
            career = AlumniCareer(alumni_id=profile.id)
            db.add(career)
        for f in ["employment_status","current_company","designation","industry_sector","employment_type","work_city","work_country","ctc_range","years_of_experience","skills"]:
            if f in data: setattr(career, f, data[f])
        if "career_history" in data:
            for h in profile.career_history or []:
                await db.delete(h)
            for item in data["career_history"] or []:
                db.add(AlumniCareerHistory(alumni_id=profile.id, **item))
    elif step_num == 5:
        he = profile.higher_education
        if not he:
            he = AlumniHigherEducation(alumni_id=profile.id)
            db.add(he)
        for f in ["university_name","country","degree","specialization","admission_year","graduation_year","is_ongoing"]:
            if f in data: setattr(he, f, data[f])
    elif step_num == 6:
        ent = profile.entrepreneurship
        if not ent:
            ent = AlumniEntrepreneurship(alumni_id=profile.id)
            db.add(ent)
        for f in ["startup_name","domain","website","funding_status","team_size","incubation_details","not_applicable"]:
            if f in data: setattr(ent, f, data[f])
    elif step_num == 7:
        eng = profile.engagement
        if not eng:
            eng = AlumniEngagement(alumni_id=profile.id)
            db.add(eng)
        for f in ["mentoring","guest_lectures","recruitment_support","internship_support","donations_csr","alumni_chapters","preferred_communication","available_for_events"]:
            if f in data: setattr(eng, f, data[f])
    elif step_num == 8:
        net = profile.networking
        if not net:
            net = AlumniNetworking(alumni_id=profile.id)
            db.add(net)
        for f in ["can_refer","hiring_capacity","internship_opportunities","industry_contacts","recruitment_areas"]:
            if f in data: setattr(net, f, data[f])
    elif step_num == 9:
        soc = profile.social
        if not soc:
            soc = AlumniSocial(alumni_id=profile.id)
            db.add(soc)
        for f in ["linkedin","github","portfolio","resume_url","other_doc_url"]:
            if f in data: setattr(soc, f, data[f])

    if step_num >= profile.current_step:
        next_step = step_num + 1
        if step_num == 4:
            emp_status = data.get("employment_status")
            if emp_status == "Higher Studies":
                next_step = 5
            elif emp_status == "Entrepreneur":
                next_step = 6
            else:
                next_step = 7
        elif step_num == 5:
            next_step = 7
        profile.current_step = next_step if next_step < 9 else 9
    return {"message": f"Step {step_num} saved", "current_step": profile.current_step}


@router.patch("/complete")
async def complete_registration(uid: str = Depends(get_current_user_uid), db: AsyncSession = Depends(get_db)):
    user, profile = await get_user_and_profile(uid, db)
    profile.registration_complete = True
    return {"message": "Registration completed!", "profile_id": str(profile.id)}
