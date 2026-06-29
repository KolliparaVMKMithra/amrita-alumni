"use client";
interface Props { data: any; onChange: (d: any) => void; }

export default function Step6({ data, onChange }: Props) {
  const na = data.not_applicable;
  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", color: "#1a1a2e", marginBottom: "0.25rem" }}>Entrepreneurship</h2>
          <p style={{ color: "#6b7280", fontSize: "0.88rem" }}>Are you a founder or co-founder?</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "#4b5563", fontWeight: 600 }}>
          <input type="checkbox" checked={!!na} onChange={e => onChange({ not_applicable: e.target.checked })} style={{ accentColor: "#8B1A1A", width: 16, height: 16 }} />
          Not Applicable
        </label>
      </div>
      {!na && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div><label className="form-label">Startup Name *</label><input className="form-input" value={data.startup_name || ""} onChange={e => onChange({ startup_name: e.target.value })} placeholder="Your startup name" /></div>
          <div><label className="form-label">Domain / Industry *</label><input className="form-input" value={data.domain || ""} onChange={e => onChange({ domain: e.target.value })} placeholder="e.g. EdTech, FinTech" /></div>
          <div><label className="form-label">Website URL</label><input className="form-input" value={data.website || ""} onChange={e => onChange({ website: e.target.value })} placeholder="https://yourstartup.com" /></div>
          <div>
            <label className="form-label">Funding Status</label>
            <select className="form-input" value={data.funding_status || ""} onChange={e => onChange({ funding_status: e.target.value })}>
              <option value="">Select</option>
              {["Bootstrapped","Angel Funded","Seed Stage","Series A+","Not Applicable"].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div><label className="form-label">Team Size</label><input type="number" className="form-input" value={data.team_size || ""} onChange={e => onChange({ team_size: parseInt(e.target.value) })} min={1} placeholder="Number of team members" /></div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Incubation Details</label>
            <textarea className="form-input" rows={3} value={data.incubation_details || ""} onChange={e => onChange({ incubation_details: e.target.value })} placeholder="Incubation center, accelerator program, etc." style={{ resize: "vertical" }} />
          </div>
        </div>
      )}
      {na && <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>Entrepreneurship section marked as not applicable.</div>}
    </div>
  );
}
