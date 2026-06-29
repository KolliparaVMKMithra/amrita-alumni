"use client";
import { useState, useRef } from "react";
import { Upload, FileText, X, ChevronDown, ChevronUp, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Props { data: any; onChange: (d: any) => void; onJumpTo: (s: number) => void; onSubmit: () => void; saving: boolean; }

const STEP_LABELS = ["Personal Info","Contact","Academic","Career","Higher Education","Entrepreneurship","Engagement","Networking"];

export default function Step9({ data, onChange, onJumpTo, onSubmit, saving }: Props) {
  const [docUploading, setDocUploading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([]);
  const docRef = useRef<HTMLInputElement>(null);

  const toggleExpand = (i: number) => setExpanded(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const uploadFile = async (file: File, endpoint: string, maxMb: number, field: string, setLoading: any) => {
    if (file.size > maxMb * 1024 * 1024) { toast.error(`File must be under ${maxMb}MB`); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post(`/api/upload/${endpoint}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      onChange({ [field]: res.data.url });
      toast.success("File uploaded!");
    } catch { toast.error("Upload failed."); }
    finally { setLoading(false); }
  };

  const summaryData: [string, any][] = [
    ["Personal", { Name: data.full_name, Gender: data.gender, "Date of Birth": data.date_of_birth, Nationality: data.nationality, "Student ID": data.student_id }],
    ["Contact", { Mobile: data.mobile, WhatsApp: data.whatsapp, City: data.city, Country: data.country }],
    ["Academic", { University: data.university_name, Department: data.department, Degree: data.degree, Batch: data.batch_year }],
    ["Career", { Status: data.employment_status, Company: data.current_company, Role: data.designation, Industry: data.industry_sector }],
    ["Higher Education", { University: data.higher_edu_university, Degree: data.higher_edu_degree }],
    ["Entrepreneurship", data.not_applicable ? { Status: "Not Applicable" } : { Startup: data.startup_name, Domain: data.domain }],
    ["Engagement", { Mentoring: data.mentoring ? "Yes" : "No", "Guest Lectures": data.guest_lectures ? "Yes" : "No" }],
    ["Networking", { "Can Refer": data.can_refer ? "Yes" : "No", "Internship": data.internship_opportunities ? "Yes" : "No" }],
  ];

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "1.3rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>Social Profiles, Documents & Review</h2>
      <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: "2rem" }}>Final step — add your links, upload documents, and review</p>

      {/* Social Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">LinkedIn URL</label>
          <input className="form-input" value={data.linkedin || data.linkedin_url || ""} onChange={e => onChange({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" />
        </div>
        <div>
          <label className="form-label">GitHub Profile URL</label>
          <input className="form-input" value={data.github || ""} onChange={e => onChange({ github: e.target.value })} placeholder="https://github.com/username" />
        </div>
        <div>
          <label className="form-label">Portfolio Website</label>
          <input className="form-input" value={data.portfolio || ""} onChange={e => onChange({ portfolio: e.target.value })} placeholder="https://yourportfolio.com" />
        </div>
      </div>


      {/* Other Doc */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="form-label">Other Document (optional, max 5MB)</label>
        {data.other_doc_url ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8 }}>
            <FileText size={20} color="#16a34a" />
            <a href={data.other_doc_url} target="_blank" rel="noreferrer" style={{ color: "#16a34a", fontWeight: 600, flex: 1, fontSize: "0.88rem" }}>Document uploaded ✓</a>
            <button onClick={() => onChange({ other_doc_url: "" })} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><X size={16} /></button>
          </div>
        ) : (
          <div className="drop-zone" onClick={() => docRef.current?.click()}>
            <Upload size={20} color="#9ca3af" style={{ margin: "0 auto 0.4rem", display: "block" }} />
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Click to upload (optional)</p>
            {docUploading && <span className="spinner spinner-dark" />}
          </div>
        )}
        <input ref={docRef} type="file" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "document", 5, "other_doc_url", setDocUploading)} />
      </div>

      {/* Review Summary */}
      <div style={{ background: "#f8f5f0", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid #e0d8d0" }}>
        <h3 style={{ fontSize: "1rem", color: "#1a1a2e", marginBottom: "1rem", fontFamily: "Montserrat" }}>Review Summary</h3>
        {summaryData.map(([label, fields], i) => (
          <div key={label} style={{ borderBottom: i < summaryData.length - 1 ? "1px solid #e0d8d0" : "none", marginBottom: "0.5rem" }}>
            <button type="button" onClick={() => toggleExpand(i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", background: "none", border: "none", cursor: "pointer" }}>
              <span style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.85rem", color: "#1a1a2e" }}>{label}</span>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span onClick={e => { e.stopPropagation(); onJumpTo(i + 1); }} style={{ background: "none", border: "none", color: "#8B1A1A", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}><Edit size={12} /> Edit</span>
                {expanded.includes(i) ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
              </div>
            </button>
            {expanded.includes(i) && (
              <div style={{ paddingBottom: "0.75rem" }}>
                {Object.entries(fields as any).map(([k, v]) => v ? (
                  <div key={k} style={{ display: "flex", gap: "1rem", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
                    <span style={{ color: "#9ca3af", minWidth: 140 }}>{k}</span>
                    <span style={{ color: "#1a1a2e", fontWeight: 500 }}>{String(v)}</span>
                  </div>
                ) : null)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation */}
      <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", marginBottom: "1.5rem" }}>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: "#8B1A1A", width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
        <span style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6 }}>
          I confirm that all information provided is accurate and up to date. I agree to the Alumni Portal's terms and conditions.
        </span>
      </label>

      <button onClick={() => setConfirmOpen(true)} disabled={!agreed || saving} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "1rem" }}>
        {saving ? <><span className="spinner" /> Submitting...</> : "Submit Registration 🎉"}
      </button>

      {/* Confirm Dialog */}
      {confirmOpen && (
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 440, padding: "2rem" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", color: "#1a1a2e", marginBottom: "0.75rem" }}>Submit Registration?</h3>
            <p style={{ color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Once submitted, you will be listed in the alumni directory. You can still edit your profile later.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setConfirmOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={() => { setConfirmOpen(false); onSubmit(); }} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>Yes, Submit!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
