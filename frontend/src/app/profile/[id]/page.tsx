"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Briefcase, GraduationCap, Download, Edit, MapPin, Mail, Phone, Globe, ExternalLink, ArrowLeft, CheckCircle, Shield, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

const TABS = ["Overview", "Career", "Education", "Engagement", "Social"];

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile: authProfile, loading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [profileLoading, setProfileLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const confettiRan = useRef(false);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading]);

  useEffect(() => {
    if (!user || !id) return;
    api.get(`/api/profile/${id}`).then(r => setData(r.data)).catch(e => {
      if (e?.response?.status === 403) { toast.error("Access denied."); router.push("/dashboard"); }
      else if (e?.response?.status === 404) { toast.error("Profile not found."); router.push("/dashboard"); }
    }).finally(() => setProfileLoading(false));

    const activeTheme = localStorage.getItem("theme") || "light";
    setTheme(activeTheme);
    setMounted(true);
  }, [user, id]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Confetti on registration complete
  useEffect(() => {
    if (data?.registration_complete && !confettiRan.current) {
      confettiRan.current = true;
      if (typeof window !== "undefined") {
        import("canvas-confetti").then(confetti => {
          confetti.default({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#8B1A1A", "#D4A017", "#ffffff"] });
        });
      }
    }
  }, [data]);

  if (loading || profileLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <span className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );
  if (!data) return null;

  const isOwner = authProfile?.id === id || String(authProfile?.id) === String(id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header Banner - displaying campus photo dynamically with brand-maroon gradients */}
      <div style={{
        backgroundImage: "linear-gradient(to right, rgba(107, 20, 20, 0.95) 30%, rgba(26, 26, 46, 0.85) 100%), url('/amrita_campus2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: 220,
        position: "relative"
      }} className="glow-shadow-maroon">
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.1)" }}></div>
        
        {/* Back to Dashboard & Theme Toggle */}
        <div style={{ position: "absolute", top: "1.5rem", left: "2rem", zIndex: 10, display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/dashboard">
            <button className="btn-ghost" style={{
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.15)"
            }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </Link>
          {mounted && (
            <button onClick={toggleTheme} className="btn-ghost" style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)"
            }} aria-label="Toggle Dark Mode">
              {theme === "light" ? <Moon size={18} color="white" /> : <Sun size={18} color="#D4A017" />}
            </button>
          )}
        </div>

        {/* Edit Button */}
        <div style={{ position: "absolute", bottom: "1.5rem", right: "2rem", zIndex: 10 }}>
          {isOwner && (
            <Link href="/register">
              <button className="btn-gold glow-shadow-gold" style={{ fontSize: "0.85rem", padding: "0.6rem 1.25rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Edit size={14} /> Edit Profile
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem 4rem" }}>
        
        {/* Profile Card Header overlaying banner */}
        <div className="card glow-shadow-maroon animate-fade-in" style={{
          marginTop: -60,
          marginBottom: "2rem",
          padding: "2rem",
          background: "var(--card-bg)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          position: "relative",
          zIndex: 5
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
            
            {/* Avatar Frame */}
            <div style={{
              width: 120,
              height: 120,
              borderRadius: "20px",
              border: "4px solid var(--card-bg)",
              overflow: "hidden",
              background: "linear-gradient(135deg,#8B1A1A,#6B1414)",
              flexShrink: 0,
              boxShadow: "0 10px 30px rgba(139,26,26,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {data.photo_url ? (
                <img src={data.photo_url} alt={data.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={56} color="#D4A017" />
              )}
            </div>

            {/* Profile Brief Info */}
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                <h1 style={{ fontSize: "1.9rem", color: "var(--text-primary)", fontFamily: "Montserrat", fontWeight: 800 }}>{data.full_name}</h1>
                {data.registration_complete && (
                  <span className="badge badge-green" style={{ padding: "0.25rem 0.75rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <CheckCircle size={11} /> VERIFIED ALUMNI
                  </span>
                )}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Briefcase size={16} color="#8B1A1A" />
                {data.career?.designation ? (
                  <span>{data.career.designation} {data.career?.current_company ? `at ${data.career.current_company}` : ""}</span>
                ) : (
                  <span style={{ color: "#9ca3af" }}>No employment listed</span>
                )}
              </p>
              
              {/* Badges container */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {data.academic?.degree && <span className="badge badge-maroon" style={{ padding: "0.3rem 0.8rem", fontSize: "0.78rem" }}>{data.academic.degree}</span>}
                {data.academic?.batch_year && <span className="badge badge-gold" style={{ padding: "0.3rem 0.8rem", fontSize: "0.78rem" }}>Batch {data.academic.batch_year}</span>}
                {data.academic?.department && (
                  <span className="badge" style={{
                    background: "rgba(26,26,46,0.06)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    padding: "0.3rem 0.8rem",
                    fontSize: "0.78rem"
                  }}>
                    {data.academic.department}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs & Sections */}
        <div className="card glow-shadow-maroon animate-fade-in" style={{
          background: "var(--card-bg)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          overflow: "hidden"
        }}>
          {/* Elegant tab navigator */}
          <div className="tab-nav" style={{ padding: "0 1.5rem", background: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)" }}>
            {TABS.map(t => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.88rem",
                  fontFamily: "Montserrat",
                  fontWeight: 700,
                  transition: "all 0.2s"
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: "2.5rem" }}>
            
            {/* Tab content 1: Overview */}
            {activeTab === "Overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {[
                  { icon: <Mail size={18} />, label: "Email Address", value: data.email },
                  { icon: <Phone size={18} />, label: "Mobile / Whatsapp", value: data.contact?.mobile || "—" },
                  { icon: <MapPin size={18} />, label: "Current Location", value: [data.contact?.city, data.contact?.country].filter(Boolean).join(", ") || "—" },
                  { icon: <Shield size={18} />, label: "Nationality", value: data.nationality || "—" },
                ].map(row => (
                  <div key={row.label} className="glass-card" style={{
                    padding: "1.25rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    background: "rgba(139,26,26,0.02)"
                  }}>
                    <div style={{
                      color: "#8B1A1A",
                      flexShrink: 0,
                      background: "rgba(139,26,26,0.06)",
                      padding: "0.5rem",
                      borderRadius: "8px"
                    }}>{row.icon}</div>
                    <div>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.2rem" }}>{row.label}</p>
                      <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem" }}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab content 2: Career */}
            {activeTab === "Career" && data.career && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div>
                  <h3 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "1rem" }}>Current Status</h3>
                  <div style={{ background: "rgba(139,26,26,0.02)", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border-color)" }} className="glass-card">
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, background: "rgba(139,26,26,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Briefcase size={20} color="#8B1A1A" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.05rem" }}>{data.career.designation || "Professional"}</p>
                        <p style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.95rem", marginTop: 2 }}>{data.career.current_company || "—"}</p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 6, fontWeight: 500 }}>
                          {data.career.industry_sector} · {data.career.employment_type} · {[data.career.work_city, data.career.work_country].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {data.career.skills?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "1rem" }}>Core Skills</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {data.career.skills.map((s: string) => (
                        <span key={s} className="tag glow-shadow-maroon" style={{
                          padding: "0.4rem 0.9rem",
                          borderRadius: "20px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          background: "rgba(139,26,26,0.06)",
                          color: "#8B1A1A",
                          border: "1px solid rgba(139,26,26,0.12)"
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.career.career_history?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "1.25rem" }}>Previous Experience</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", borderLeft: "2px dashed rgba(139,26,26,0.2)", paddingLeft: "1.5rem", marginLeft: "0.5rem" }}>
                      {data.career.career_history.map((h: any, i: number) => (
                        <div key={i} style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "-1.9rem", top: "5px", width: "10px", height: "10px", borderRadius: "50%", background: "#8B1A1A", border: "2px solid var(--card-bg)" }}></span>
                          <div>
                            <p style={{ fontWeight: 800, color: "var(--text-primary)" }}>{h.designation}</p>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 600 }}>{h.company_name}</p>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: 4, fontWeight: 500 }}>{h.from_year} – {h.to_year || "Present"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab content 3: Education */}
            {activeTab === "Education" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h3 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>Academic Timeline</h3>
                
                {data.academic && (
                  <div style={{ background: "rgba(212,160,23,0.02)", borderRadius: 12, padding: "1.5rem", border: "1px solid rgba(212,160,23,0.15)" }}>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ width: 44, height: 44, background: "rgba(212,160,23,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <GraduationCap size={20} color="#D4A017" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.05rem" }}>{data.academic.degree} in {data.academic.specialization || data.academic.department}</p>
                        <p style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.95rem", marginTop: 2 }}>{data.academic.university_name} · {data.academic.campus}</p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: 6, fontWeight: 500 }}>Admission: {data.academic.admission_year} — Graduating: {data.academic.batch_year}</p>
                      </div>
                    </div>
                  </div>
                )}

                {data.higher_education && !data.higher_education.not_applicable && (
                  <div style={{ background: "rgba(139,26,26,0.02)", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ width: 44, height: 44, background: "rgba(139,26,26,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <GraduationCap size={20} color="#8B1A1A" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.05rem" }}>{data.higher_education.degree} in {data.higher_education.specialization}</p>
                        <p style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.95rem", marginTop: 2 }}>{data.higher_education.university_name} · {data.higher_education.country}</p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: 6, fontWeight: 500 }}>
                          {data.higher_education.is_ongoing ? "Currently Pursuing" : `${data.higher_education.admission_year} – ${data.higher_education.graduation_year}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab content 4: Engagement */}
            {activeTab === "Engagement" && data.engagement && (
              <div>
                <h3 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "1.25rem" }}>Support & Mentorship Preferences</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                  {[
                    { key: "mentoring", label: "Student Mentorship", icon: "🎓" },
                    { key: "guest_lectures", label: "Alumni Guest Lectures", icon: "🎤" },
                    { key: "recruitment_support", label: "Campus Recruitment", icon: "💼" },
                    { key: "internship_support", label: "Student Internships", icon: "🏢" },
                    { key: "donations_csr", label: "CSR Support & Donations", icon: "❤️" },
                    { key: "alumni_chapters", label: "Alumni Chapters Activity", icon: "🤝" },
                  ].map(({ key, label, icon }) => (
                    <div key={key} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.25rem",
                      background: data.engagement[key] ? "rgba(34,197,94,0.04)" : "var(--bg-primary)",
                      borderRadius: 12,
                      border: `1px solid ${data.engagement[key] ? "rgba(34,197,94,0.18)" : "var(--border-color)"}`
                    }}>
                      <span style={{ fontSize: "1.4rem" }}>{icon}</span>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
                      <span className={`badge ${data.engagement[key] ? "badge-green" : ""}`} style={{
                        marginLeft: "auto",
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.6rem",
                        ...(data.engagement[key] ? {} : { background: "rgba(156,163,175,0.12)", color: "#9ca3af", border: "1px solid rgba(156,163,175,0.2)" })
                      }}>
                        {data.engagement[key] ? "Open" : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab content 5: Social */}
            {activeTab === "Social" && (
              <div>
                <h3 style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "1.25rem" }}>Digital Profiles & Resume</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "480px" }}>
                  {[
                    { key: "linkedin", label: "LinkedIn Profile", icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    ), color: "#0077b5" },
                    { key: "github", label: "GitHub Account", icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a2e"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    ), color: "#1a1a2e" },
                    { key: "portfolio", label: "Personal Website", icon: <Globe size={18} color="#8B1A1A" />, color: "#8B1A1A" },
                  ].map(({ key, label, icon, color }) => data.social?.[key] && (
                    <a key={key} href={data.social[key]} target="_blank" rel="noreferrer" style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "1rem 1.25rem",
                      background: "var(--card-bg)",
                      borderRadius: 12,
                      border: "2px solid #e0d8d0",
                      textDecoration: "none",
                      transition: "border-color 0.2s",
                      color: "var(--text-primary)"
                    }} className="glow-shadow-maroon">
                      {icon}
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{label}</span>
                      <ExternalLink size={14} style={{ marginLeft: "auto", color: "#9ca3af" }} />
                    </a>
                  ))}
                  
                  {data.social?.resume_url && (
                    <a href={data.social.resume_url} target="_blank" rel="noreferrer" style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "1rem 1.25rem",
                      background: "linear-gradient(135deg,#8B1A1A,#6B1414)",
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "white",
                      justifyContent: "center",
                      fontWeight: 700,
                      boxShadow: "0 4px 16px rgba(139,26,26,0.2)"
                    }} className="glow-shadow-maroon">
                      <Download size={18} />
                      <span>Download Resume</span>
                    </a>
                  )}
                  
                  {!data.social?.linkedin && !data.social?.github && !data.social?.portfolio && !data.social?.resume_url && (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0", fontSize: "0.9rem", fontWeight: 500 }}>No social links registered.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Tagline & Creator Recognition Footer */}
        <footer style={{ marginTop: "4rem", borderTop: "1px solid var(--border-color)", paddingTop: "2.5rem", paddingBottom: "2.5rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <p style={{ fontStyle: "italic", color: "#D4A017", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
            "Your legacy is our inspiration. Keep shining, keep guiding."
          </p>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
            Made with ❤️ by <span style={{ color: "#8B1A1A", fontWeight: 800 }} className="dark:text-gold">Amrita Students</span> — 2027 Batch
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
            © {new Date().getFullYear()} Amrita Vishwa Vidyapeetham — Alumni Community. All rights reserved.
          </div>
        </footer>

      </div>
    </div>
  );
}
