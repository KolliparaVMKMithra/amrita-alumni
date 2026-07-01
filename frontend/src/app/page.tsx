"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, Users, Briefcase, Globe, ChevronRight, Star, ArrowRight, Sun, Moon } from "lucide-react";
import api from "@/lib/api";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalAlumni: "10,000+",
    topRecruiters: "500+",
    globalPresence: "60+",
    academicBatches: "40+"
  });
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    api.get("/api/admin/stats/public").then((r) => {
      if (r.data) {
        setStats({
          totalAlumni: (r.data.total_alumni || 10000).toLocaleString() + "+",
          topRecruiters: (r.data.top_recruiters || 500).toLocaleString() + "+",
          globalPresence: (r.data.global_presence || 60).toLocaleString() + "+",
          academicBatches: (r.data.academic_batches || 40).toLocaleString() + "+"
        });
      }
    }).catch(() => {});
    
    const activeTheme = localStorage.getItem("theme") || "light";
    setTheme(activeTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav className="navbar glow-shadow-maroon" style={{ padding: "0.5rem 2rem", height: "76px", background: "var(--navbar-bg)" }}>
        <Link href="/" className="navbar-logo" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <img src="/amrita_logo.png" alt="Amrita Vishwa Vidyapeetham Logo" style={{ height: "48px", objectFit: "contain" }} />
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {mounted && (
            <button onClick={toggleTheme} className="btn-ghost" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }} aria-label="Toggle Dark Mode">
              {theme === "light" ? <Moon size={19} color="#8B1A1A" /> : <Sun size={19} color="#D4A017" />}
            </button>
          )}
          <Link href="/auth/login"><button className="btn-ghost" style={{ fontWeight: 700 }}>Login</button></Link>
          <Link href="/auth/signup"><button className="btn-primary" style={{ boxShadow: "0 4px 12px rgba(139,26,26,0.2)", borderRadius: "10px" }}>Create Account</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "center" }}>
          <div className="animate-fade-in">
            <div className="badge badge-gold" style={{ marginBottom: "1.5rem", fontSize: "0.8rem", padding: "0.4rem 1rem", border: "1px solid rgba(212,160,23,0.4)" }}>
              <Star size={12} style={{ marginRight: 4 }} fill="currentColor" />
              Amrita Vishwa Vidyapeetham
            </div>
            <h1 style={{ fontSize: "3.8rem", color: "white", lineHeight: 1.1, marginBottom: "1.25rem", fontFamily: "Montserrat", fontWeight: 800 }}>
              Amrita<br />
              <span className="text-gradient-gold">Alumni</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", marginBottom: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
              Connecting Thousands of Global Change-Makers
            </p>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.65)", marginBottom: "2.5rem", lineHeight: 1.7, maxWidth: "560px" }}>
              Join our vibrant alumni network. Reconnect with batchmates, discover career opportunities, mentor the next generation, and stay connected with your alma mater.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/auth/signup">
                <button className="btn-gold" style={{ fontSize: "1rem", padding: "0.9rem 2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  Register as Alumni <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "white", fontSize: "1rem", padding: "0.9rem 2rem" }}>
                  Already a Member?
                </button>
              </Link>
            </div>
          </div>
          <div className="animate-fade-in hero-visual-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="img-card-container" style={{ position: "relative", height: "300px", borderRadius: "18px", border: "4px solid rgba(255,255,255,0.2)" }}>
              <img src="/amrita_campus2.png" alt="Amrita Campus Aerial View" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div className="img-card-overlay">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(139,26,26,0.9)", border: "1px solid rgba(212,160,23,0.4)", padding: "0.4rem 0.8rem", borderRadius: "20px", alignSelf: "flex-start", marginBottom: "auto", fontSize: "0.75rem", fontFamily: "Montserrat", fontWeight: 700 }}>
                  <span className="glow-dot"></span> Amaravati Campus
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "0.25rem", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>World-Class Infrastructure</h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Amrita School of Engineering & Research Facilities</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Total Alumni", value: stats.totalAlumni, color: "#D4A017" },
                { label: "Top Recruiters", value: stats.topRecruiters },
                { label: "Global Presence", value: `${stats.globalPresence} Countries` },
                { label: "Academic Batches", value: stats.academicBatches }
              ].map((s) => (
                <div key={s.label} className="glass-card-dark" style={{ borderRadius: 12, padding: "1rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color || "white", fontFamily: "Montserrat" }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "0.15rem", fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ color: "#8B1A1A", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "0.75rem" }}>About the Portal</p>
          <h2 style={{ fontSize: "2.4rem", color: "var(--text-primary)", fontFamily: "Montserrat", fontWeight: 800 }}>Your Gateway to the<br /><span style={{ color: "#8B1A1A" }}>Amrita Community</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem" }}>
          {[
            { icon: "🎓", title: "Alumni Directory", desc: "Search and connect with fellow alumni by batch, department, company, or location. Build meaningful professional relationships." },
            { icon: "💼", title: "Career Opportunities", desc: "Access exclusive job referrals and internships from alumni. Post openings and help fellow alumni grow in their careers." },
            { icon: "🤝", title: "Mentorship", desc: "Offer mentorship to current students and junior alumni. Share your expertise and give back to your alma mater." },
            { icon: "🏛️", title: "Campus Connect", desc: "Attend events, give guest lectures, and participate in campus activities. Stay connected with the university you love." },
          ].map((c) => (
            <div key={c.title} className="card card-hover glow-shadow-maroon" style={{ padding: "2.25rem", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{c.icon}</div>
              <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.75rem", fontFamily: "Montserrat", fontWeight: 700 }}>{c.title}</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Heritage Section */}
      <section style={{ background: "var(--bg-secondary)", padding: "6rem 2rem", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div className="img-card-container" style={{ position: "relative", height: "380px", border: "6px solid var(--card-bg)" }}>
            <img src="/amrita_campus1.jpg" alt="Amrita Campus Exterior" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div className="img-card-overlay">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(212,160,23,0.95)", color: "#1a1a2e", padding: "0.4rem 0.8rem", borderRadius: "20px", alignSelf: "flex-start", marginBottom: "auto", fontSize: "0.75rem", fontFamily: "Montserrat", fontWeight: 800 }}>
                A’ Grade NAAC Accredited
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: "0.25rem", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Amrita Heritage & Legacy</h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>Rooted in Values, Education for Life</p>
            </div>
          </div>
          <div>
            <p style={{ color: "#8B1A1A", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "0.75rem" }}>Alma Mater</p>
            <h2 style={{ fontSize: "2.25rem", color: "var(--text-primary)", marginBottom: "1.5rem", lineHeight: 1.2 }}>
              A Campus That <span className="text-gradient-maroon" style={{ fontWeight: 800 }}>Inspires Greatness</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              With our state-of-the-art campus situated in the high-growth capital region, Amrita University Amaravati Campus stands as a beacon of academic excellence and modern innovation. Guided by our Chancellor Sri Mata Amritanandamayi Devi (Amma), the institution emphasizes research, societal service, and global collaboration.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="glass-card" style={{ padding: "1.25rem", borderRadius: 12, border: "1px solid var(--border-color)", background: "rgba(139,26,26,0.02)" }}>
                <div style={{ fontSize: "1.5rem", color: "#8B1A1A", marginBottom: "0.5rem" }}>🏆</div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>Rank #7 in India</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Ranked among India's top universities by NIRF.</p>
              </div>
              <div className="glass-card" style={{ padding: "1.25rem", borderRadius: 12, border: "1px solid var(--border-color)", background: "rgba(139,26,26,0.02)" }}>
                <div style={{ fontSize: "1.5rem", color: "#D4A017", marginBottom: "0.5rem" }}>🌍</div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>Top 100 Global</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Top 100 worldwide in THE Impact Rankings for SDGs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Register */}
      <section style={{ background: "linear-gradient(135deg,#1a1a2e,#121222)", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <p style={{ color: "#D4A017", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "0.75rem" }}>Why Register?</p>
            <h2 style={{ fontSize: "2.25rem", color: "white", marginBottom: "1.5rem", fontFamily: "Montserrat" }}>Be Part of Something<br />Extraordinary</h2>
            {[
              "Get listed in the official Amrita Alumni Directory",
              "Receive exclusive networking and job referral opportunities",
              "Mentor current students and junior alumni",
              "Access early-bird invitations to alumni events",
              "Participate in campus recruitment drives",
              "Be recognized as an Amrita Ambassador",
            ].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ width: 22, height: 22, background: "rgba(212,160,23,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ChevronRight size={13} color="#D4A017" />
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>{p}</span>
              </div>
            ))}
          </div>
          <div className="glass-card-dark glow-shadow-gold" style={{ borderRadius: 20, padding: "2.5rem", border: "1px solid rgba(212,160,23,0.15)" }}>
            <h3 style={{ color: "#D4A017", fontFamily: "Montserrat", marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 700 }}>Alumni Registration is FREE</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "2rem", fontSize: "0.95rem" }}>
              Complete your alumni profile in 9 easy steps. It takes less than 10 minutes. Your data is secure and used only for alumni networking purposes.
            </p>
            <Link href="/auth/signup">
              <button className="btn-gold" style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Register Now — It's Free <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with brand-new tagline and creator recognition */}
      <footer style={{ background: "#11111f", borderTop: "1px solid var(--border-color)", padding: "4rem 2rem 2rem", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
          <img src="/amrita_logo.png" alt="Amrita Logo" style={{ height: "44px", objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.8)" }} />
          <div style={{ maxWidth: "600px", color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Connecting alumni across cohorts, departments, and continents. Facilitating collaboration, mentorship, and career growth under the leadership of Sri Mata Amritanandamayi Devi.
          </div>
          <p style={{ fontStyle: "italic", color: "#D4A017", fontSize: "0.88rem", fontWeight: 600 }}>
            "Connecting Generations, Inspiring Futures."
          </p>
        </div>
        
        <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 auto 1.5rem", maxWidth: "800px" }}></div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 500 }}>
            Made with ❤️ by <span style={{ color: "#D4A017", fontWeight: 700 }}>Amrita Students</span> — 2027 Batch
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
            © {new Date().getFullYear()} Amrita Vishwa Vidyapeetham — Alumni Relations & Development Office. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
