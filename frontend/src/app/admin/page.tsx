"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search, Filter, Download, LogOut, ChevronUp, ChevronDown, X, GraduationCap } from "lucide-react";
import api from "@/lib/api";

const DEPARTMENTS = ["Computer Science & Engineering","Electronics & Communication","Electrical Engineering","Mechanical Engineering","Civil Engineering","Information Technology","Biotechnology","MBA"];
const DEGREES = ["B.Tech","M.Tech","MBA","PhD","B.Sc","M.Sc","Other"];
const STATUSES = ["Employed","Higher Studies","Entrepreneur","Government Services","Preparing for Exams"];

function StatCard({ label, value, color }: any) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color || "#8B1A1A" }}>
      <p style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.4rem" }}>{label}</p>
      <p style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: "1.6rem", color: "#1a1a2e" }}>{value ?? <span className="skeleton" style={{ display: "inline-block", width: 60, height: 24 }} />}</p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [sortCol, setSortCol] = useState("full_name");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await api.post("/api/admin/login", loginForm);
      setAuthed(true);
      toast.success("Welcome, Admin!");
    } catch { toast.error("Invalid credentials."); }
    finally { setLoginLoading(false); }
  };

  const fetchStats = async () => {
    try { const r = await api.get("/api/admin/stats"); setStats(r.data); } catch {}
  };

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 25, search: search || undefined, ...filters };
      const r = await api.get("/api/admin/alumni", { params });
      setAlumni(r.data.items);
      setTotal(r.data.total);
      setTotalPages(r.data.total_pages);
    } catch {} finally { setLoading(false); }
  }, [page, search, filters]);

  useEffect(() => { if (authed) { fetchStats(); fetchAlumni(); } }, [authed, fetchAlumni]);

  const handleLogout = async () => {
    await api.post("/api/admin/logout");
    setAuthed(false);
  };

  const applyFilters = (f: any) => {
    setFilters(f);
    const count = Object.values(f).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length;
    setActiveFilterCount(count);
    setPage(1);
    setFiltersOpen(false);
  };

  const exportCSV = async () => {
    try {
      const params: any = { search: search || undefined, ...filters };
      const r = await api.get("/api/admin/export", { params, responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url; a.download = `alumni_export_${new Date().toISOString().slice(0,10)}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Export failed."); }
  };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    const sorted = [...alumni].sort((a, b) => {
      const av = a[col] ?? ""; const bv = b[col] ?? "";
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    setAlumni(sorted);
  };

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f5f0,#f0ece6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#8B1A1A,#6B1414)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <GraduationCap size={28} color="#D4A017" />
          </div>
          <h1 style={{ fontSize: "1.4rem", color: "#1a1a2e" }}>Admin Login</h1>
          <p style={{ color: "#6b7280", fontSize: "0.88rem", marginTop: "0.25rem" }}>Amrita Alumni Portal Administration</p>
        </div>
        <div className="card" style={{ padding: "2rem" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="form-label">Username</label>
              <input className="form-input" value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} placeholder="Admin username" autoComplete="username" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="Admin password" autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.9rem" }}>
              {loginLoading ? <><span className="spinner" />Signing in...</> : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f5f0" }}>
      {/* Admin Navbar */}
      <nav style={{ background: "linear-gradient(135deg,#8B1A1A,#6B1414)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <GraduationCap size={24} color="#D4A017" />
          <span style={{ color: "white", fontFamily: "Montserrat", fontWeight: 700, fontSize: "1rem" }}>Alumni Portal — Admin</span>
        </div>
        <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "0.4rem 1rem", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontFamily: "Montserrat", fontWeight: 600 }}>
          <LogOut size={14} /> Logout
        </button>
      </nav>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard label="Total Alumni" value={stats?.total_alumni} color="#8B1A1A" />
          <StatCard label="Fully Registered" value={stats?.fully_registered} color="#D4A017" />
          <StatCard label="Employed" value={stats?.employed} color="#16a34a" />
          <StatCard label="Higher Studies" value={stats?.higher_studies} color="#2563eb" />
          <StatCard label="Entrepreneurs" value={stats?.entrepreneurs} color="#7c3aed" />
          <StatCard label="Mentors" value={stats?.mentors_available} color="#0891b2" />
          <StatCard label="Can Refer" value={stats?.can_refer} color="#ea580c" />
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input className="form-input" style={{ paddingLeft: "2.4rem" }} placeholder="Search name, email, company, ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-outline" style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.88rem" }}>
            <Filter size={15} /> Filters
            {activeFilterCount > 0 && <span style={{ position: "absolute", top: -8, right: -8, background: "#8B1A1A", color: "white", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>{activeFilterCount}</span>}
          </button>
          <button onClick={exportCSV} className="btn-primary" style={{ fontSize: "0.88rem", padding: "0.65rem 1.25rem" }}>
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <FilterMulti label="Department" options={DEPARTMENTS} value={filters.department || []} onChange={v => setFilters((p: any) => ({ ...p, department: v }))} />
            <FilterMulti label="Degree" options={DEGREES} value={filters.degree || []} onChange={v => setFilters((p: any) => ({ ...p, degree: v }))} />
            <FilterMulti label="Employment Status" options={STATUSES} value={filters.employment_status || []} onChange={v => setFilters((p: any) => ({ ...p, employment_status: v }))} />
            <div>
              <label className="form-label">Company</label>
              <input className="form-input" placeholder="Company name" value={filters.company || ""} onChange={e => setFilters((p: any) => ({ ...p, company: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Mentoring Available</label>
              <select className="form-input" value={filters.mentoring || ""} onChange={e => setFilters((p: any) => ({ ...p, mentoring: e.target.value }))}>
                <option value="">All</option><option value="Yes">Yes</option><option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="form-label">Can Refer Students</label>
              <select className="form-input" value={filters.can_refer || ""} onChange={e => setFilters((p: any) => ({ ...p, can_refer: e.target.value }))}>
                <option value="">All</option><option value="Yes">Yes</option><option value="No">No</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem" }}>
              <button onClick={() => applyFilters(filters)} className="btn-primary" style={{ fontSize: "0.88rem" }}>Apply Filters</button>
              <button onClick={() => { setFilters({}); setActiveFilterCount(0); setPage(1); }} className="btn-ghost">Clear All</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card">
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e0d8d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "#4b5563", fontWeight: 500 }}>
              Showing {Math.min((page - 1) * 25 + 1, total)}–{Math.min(page * 25, total)} of {total} alumni
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {[["photo",""], ["full_name","Name"], ["batch_year","Batch"], ["department","Dept"], ["degree","Degree"], ["current_company","Company"], ["designation","Designation"], ["work_city","Location"], ["employment_status","Status"], ["registration_complete","Registered"], ["","Actions"]].map(([col, label]) => (
                    <th key={col} onClick={() => col && handleSort(col)} style={{ cursor: col ? "pointer" : "default" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        {label}
                        {col && sortCol === col && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={11}><div className="skeleton" style={{ height: 20, margin: "0.5rem 0" }} /></td></tr>
                )) : alumni.map((a) => (
                  <tr key={a.id}>
                    <td><div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: "#f0ece6", display: "flex", alignItems: "center", justifyContent: "center" }}>{a.photo_url ? <img src={a.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: "0.9rem" }}>👤</span>}</div></td>
                    <td><span style={{ fontWeight: 600, color: "#1a1a2e" }}>{a.full_name}</span><br/><span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{a.email}</span></td>
                    <td>{a.batch_year || "—"}</td>
                    <td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.department || "—"}</td>
                    <td>{a.degree || "—"}</td>
                    <td>{a.current_company || "—"}</td>
                    <td>{a.designation || "—"}</td>
                    <td>{[a.work_city, a.work_country].filter(Boolean).join(", ") || "—"}</td>
                    <td><span className={`badge ${a.employment_status === "Employed" ? "badge-green" : a.employment_status === "Entrepreneur" ? "badge-maroon" : "badge-gold"}`}>{a.employment_status || "—"}</span></td>
                    <td><span className={`badge ${a.registration_complete ? "badge-green" : "badge-gold"}`}>{a.registration_complete ? "✓ Yes" : "Pending"}</span></td>
                    <td><button onClick={() => setSelectedAlumni(a)} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e0d8d0", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 6, border: p === page ? "2px solid #8B1A1A" : "1px solid #e0d8d0", background: p === page ? "#8B1A1A" : "white", color: p === page ? "white" : "#4b5563", cursor: "pointer", fontFamily: "Montserrat", fontWeight: 600, fontSize: "0.85rem" }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAlumni && (
        <div className="modal-overlay" onClick={() => setSelectedAlumni(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #e0d8d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.2rem", color: "#1a1a2e" }}>{selectedAlumni.full_name}</h2>
              <button onClick={() => setSelectedAlumni(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={22} /></button>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <AlumniDetailView id={selectedAlumni.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterMulti({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div style={{ maxHeight: 140, overflowY: "auto", border: "1px solid #e0d8d0", borderRadius: 8, padding: "0.5rem" }}>
        {options.map((o: string) => (
          <label key={o} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.2rem 0", cursor: "pointer", fontSize: "0.85rem" }}>
            <input type="checkbox" checked={value.includes(o)} onChange={e => onChange(e.target.checked ? [...value, o] : value.filter((v: string) => v !== o))} style={{ accentColor: "#8B1A1A" }} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function AlumniDetailView({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get(`/api/admin/alumni/${id}`).then(r => setData(r.data)).catch(() => {}); }, [id]);
  if (!data) return <div style={{ textAlign: "center", padding: "2rem" }}><span className="spinner spinner-dark" /></div>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
      {[
        ["Personal", { Name: data.full_name, Email: data.email, Gender: data.gender, DOB: data.date_of_birth, Nationality: data.nationality, "Student ID": data.student_id }],
        ["Contact", { Mobile: data.contact?.mobile, WhatsApp: data.contact?.whatsapp, City: data.contact?.city, Country: data.contact?.country, LinkedIn: data.contact?.linkedin_url }],
        ["Academic", { University: data.academic?.university_name, Campus: data.academic?.campus, Department: data.academic?.department, Degree: data.academic?.degree, Batch: data.academic?.batch_year }],
        ["Career", { Status: data.career?.employment_status, Company: data.career?.current_company, Role: data.career?.designation, Industry: data.career?.industry_sector, CTC: data.career?.ctc_range, Experience: data.career?.years_of_experience ? `${data.career.years_of_experience} yrs` : undefined }],
      ].map(([section, fields]) => (
        <div key={String(section)} style={{ background: "#f8f5f0", borderRadius: 10, padding: "1rem" }}>
          <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.85rem", color: "#8B1A1A", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>{String(section)}</p>
          {Object.entries(fields as any).map(([k, v]) => v ? (
            <div key={k} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.4rem", fontSize: "0.85rem" }}>
              <span style={{ color: "#9ca3af", minWidth: 100, flexShrink: 0 }}>{k}</span>
              <span style={{ color: "#1a1a2e", fontWeight: 500, wordBreak: "break-word" }}>{String(v)}</span>
            </div>
          ) : null)}
        </div>
      ))}
      {data.career?.skills?.length > 0 && (
        <div style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.85rem", color: "#8B1A1A", marginBottom: "0.5rem" }}>SKILLS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {data.career.skills.map((s: string) => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
