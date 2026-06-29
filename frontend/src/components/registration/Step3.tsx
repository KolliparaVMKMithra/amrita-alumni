"use client";
interface Props { data: any; onChange: (d: any) => void; }

const ADMISSION_YEARS = Array.from({ length: 10 }, (_, i) => 2022 + i);
const BATCH_YEARS = Array.from({ length: 10 }, (_, i) => 2026 + i);

const DEPARTMENTS = [
  "CSE",
  "CSE-AI",
  "AI&DS",
  "CCE"
];
const DEGREES = ["B.Tech", "Other"];

export default function Step3({ data, onChange }: Props) {
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "0.5rem", fontFamily: "Montserrat", fontWeight: 800 }}>Academic Information</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "2rem" }}>Your academic background at Amrita Amaravati Campus</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label" style={{ fontWeight: 700 }}>University / College Name *</label>
          <input className="form-input input-glow-focus" value={data.university_name || "Amrita Vishwa Vidyapeetham"} onChange={e => onChange({ university_name: e.target.value })} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Campus *</label>
          <select className="form-input input-glow-focus" value={data.campus || "Amaravati"} onChange={e => onChange({ campus: e.target.value })} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}>
            <option value="Amaravati">Amaravati</option>
          </select>
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Branch / Department *</label>
          <select className="form-input input-glow-focus" value={data.department || ""} onChange={e => onChange({ department: e.target.value })} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}>
            <option value="">Select branch</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Program / Course *</label>
          <input className="form-input input-glow-focus" value={data.program || ""} onChange={e => onChange({ program: e.target.value })} placeholder="e.g. B.Tech" style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Specialization</label>
          <input className="form-input input-glow-focus" value={data.specialization || ""} onChange={e => onChange({ specialization: e.target.value })} placeholder="e.g. CSE-AI" style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Degree *</label>
          <select className="form-input input-glow-focus" value={data.degree || ""} onChange={e => onChange({ degree: e.target.value })} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}>
            <option value="">Select degree</option>
            {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Batch / Passing Year *</label>
          <select className="form-input input-glow-focus" value={data.batch_year || ""} onChange={e => onChange({ batch_year: parseInt(e.target.value) })} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}>
            <option value="">Select year</option>
            {BATCH_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Admission Year *</label>
          <select className="form-input input-glow-focus" value={data.admission_year || ""} onChange={e => onChange({ admission_year: parseInt(e.target.value) })} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}>
            <option value="">Select year</option>
            {ADMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
