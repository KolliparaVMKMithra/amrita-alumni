"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, User, Briefcase, FileText, Settings, LogOut, Bell, ChevronRight, CheckCircle, AlertCircle, Globe, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

export default function DashboardPage() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      api.get("/api/profile/me").then(r => setFullProfile(r.data)).catch(() => {}).finally(() => setProfileLoading(false));
    }
    
    const activeTheme = localStorage.getItem("theme") || "light";
    setTheme(activeTheme);
    setMounted(true);
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => { await logout(); router.push("/"); };

  if (loading || !user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <span className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  const isComplete = profile?.registration_complete;
  const firstName = profile?.full_name?.split(" ")[0] || "Alumni";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Navbar with brand-new premium logo layout & Theme Toggle */}
      <nav className="navbar glow-shadow-maroon" style={{ background: "var(--navbar-bg)", padding: "0.5rem 2rem", height: "72px", borderBottom: "1px solid var(--border-color)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <img src="/amrita_logo.png" alt="Amrita Logo" style={{ height: "42px", objectFit: "contain" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {mounted && (
            <button onClick={toggleTheme} className="btn-ghost" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }} aria-label="Toggle Dark Mode">
              {theme === "light" ? <Moon size={18} color="#8B1A1A" /> : <Sun size={18} color="#D4A017" />}
            </button>
          )}
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(139,26,26,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} className="glow-shadow-gold">
            <Bell size={17} color="#8B1A1A" />
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
            <LogOut size={16} color="var(--text-primary)" /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem" }}>
        
        {/* Modern Executive Dashboard Hero Card */}
        <div className="glow-shadow-maroon animate-fade-in" style={{
          background: "linear-gradient(135deg, #8B1A1A 0%, #6B1414 60%, #1a1a2e 100%)",
          borderRadius: "18px",
          padding: "2.5rem",
          color: "white",
          marginBottom: "2.5rem",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle decoration circles */}
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "rgba(212,160,23,0.15)", borderRadius: "50%", filter: "blur(40px)" }}></div>
          <div style={{ position: "absolute", bottom: "-20px", left: "25%", width: "200px", height: "80px", background: "rgba(139,26,26,0.35)", borderRadius: "50%", filter: "blur(60px)" }}></div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem", position: "relative", zIndex: 2 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "0.3rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, color: "#D4A017", textTransform: "uppercase", letterSpacing: "1px", width: "fit-content", marginBottom: "1rem" }}>
                <span className="glow-dot" style={{ backgroundColor: "#D4A017" }}></span> Official Alumni Member
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Montserrat", lineHeight: 1.2, color: "white", marginBottom: "0.5rem" }}>
                Welcome back, <span className="text-gradient-gold" style={{ fontWeight: 800 }}>{firstName}!</span> 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", maxWidth: "600px", lineHeight: 1.6 }}>
                Re-connect with classmates, explore professional mentorship networks, and share amazing career milestones with the Amrita community.
              </p>
            </div>
            
            {/* Elegant glassmorphic calendar box */}
            <div className="glass-card-dark" style={{ border: "1px solid rgba(212,160,23,0.25)", padding: "0.75rem 1.25rem", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "160px" }}>
              <span style={{ fontSize: "0.7rem", color: "#D4A017", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>System Date</span>
              <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "white", fontFamily: "Montserrat" }}>
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
              </span>
            </div>
          </div>
        </div>

        {/* Profile incomplete warning */}
        {!isComplete && (
          <div className="alert-warning animate-fade-in glow-shadow-gold" style={{ marginBottom: "2.5rem", borderRadius: 14, padding: "1.5rem", border: "1px solid rgba(217,119,6,0.3)", background: "rgba(217,119,6,0.06)", display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
            <AlertCircle size={28} color="#d97706" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: "260px" }}>
              <p style={{ fontFamily: "Montserrat", fontWeight: 700, color: "#92400e", marginBottom: "0.25rem", fontSize: "1.05rem" }}>Complete your Alumni Profile</p>
              <p style={{ fontSize: "0.88rem", color: "#b45309", fontWeight: 500 }}>Be listed in the official campus alumni directory, access job referrals, and unlock all platform features.</p>
            </div>
            <Link href="/register">
              <button className="btn-gold glow-shadow-gold" style={{ padding: "0.75rem 1.5rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                Finish Setup (9 Steps) <ChevronRight size={15} />
              </button>
            </Link>
          </div>
        )}

        {/* Stats Grid - High-end redesigned layout with beautiful icons and hover scaling */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Profile Status", value: isComplete ? "Verified Member ✓" : "Incomplete", color: isComplete ? "#16a34a" : "#d97706", icon: <CheckCircle size={18} color={isComplete ? "#16a34a" : "#d97706"} />, borderColor: isComplete ? "#22c55e" : "#D4A017" },
            { label: "Graduation Batch", value: fullProfile?.academic?.batch_year || "—", icon: <GraduationCap size={18} color="#8B1A1A" />, borderColor: "#8B1A1A" },
            { label: "Academic Specialization", value: fullProfile?.academic?.department || "—", icon: <Globe size={18} color="#8B1A1A" />, borderColor: "#8B1A1A" },
            { label: "Current Employment", value: fullProfile?.career?.current_company || "—", icon: <Briefcase size={18} color="#8B1A1A" />, borderColor: "#8B1A1A" },
          ].map((s) => (
            <div key={s.label} className="card glow-shadow-maroon animate-fade-in" style={{
              padding: "1.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              background: "var(--card-bg)",
              borderTop: "1px solid var(--border-color)",
              borderRight: "1px solid var(--border-color)",
              borderBottom: "1px solid var(--border-color)",
              borderLeft: `4px solid ${s.borderColor}`,
              borderRadius: "12px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}>
              <div style={{
                background: "rgba(139,26,26,0.05)",
                borderRadius: "10px",
                padding: "0.55rem",
                color: "#8B1A1A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.25rem" }}>{s.label}</p>
                <p style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.05rem", color: s.color || "var(--text-primary)" }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions - Upgraded to card layout with active shifts and border lights */}
        <h2 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "1.25rem", fontFamily: "Montserrat", fontWeight: 800 }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          {[
            { icon: <User size={22} />, label: "View Public Profile", desc: "See how your profile looks to other alumni", href: `/profile/${fullProfile?.id || "me"}`, primary: false },
            { icon: <FileText size={22} />, label: isComplete ? "Update Profile Information" : "Complete Registration", desc: isComplete ? "Modify your details" : "Finish your 9-step profile", href: "/register", primary: !isComplete },
            { icon: <Briefcase size={22} />, label: "Update Career Milestones", desc: "Share your latest promotions or job switches", href: "/register", primary: false },
            { icon: <Settings size={22} />, label: "Security & Account Settings", desc: "Manage your credentials and keys", href: "#", primary: false },
          ].map((a) => (
            <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
              <div className="card card-hover glow-shadow-maroon animate-fade-in" style={{
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                height: "100%",
                background: "var(--card-bg)",
                borderRadius: "14px",
                borderLeft: "1px solid var(--border-color)",
                borderRight: "1px solid var(--border-color)",
                borderBottom: "1px solid var(--border-color)",
                borderTop: a.primary ? "4px solid #8B1A1A" : "1px solid var(--border-color)",
                position: "relative"
              }}>
                <div style={{
                  color: "#8B1A1A",
                  marginBottom: "0.4rem",
                  background: "rgba(139,26,26,0.05)",
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>{a.icon}</div>
                <p style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "0.98rem", color: "var(--text-primary)" }}>{a.label}</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, fontWeight: 500 }}>{a.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#8B1A1A", fontSize: "0.82rem", fontWeight: 700, marginTop: "auto", paddingTop: "1rem" }}>
                  Explore <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Profile Summary if complete - Re-designed executive pass */}
        {isComplete && fullProfile && (
          <div style={{ marginTop: "3rem" }} className="animate-fade-in">
            <h2 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "1.25rem", fontFamily: "Montserrat", fontWeight: 800 }}>Your Alumni Digital Badge</h2>
            <div className="card glow-shadow-maroon" style={{
              padding: "2rem",
              background: "linear-gradient(135deg, var(--card-bg) 0%, var(--bg-primary) 100%)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Gold foil pattern overlays */}
              <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "100%", background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.04))", pointerEvents: "none" }}></div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
                <div style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg,#8B1A1A,#6B1414)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "3px solid #D4A017",
                  boxShadow: "0 8px 24px rgba(139,26,26,0.2)"
                }}>
                  {fullProfile.photo_url ? (
                    <img src={fullProfile.photo_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <User size={50} color="#D4A017" />
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontFamily: "Montserrat", fontWeight: 800 }}>{profile?.full_name}</h3>
                    <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.25rem 0.75rem" }}>
                      <CheckCircle size={12} /> VERIFIED ALUMNI
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                    {fullProfile.career?.designation} {fullProfile.career?.current_company ? `at ${fullProfile.career.current_company}` : "Professional Switch"}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {fullProfile.academic?.degree && <span className="badge badge-maroon" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>{fullProfile.academic.degree}</span>}
                    {fullProfile.academic?.batch_year && <span className="badge badge-gold" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>Batch {fullProfile.academic.batch_year}</span>}
                    {fullProfile.academic?.campus && <span className="badge" style={{ background: "rgba(26,26,46,0.06)", color: "var(--text-primary)", padding: "0.3rem 0.8rem", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}>{fullProfile.academic.campus}</span>}
                  </div>
                </div>
                
                <div style={{ borderLeft: "2px dashed rgba(139,26,26,0.15)", paddingLeft: "2rem", height: "100px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "150px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Digital Pass ID</span>
                  <span style={{ fontSize: "1.05rem", fontFamily: "Courier New, monospace", fontWeight: 700, color: "#8B1A1A", letterSpacing: "1px", marginTop: "0.25rem" }}>
                    AMR-{fullProfile.id?.slice(0, 8).toUpperCase() || "MEMBER"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 600, marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="glow-dot" style={{ width: 6, height: 6 }}></span> Active Network Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Tagline & Creator Recognition Footer */}
        <footer style={{ marginTop: "4rem", borderTop: "1px solid var(--border-color)", paddingTop: "2.5rem", paddingBottom: "2.5rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <p style={{ fontStyle: "italic", color: "#D4A017", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
            "Your gateway to endless opportunities and lifelong campus bonds."
          </p>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
            Made with ❤️ by <span style={{ color: "#8B1A1A", fontWeight: 800 }} className="dark:text-gold">Amrita Students</span> — 2027 Batch
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
            © {new Date().getFullYear()} Amrita Vishwa Vidyapeetham — Alumni Portal. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
