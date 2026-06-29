"use client";
interface Props { data: any; onChange: (d: any) => void; }

const TOGGLES = [
  { key: "mentoring", label: "Interested in Mentoring Students?", icon: "🎓" },
  { key: "guest_lectures", label: "Interested in Guest Lectures?", icon: "🎤" },
  { key: "recruitment_support", label: "Interested in Recruitment Support?", icon: "💼" },
  { key: "internship_support", label: "Interested in Internship Support?", icon: "🏢" },
  { key: "donations_csr", label: "Interested in Donations / CSR?", icon: "❤️" },
  { key: "alumni_chapters", label: "Willing to Participate in Alumni Chapters?", icon: "🤝" },
  { key: "available_for_events", label: "Available for Campus Events?", icon: "📅" },
];

function Toggle({ label, icon, value, onChange }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#f8f5f0", borderRadius: 10, border: `1px solid ${value ? "rgba(139,26,26,0.2)" : "#e0d8d0"}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.3rem" }}>{icon}</span>
        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#1a1a2e" }}>{label}</span>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function Step7({ data, onChange }: Props) {
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "1.3rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>Alumni Engagement</h2>
      <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: "2rem" }}>How would you like to contribute to Amrita?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {TOGGLES.map(t => (
          <Toggle key={t.key} label={t.label} icon={t.icon} value={data[t.key]} onChange={(v: boolean) => onChange({ [t.key]: v })} />
        ))}
      </div>
      <div>
        <label className="form-label">Preferred Communication Mode</label>
        <select className="form-input" style={{ maxWidth: 300 }} value={data.preferred_communication || ""} onChange={e => onChange({ preferred_communication: e.target.value })}>
          <option value="">Select mode</option>
          {["Email","Phone","WhatsApp","LinkedIn"].map(m => <option key={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
}
