"use client";
const YEARS = Array.from({ length: 51 }, (_, i) => 1980 + i);
interface Props { data: any; onChange: (d: any) => void; }

export default function Step5({ data, onChange }: Props) {
  const na = data.higher_edu_na;
  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", color: "#1a1a2e", marginBottom: "0.25rem" }}>Higher Education</h2>
          <p style={{ color: "#6b7280", fontSize: "0.88rem" }}>Post-graduation or foreign education details</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "#4b5563", fontWeight: 600 }}>
          <input type="checkbox" checked={!!na} onChange={e => onChange({ higher_edu_na: e.target.checked })} style={{ accentColor: "#8B1A1A", width: 16, height: 16 }} />
          Not Applicable
        </label>
      </div>
      {!na && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">University Name *</label>
            <input className="form-input" value={data.higher_edu_university || ""} onChange={e => onChange({ higher_edu_university: e.target.value })} placeholder="University name" />
          </div>
          <div>
            <label className="form-label">Country *</label>
            <input className="form-input" value={data.higher_edu_country || ""} onChange={e => onChange({ higher_edu_country: e.target.value })} placeholder="Country" />
          </div>
          <div>
            <label className="form-label">Degree Pursued *</label>
            <select className="form-input" value={data.higher_edu_degree || ""} onChange={e => onChange({ higher_edu_degree: e.target.value })}>
              <option value="">Select degree</option>
              {["M.Tech","M.S","MBA","PhD","M.Sc","M.E","LLM","MD","Other"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Course / Specialization</label>
            <input className="form-input" value={data.higher_edu_specialization || ""} onChange={e => onChange({ higher_edu_specialization: e.target.value })} placeholder="e.g. Machine Learning" />
          </div>
          <div>
            <label className="form-label">Admission Year *</label>
            <select className="form-input" value={data.higher_edu_admission_year || ""} onChange={e => onChange({ higher_edu_admission_year: parseInt(e.target.value) })}>
              <option value="">Select year</option>
              {YEARS.slice().reverse().map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">
              Graduation Year
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginLeft: "1rem", fontWeight: 500, fontSize: "0.8rem", color: "#6b7280", cursor: "pointer" }}>
                <input type="checkbox" checked={!!data.is_ongoing} onChange={e => onChange({ is_ongoing: e.target.checked })} style={{ accentColor: "#8B1A1A" }} />
                Currently Pursuing
              </label>
            </label>
            {!data.is_ongoing && (
              <select className="form-input" value={data.higher_edu_graduation_year || ""} onChange={e => onChange({ higher_edu_graduation_year: parseInt(e.target.value) })}>
                <option value="">Select year</option>
                {YEARS.slice().reverse().map(y => <option key={y}>{y}</option>)}
              </select>
            )}
          </div>
        </div>
      )}
      {na && <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>Higher education information marked as not applicable.</div>}
    </div>
  );
}
