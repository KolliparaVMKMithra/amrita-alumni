"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GraduationCap, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import Step1 from "@/components/registration/Step1";
import Step2 from "@/components/registration/Step2";
import Step3 from "@/components/registration/Step3";
import Step4 from "@/components/registration/Step4";
import Step5 from "@/components/registration/Step5";
import Step6 from "@/components/registration/Step6";
import Step7 from "@/components/registration/Step7";
import Step8 from "@/components/registration/Step8";
import Step9 from "@/components/registration/Step9";

const STEPS = [
  "Personal Info", 
  "Contact", 
  "Academic", 
  "Career",
  "Higher Education", 
  "Entrepreneurship", 
  "Engagement", 
  "Networking", 
  "Review & Submit"
];

export default function RegisterPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading]);

  const getValidStep = useCallback((step: number, status: string) => {
    if (step === 5 && status !== "Higher Studies") {
      if (status === "Entrepreneur") return 6;
      return 7;
    }
    if (step === 6 && status !== "Entrepreneur") {
      return 7;
    }
    return step;
  }, []);

  useEffect(() => {
    if (user) {
      api.get("/api/profile/me").then(r => {
        const d = r.data;
        setFormData({
          full_name: d.full_name, email: d.email, gender: d.gender, date_of_birth: d.date_of_birth,
          photo_url: d.photo_url, student_id: d.student_id, nationality: d.nationality,
          ...d.contact, ...d.academic,
          university_name: d.academic?.university_name || "Amrita Vishwa Vidyapeetham",
          campus: d.academic?.campus || "Amaravati",
          ...d.career,
          career_history: d.career?.career_history || [],
          ...d.higher_education, ...d.entrepreneurship, ...d.engagement, ...d.networking, ...d.social,
        });
        const rawStep = Math.min(d.registration_complete ? 9 : (d.current_step || 1), 9);
        setCurrentStep(getValidStep(rawStep, d.career?.employment_status || ""));
      }).catch(() => {});
    }
  }, [user, getValidStep]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateFormData = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    setIsDirty(true);
  }, []);

  const saveStep = async (step: number, data: any) => {
    setSaving(true);
    try {
      await api.patch(`/api/profile/step/${step}`, data);
      setIsDirty(false);
      return true;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save. Try again.");
      return false;
    } finally { setSaving(false); }
  };

  const buildStepPayload = (step: number) => {
    const d = formData;
    const payloads: Record<number, any> = {
      1: { full_name: d.full_name, gender: d.gender, date_of_birth: d.date_of_birth, photo_url: d.photo_url, student_id: d.student_id, nationality: d.nationality },
      2: { mobile: d.mobile, whatsapp: d.whatsapp, alternate_email: d.alternate_email, linkedin_url: d.linkedin_url, current_address: d.current_address, permanent_address: d.permanent_address, city: d.city, state: d.state, country: d.country, pin_code: d.pin_code },
      3: { university_name: d.university_name, campus: d.campus, department: d.department, program: d.program, specialization: d.specialization, degree: d.degree, batch_year: d.batch_year, admission_year: d.admission_year },
      4: { employment_status: d.employment_status, current_company: d.current_company, designation: d.designation, industry_sector: d.industry_sector, employment_type: d.employment_type, work_city: d.work_city, work_country: d.work_country, ctc_range: d.ctc_range, years_of_experience: d.years_of_experience, skills: d.skills, career_history: d.career_history },
      5: { university_name: d.higher_edu_university, country: d.higher_edu_country, degree: d.higher_edu_degree, specialization: d.higher_edu_specialization, admission_year: d.higher_edu_admission_year, graduation_year: d.higher_edu_graduation_year, is_ongoing: d.is_ongoing },
      6: { startup_name: d.startup_name, domain: d.domain, website: d.website, funding_status: d.funding_status, team_size: d.team_size, incubation_details: d.incubation_details, not_applicable: d.not_applicable },
      7: { mentoring: d.mentoring, guest_lectures: d.guest_lectures, recruitment_support: d.recruitment_support, internship_support: d.internship_support, donations_csr: d.donations_csr, alumni_chapters: d.alumni_chapters, preferred_communication: d.preferred_communication, available_for_events: d.available_for_events },
      8: { can_refer: d.can_refer, hiring_capacity: d.hiring_capacity, internship_opportunities: d.internship_opportunities, industry_contacts: d.industry_contacts, recruitment_areas: d.recruitment_areas },
      9: { linkedin: d.linkedin, github: d.github, portfolio: d.portfolio, resume_url: d.resume_url, other_doc_url: d.other_doc_url },
    };
    return payloads[step] || {};
  };

  // Helper to parse dynamic active steps list based on career status selection
  const getActiveSteps = (status: string) => {
    return STEPS.map((s, i) => ({ name: s, num: i + 1 })).filter(s => {
      if (s.num === 5 && status !== "Higher Studies") return false;
      if (s.num === 6 && status !== "Entrepreneur") return false;
      return true;
    });
  };

  const getNextStep = (current: number, status: string) => {
    if (current === 4) {
      if (status === "Higher Studies") return 5;
      if (status === "Entrepreneur") return 6;
      return 7;
    }
    if (current === 5) {
      return 7; // Skip step 6 (Entrepreneurship) for higher studies students
    }
    return current + 1;
  };

  const getPrevStep = (current: number, status: string) => {
    if (current === 7) {
      if (status === "Higher Studies") return 5;
      if (status === "Entrepreneur") return 6;
      return 4;
    }
    if (current === 6) {
      return 4; // Skip step 5 (Higher Education) for entrepreneurs
    }
    return current - 1;
  };

  const validateStep = (step: number): boolean => {
    const d = formData;
    if (step === 1) {
      if (!d.full_name?.trim()) { toast.error("Full Name is required"); return false; }
      if (!d.gender) { toast.error("Gender is required"); return false; }
      if (!d.date_of_birth) { toast.error("Date of Birth is required"); return false; }
      if (!d.student_id?.trim()) { toast.error("Student ID / Roll Number is required"); return false; }
      if (!d.nationality?.trim()) { toast.error("Nationality is required"); return false; }
    }
    if (step === 2) {
      if (!d.mobile?.trim() || d.mobile.trim().split(" ").slice(1).join("").length === 0) {
        toast.error("Mobile Number is required"); return false;
      }
      if (!d.alternate_email?.trim()) { toast.error("Alternate Email is required"); return false; }
      if (!d.current_address?.trim()) { toast.error("Current Address is required"); return false; }
      if (!d.city?.trim()) { toast.error("City is required"); return false; }
      if (!d.state?.trim()) { toast.error("State is required"); return false; }
      if (!d.country) { toast.error("Country is required"); return false; }
      if (!d.pin_code?.trim()) { toast.error("PIN Code is required"); return false; }
    }
    if (step === 3) {
      if (!d.university_name?.trim()) { toast.error("University / College Name is required"); return false; }
      if (!d.campus) { toast.error("Campus is required"); return false; }
      if (!d.department) { toast.error("Branch / Department is required"); return false; }
      if (!d.program?.trim()) { toast.error("Program / Course is required"); return false; }
      if (!d.degree) { toast.error("Degree is required"); return false; }
      if (!d.batch_year) { toast.error("Batch / Passing Year is required"); return false; }
      if (!d.admission_year) { toast.error("Admission Year is required"); return false; }
    }
    if (step === 4) {
      if (!d.employment_status) { toast.error("Employment Status is required"); return false; }
      if (d.employment_status === "Employed") {
        if (!d.current_company?.trim()) { toast.error("Current Company is required"); return false; }
        if (!d.designation?.trim()) { toast.error("Designation is required"); return false; }
      }
    }
    if (step === 5 && d.employment_status === "Higher Studies" && !d.higher_edu_na) {
      if (!d.higher_edu_university?.trim()) { toast.error("University Name is required"); return false; }
      if (!d.higher_edu_country?.trim()) { toast.error("Country is required"); return false; }
      if (!d.higher_edu_degree) { toast.error("Degree Pursued is required"); return false; }
      if (!d.higher_edu_admission_year) { toast.error("Admission Year is required"); return false; }
    }
    if (step === 6 && d.employment_status === "Entrepreneur" && !d.not_applicable) {
      if (!d.startup_name?.trim()) { toast.error("Startup Name is required"); return false; }
      if (!d.domain?.trim()) { toast.error("Domain / Industry is required"); return false; }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    const payload = buildStepPayload(currentStep);
    const ok = await saveStep(currentStep, payload);
    if (ok) {
      const next = getNextStep(currentStep, formData.employment_status);
      setCurrentStep(next);
    }
  };

  const handlePrev = () => {
    const prev = getPrevStep(currentStep, formData.employment_status);
    setCurrentStep(prev);
  };

  const handleSubmit = async () => {
    const payload = buildStepPayload(9);
    const ok = await saveStep(9, payload);
    if (!ok) return;
    try {
      await api.patch("/api/profile/complete");
      await refreshProfile();
      toast.success("Registration completed! 🎉");
      router.push(`/profile/${profile?.id || "me"}`);
    } catch { toast.error("Submission failed. Try again."); }
  };

  // Recalculate progress list & display metrics dynamically
  const activeStepsList = getActiveSteps(formData.employment_status || "");
  const currentActiveIdx = activeStepsList.findIndex(s => s.num === currentStep);
  const progress = activeStepsList.length > 1 ? (currentActiveIdx / (activeStepsList.length - 1)) * 100 : 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <span className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1 data={formData} onChange={updateFormData} />,
    2: <Step2 data={formData} onChange={updateFormData} />,
    3: <Step3 data={formData} onChange={updateFormData} />,
    4: <Step4 data={formData} onChange={updateFormData} />,
    5: <Step5 data={formData} onChange={updateFormData} />,
    6: <Step6 data={formData} onChange={updateFormData} />,
    7: <Step7 data={formData} onChange={updateFormData} />,
    8: <Step8 data={formData} onChange={updateFormData} />,
    9: <Step9 data={formData} onChange={updateFormData} onJumpTo={(s) => setCurrentStep(s)} onSubmit={handleSubmit} saving={saving} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#8B1A1A,#6B1414)", padding: "1.25rem 2rem", display: "flex", alignItems: "center", gap: "1rem", position: "sticky", top: 0, zIndex: 50 }} className="glow-shadow-maroon">
        <div style={{ width: 38, height: 38, background: "rgba(212,160,23,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GraduationCap size={20} color="#D4A017" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>ALUMNI REGISTRATION</div>
          <div style={{ color: "white", fontFamily: "Montserrat", fontWeight: 800, fontSize: "0.95rem" }}>
            Step {currentActiveIdx !== -1 ? currentActiveIdx + 1 : 1} of {activeStepsList.length} — {STEPS[currentStep - 1]}
          </div>
        </div>
        {saving && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: 600 }}>
          <Save size={14} className="animate-spin" /> Saving...
        </div>}
      </div>

      {/* Progress Bar */}
      <div style={{ background: "rgba(139,26,26,0.15)", height: 6 }}>
        <div style={{ height: "100%", background: "#D4A017", width: `${progress}%`, transition: "width 0.4s ease", borderRadius: "0 3px 3px 0" }} />
      </div>

      {/* Step Pills - Re-polished to render ONLY active relevant steps for the user */}
      <div style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border-color)", padding: "0.75rem 2rem", display: "flex", gap: "0.5rem", overflowX: "auto" }}>
        {activeStepsList.map((step, idx) => {
          const isCurrent = step.num === currentStep;
          const isPassed = step.num < currentStep;
          return (
            <button 
              key={step.name} 
              onClick={() => isPassed && setCurrentStep(step.num)} 
              style={{
                padding: "0.35rem 0.85rem", 
                borderRadius: 20, 
                border: "none", 
                cursor: isPassed ? "pointer" : "default",
                background: isCurrent ? "#8B1A1A" : isPassed ? "rgba(212,160,23,0.15)" : "var(--bg-primary)",
                color: isCurrent ? "white" : isPassed ? "#D4A017" : "var(--text-secondary)",
                fontFamily: "Montserrat", 
                fontWeight: 700, 
                fontSize: "0.75rem", 
                whiteSpace: "nowrap", 
                flexShrink: 0,
                transition: "all 0.2s"
              }}
              className={isCurrent ? "glow-shadow-maroon" : ""}
            >
              {isPassed ? "✓ " : ""}{step.name}
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <div className="card glow-shadow-maroon animate-fade-in" style={{ padding: "2.5rem", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
          {stepComponents[currentStep]}
        </div>

        {/* Navigation Buttons (not for step 9 which has its own submit) */}
        {currentStep < 9 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
            <button onClick={handlePrev} disabled={currentActiveIdx === 0} className="btn-outline glow-shadow-maroon" style={{ opacity: currentActiveIdx === 0 ? 0.4 : 1, padding: "0.7rem 1.5rem", borderRadius: "10px" }}>
              <ChevronLeft size={16} /> Previous
            </button>
            <button onClick={handleNext} disabled={saving} className="btn-primary glow-shadow-maroon" style={{ padding: "0.7rem 1.5rem", borderRadius: "10px" }}>
              {saving ? <><span className="spinner" />Saving...</> : <>Next Step <ChevronRight size={16} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
