"use client";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
interface Props { data: any; onChange: (d: any) => void; }

const STATUSES = ["Employed","Higher Studies","Entrepreneur","Government Services","Preparing for Exams"];
const INDUSTRIES = ["Information Technology","Finance & Banking","Healthcare","Education","Manufacturing","Consulting","E-Commerce","Media & Entertainment","Real Estate","Other"];
const EMP_TYPES = ["Full-time","Part-time","Contract","Freelance","Remote"];
const CTC_RANGES = ["< ₹3 LPA","₹3–6 LPA","₹6–10 LPA","₹10–15 LPA","₹15–25 LPA","₹25–50 LPA","₹50 LPA+","Prefer not to say"];
const YEARS = Array.from({ length: 51 }, (_, i) => 1980 + i);

export default function Step4({ data, onChange }: Props) {
  const [tagInput, setTagInput] = useState("");
  const status = data.employment_status;
  const history: any[] = data.career_history || [];

  const addSkill = (val: string) => {
    const skill = val.trim();
    if (!skill) return;
    const skills = [...(data.skills || [])];
    if (!skills.includes(skill)) onChange({ skills: [...skills, skill] });
    setTagInput("");
  };

  const removeSkill = (s: string) => onChange({ skills: (data.skills || []).filter((x: string) => x !== s) });

  const addHistory = () => onChange({ career_history: [...history, { company_name: "", designation: "", from_year: "", to_year: "" }] });
  const updateHistory = (i: number, field: string, val: any) => {
    const updated = history.map((h, idx) => idx === i ? { ...h, [field]: val } : h);
    onChange({ career_history: updated });
  };
  const removeHistory = (i: number) => onChange({ career_history: history.filter((_, idx) => idx !== i) });

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "1.3rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>Employment & Career</h2>
      <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: "2rem" }}>Your current and past career details</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Current Employment Status *</label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {STATUSES.map(s => (
              <button key={s} type="button" onClick={() => onChange({ employment_status: s })} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: `2px solid ${status === s ? "#8B1A1A" : "#e0d8d0"}`, background: status === s ? "rgba(139,26,26,0.08)" : "white", color: status === s ? "#8B1A1A" : "#4b5563", fontWeight: status === s ? 700 : 500, cursor: "pointer", fontSize: "0.88rem", transition: "all 0.2s" }}>{s}</button>
            ))}
          </div>
        </div>

        {status === "Employed" && (<>
          <div><label className="form-label">Current Company *</label><input className="form-input" value={data.current_company || ""} onChange={e => onChange({ current_company: e.target.value })} placeholder="Company name" /></div>
          <div><label className="form-label">Designation *</label><input className="form-input" value={data.designation || ""} onChange={e => onChange({ designation: e.target.value })} placeholder="e.g. Software Engineer" /></div>
          <div>
            <label className="form-label">Industry Sector</label>
            <select className="form-input" value={data.industry_sector || ""} onChange={e => onChange({ industry_sector: e.target.value })}>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Employment Type</label>
            <select className="form-input" value={data.employment_type || ""} onChange={e => onChange({ employment_type: e.target.value })}>
              <option value="">Select type</option>
              {EMP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="form-label">Work City</label><input className="form-input" value={data.work_city || ""} onChange={e => onChange({ work_city: e.target.value })} placeholder="City" /></div>
          <div><label className="form-label">Work Country</label><input className="form-input" value={data.work_country || ""} onChange={e => onChange({ work_country: e.target.value })} placeholder="Country" /></div>
          <div>
            <label className="form-label">Annual CTC Range (optional)</label>
            <select className="form-input" value={data.ctc_range || ""} onChange={e => onChange({ ctc_range: e.target.value })}>
              <option value="">Prefer not to say</option>
              {CTC_RANGES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div><label className="form-label">Years of Experience</label><input type="number" className="form-input" value={data.years_of_experience || ""} onChange={e => onChange({ years_of_experience: parseInt(e.target.value) })} min={0} max={60} /></div>
        </>)}

        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Skills / Technologies</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem", border: "2px solid #e0d8d0", borderRadius: 8, minHeight: 50, background: "white", cursor: "text" }} onClick={() => {}}>
            {(data.skills || []).map((s: string) => (
              <span key={s} className="tag">{s}<button onClick={() => removeSkill(s)}><X size={12} /></button></span>
            ))}
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(tagInput); } }} onBlur={() => addSkill(tagInput)} placeholder="Type skill and press Enter" style={{ border: "none", outline: "none", fontSize: "0.88rem", minWidth: 150 }} />
          </div>
          <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 4 }}>Press Enter or comma to add a skill</p>
        </div>

        {/* Previous Companies */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ margin: 0 }}>Previous Companies</label>
            <button type="button" onClick={addHistory} className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}><Plus size={14} /> Add Company</button>
          </div>
          {history.map((h, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: "0.75rem", alignItems: "end", padding: "1rem", background: "#f8f5f0", borderRadius: 8, marginBottom: "0.75rem" }}>
              <div><label className="form-label" style={{ fontSize: "0.78rem" }}>Company</label><input className="form-input" value={h.company_name || ""} onChange={e => updateHistory(i, "company_name", e.target.value)} placeholder="Company name" /></div>
              <div><label className="form-label" style={{ fontSize: "0.78rem" }}>Designation</label><input className="form-input" value={h.designation || ""} onChange={e => updateHistory(i, "designation", e.target.value)} placeholder="Role" /></div>
              <div><label className="form-label" style={{ fontSize: "0.78rem" }}>From</label><select className="form-input" value={h.from_year || ""} onChange={e => updateHistory(i, "from_year", parseInt(e.target.value))}><option value="">Year</option>{YEARS.slice().reverse().map(y => <option key={y}>{y}</option>)}</select></div>
              <div><label className="form-label" style={{ fontSize: "0.78rem" }}>To</label><select className="form-input" value={h.to_year || ""} onChange={e => updateHistory(i, "to_year", parseInt(e.target.value))}><option value="">Year</option>{YEARS.slice().reverse().map(y => <option key={y}>{y}</option>)}</select></div>
              <button type="button" onClick={() => removeHistory(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
