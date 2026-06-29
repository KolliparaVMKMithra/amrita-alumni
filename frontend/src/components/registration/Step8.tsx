"use client";
import { useState } from "react";
import { X } from "lucide-react";
interface Props { data: any; onChange: (d: any) => void; }

export default function Step8({ data, onChange }: Props) {
  const [tagInput, setTagInput] = useState("");

  const addArea = (val: string) => {
    const a = val.trim();
    if (!a) return;
    const areas = [...(data.recruitment_areas || [])];
    if (!areas.includes(a)) onChange({ recruitment_areas: [...areas, a] });
    setTagInput("");
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "1.3rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>Placement &amp; Networking</h2>
      <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: "2rem" }}>Help students and fellow alumni with opportunities</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#f8f5f0", borderRadius: 10, border: `1px solid ${data.can_refer ? "rgba(139,26,26,0.2)" : "#e0d8d0"}` }}>
          <div>
            <p style={{ fontWeight: 600, color: "#1a1a2e" }}>Can you refer students / junior alumni?</p>
            <p style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 2 }}>Help connect deserving candidates to your network</p>
          </div>
          <label className="toggle"><input type="checkbox" checked={!!data.can_refer} onChange={e => onChange({ can_refer: e.target.checked })} /><span className="toggle-slider" /></label>
        </div>

        {data.can_refer && (
          <div>
            <label className="form-label">How many people can you hire this year?</label>
            <input type="number" className="form-input" style={{ maxWidth: 200 }} value={data.hiring_capacity || ""} onChange={e => onChange({ hiring_capacity: parseInt(e.target.value) })} min={0} placeholder="e.g. 5" />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#f8f5f0", borderRadius: 10, border: `1px solid ${data.internship_opportunities ? "rgba(139,26,26,0.2)" : "#e0d8d0"}` }}>
          <div>
            <p style={{ fontWeight: 600, color: "#1a1a2e" }}>Internship Opportunities Available?</p>
            <p style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 2 }}>Open internship positions at your company</p>
          </div>
          <label className="toggle"><input type="checkbox" checked={!!data.internship_opportunities} onChange={e => onChange({ internship_opportunities: e.target.checked })} /><span className="toggle-slider" /></label>
        </div>

        <div>
          <label className="form-label">Industry Contacts (optional)</label>
          <textarea className="form-input" rows={3} value={data.industry_contacts || ""} onChange={e => onChange({ industry_contacts: e.target.value })} placeholder="Mention key contacts or networks you have" style={{ resize: "vertical" }} />
        </div>

        <div>
          <label className="form-label">Recruitment Areas / Domains</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem", border: "2px solid #e0d8d0", borderRadius: 8, minHeight: 50, background: "white" }}>
            {(data.recruitment_areas || []).map((a: string) => (
              <span key={a} className="tag">{a}<button onClick={() => onChange({ recruitment_areas: (data.recruitment_areas || []).filter((x: string) => x !== a) })}><X size={12} /></button></span>
            ))}
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addArea(tagInput); } }} onBlur={() => addArea(tagInput)} placeholder="e.g. Software, Finance" style={{ border: "none", outline: "none", fontSize: "0.88rem", minWidth: 150 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
