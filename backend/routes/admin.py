"""Admin routes — login, stats, alumni list with filters, export."""
import io, csv
from fastapi import APIRouter, HTTPException, Depends, Response, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
from backend.database import get_db
from backend.models.user import User
from backend.models.alumni_profile import AlumniProfile
from backend.models.alumni_contact import AlumniContact
from backend.models.alumni_academic import AlumniAcademic
from backend.models.alumni_career import AlumniCareer
from backend.models.alumni_engagement import AlumniEngagement
from backend.models.alumni_networking import AlumniNetworking
from backend.models.alumni_social import AlumniSocial
from backend.schemas.auth import AdminLoginRequest
from backend.utils.security import (
    verify_admin_password, create_admin_token, set_admin_cookie,
    clear_admin_cookie, require_admin, ADMIN_USERNAME,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post("/login")
async def admin_login(req: AdminLoginRequest, response: Response):
    if req.username != ADMIN_USERNAME or not verify_admin_password(req.password):
        raise HTTPException(401, "Invalid credentials")
    token = create_admin_token()
    set_admin_cookie(response, token)
    return {"message": "Login successful"}


@router.post("/logout")
async def admin_logout(response: Response):
    clear_admin_cookie(response)
    return {"message": "Logged out"}


@router.get("/stats/public")
async def get_public_stats(db: AsyncSession = Depends(get_db)):
    """Public endpoint for landing page alumni count."""
    total = (await db.execute(select(func.count(AlumniProfile.id)))).scalar() or 0
    return {"total_alumni": total}


@router.get("/stats")
async def get_stats(admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count(AlumniProfile.id)))).scalar() or 0
    registered = (await db.execute(select(func.count(AlumniProfile.id)).where(
        AlumniProfile.registration_complete == True))).scalar() or 0
    employed = (await db.execute(select(func.count(AlumniCareer.id)).where(
        AlumniCareer.employment_status == "Employed"))).scalar() or 0
    higher = (await db.execute(select(func.count(AlumniCareer.id)).where(
        AlumniCareer.employment_status == "Higher Studies"))).scalar() or 0
    entrepreneurs = (await db.execute(select(func.count(AlumniCareer.id)).where(
        AlumniCareer.employment_status == "Entrepreneur"))).scalar() or 0
    mentors = (await db.execute(select(func.count(AlumniEngagement.id)).where(
        AlumniEngagement.mentoring == True))).scalar() or 0
    referrers = (await db.execute(select(func.count(AlumniNetworking.id)).where(
        AlumniNetworking.can_refer == True))).scalar() or 0
    return {"total_alumni": total, "fully_registered": registered, "employed": employed,
            "higher_studies": higher, "entrepreneurs": entrepreneurs,
            "mentors_available": mentors, "can_refer": referrers}


def build_alumni_query(search, batch_year, department, degree, employment_status,
                       company, designation, city, country, skills, mentoring,
                       guest_lectures, can_refer, internship, grad_year_from, grad_year_to,
                       registered_from, registered_to):
    query = (select(User, AlumniProfile, AlumniAcademic, AlumniCareer,
                    AlumniEngagement, AlumniNetworking)
             .outerjoin(AlumniProfile, User.id == AlumniProfile.user_id)
             .outerjoin(AlumniAcademic, AlumniProfile.id == AlumniAcademic.alumni_id)
             .outerjoin(AlumniCareer, AlumniProfile.id == AlumniCareer.alumni_id)
             .outerjoin(AlumniEngagement, AlumniProfile.id == AlumniEngagement.alumni_id)
             .outerjoin(AlumniNetworking, AlumniProfile.id == AlumniNetworking.alumni_id))
    filters = []
    if search:
        s = f"%{search}%"
        filters.append(or_(User.full_name.ilike(s), User.email.ilike(s),
            AlumniCareer.current_company.ilike(s), AlumniProfile.student_id.ilike(s),
            AlumniCareer.designation.ilike(s)))
    if batch_year:
        filters.append(AlumniAcademic.batch_year.in_(batch_year))
    if department:
        filters.append(AlumniAcademic.department.in_(department))
    if degree:
        filters.append(AlumniAcademic.degree.in_(degree))
    if employment_status:
        filters.append(AlumniCareer.employment_status.in_(employment_status))
    if company:
        filters.append(AlumniCareer.current_company.ilike(f"%{company}%"))
    if designation:
        filters.append(AlumniCareer.designation.ilike(f"%{designation}%"))
    if city:
        filters.append(AlumniCareer.work_city.ilike(f"%{city}%"))
    if country:
        filters.append(AlumniCareer.work_country == country)
    if mentoring == "Yes":
        filters.append(AlumniEngagement.mentoring == True)
    elif mentoring == "No":
        filters.append(AlumniEngagement.mentoring == False)
    if guest_lectures == "Yes":
        filters.append(AlumniEngagement.guest_lectures == True)
    elif guest_lectures == "No":
        filters.append(AlumniEngagement.guest_lectures == False)
    if can_refer == "Yes":
        filters.append(AlumniNetworking.can_refer == True)
    elif can_refer == "No":
        filters.append(AlumniNetworking.can_refer == False)
    if internship == "Yes":
        filters.append(AlumniNetworking.internship_opportunities == True)
    elif internship == "No":
        filters.append(AlumniNetworking.internship_opportunities == False)
    if grad_year_from:
        filters.append(AlumniAcademic.batch_year >= grad_year_from)
    if grad_year_to:
        filters.append(AlumniAcademic.batch_year <= grad_year_to)
    if registered_from:
        filters.append(AlumniProfile.created_at >= registered_from)
    if registered_to:
        filters.append(AlumniProfile.created_at <= registered_to)
    if filters:
        query = query.where(and_(*filters))
    return query


@router.get("/alumni")
async def list_alumni(
    page: int = 1, per_page: int = 25, search: Optional[str] = None,
    batch_year: Optional[list[int]] = Query(None), department: Optional[list[str]] = Query(None),
    degree: Optional[list[str]] = Query(None), employment_status: Optional[list[str]] = Query(None),
    company: Optional[str] = None, designation: Optional[str] = None,
    city: Optional[str] = None, country: Optional[str] = None,
    skills: Optional[list[str]] = Query(None),
    mentoring: Optional[str] = None, guest_lectures: Optional[str] = None,
    can_refer: Optional[str] = None, internship: Optional[str] = None,
    grad_year_from: Optional[int] = None, grad_year_to: Optional[int] = None,
    registered_from: Optional[str] = None, registered_to: Optional[str] = None,
    admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    query = build_alumni_query(search, batch_year, department, degree, employment_status,
        company, designation, city, country, skills, mentoring, guest_lectures,
        can_refer, internship, grad_year_from, grad_year_to, registered_from, registered_to)
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    rows = result.all()
    items = []
    for row in rows:
        user, profile, acad, career, eng, net = row
        items.append({
            "id": str(profile.id) if profile else "", "full_name": user.full_name,
            "email": user.email, "photo_url": profile.photo_url if profile else None,
            "batch_year": acad.batch_year if acad else None,
            "department": acad.department if acad else None,
            "degree": acad.degree if acad else None,
            "current_company": career.current_company if career else None,
            "designation": career.designation if career else None,
            "work_city": career.work_city if career else None,
            "work_country": career.work_country if career else None,
            "employment_status": career.employment_status if career else None,
            "registration_complete": profile.registration_complete if profile else False,
            "created_at": str(profile.created_at) if profile and profile.created_at else None,
        })
    total_pages = max(1, (total + per_page - 1) // per_page)
    return {"items": items, "total": total, "page": page, "per_page": per_page, "total_pages": total_pages}


@router.get("/alumni/{alumni_id}")
async def get_alumni_detail(alumni_id: str, admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    from backend.routes.profile import profile_to_dict
    import uuid
    try:
        query_id = uuid.UUID(alumni_id)
    except ValueError:
        query_id = None

    profile = None
    if query_id:
        result = await db.execute(select(AlumniProfile).where(AlumniProfile.id == query_id))
        profile = result.scalar_one_or_none()
        
    if not profile:
        raise HTTPException(404, "Alumni not found")
    result = await db.execute(select(User).where(User.id == profile.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    return profile_to_dict(user, profile)


@router.get("/export")
async def export_csv(
    search: Optional[str] = None, batch_year: Optional[list[int]] = Query(None),
    department: Optional[list[str]] = Query(None), degree: Optional[list[str]] = Query(None),
    employment_status: Optional[list[str]] = Query(None), company: Optional[str] = None,
    designation: Optional[str] = None, city: Optional[str] = None, country: Optional[str] = None,
    skills: Optional[list[str]] = Query(None), mentoring: Optional[str] = None,
    guest_lectures: Optional[str] = None, can_refer: Optional[str] = None,
    internship: Optional[str] = None, grad_year_from: Optional[int] = None,
    grad_year_to: Optional[int] = None, registered_from: Optional[str] = None,
    registered_to: Optional[str] = None,
    admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    query = build_alumni_query(search, batch_year, department, degree, employment_status,
        company, designation, city, country, skills, mentoring, guest_lectures,
        can_refer, internship, grad_year_from, grad_year_to, registered_from, registered_to)
    result = await db.execute(query)
    rows = result.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name","Email","Batch","Department","Degree","Company","Designation","City","Country","Status"])
    for row in rows:
        user, profile, acad, career, eng, net = row
        writer.writerow([
            user.full_name, user.email,
            acad.batch_year if acad else "", acad.department if acad else "",
            acad.degree if acad else "", career.current_company if career else "",
            career.designation if career else "", career.work_city if career else "",
            career.work_country if career else "", career.employment_status if career else "",
        ])
    from datetime import date
    filename = f"alumni_export_{date.today().isoformat()}.csv"
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
