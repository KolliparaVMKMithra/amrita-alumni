"use client";
import { useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Props { data: any; onChange: (d: any) => void; }

export default function Step1({ data, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/api/upload/photo", form, { headers: { "Content-Type": "multipart/form-data" } });
      onChange({ photo_url: res.data.url });
      toast.success("Photo uploaded!");
    } catch { toast.error("Upload failed. Try again."); }
    finally { setUploading(false); }
  };

  const years = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "1.3rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>Basic Personal Information</h2>
      <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: "2rem" }}>Tell us about yourself</p>

      {/* Photo Upload */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ position: "relative", width: 100, height: 100, borderRadius: "50%", background: "#f0ece6", border: "3px solid #e0d8d0", overflow: "hidden", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
          {data.photo_url ? <img src={data.photo_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
            <Camera size={24} color="#9ca3af" /><span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Upload</span>
          </div>}
          {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>}
        </div>
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }} disabled={uploading}>
            <Upload size={15} /> {uploading ? "Uploading..." : "Upload Photo"}
          </button>
          <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "0.4rem" }}>JPG, PNG, WebP — max 5MB</p>
          {data.photo_url && <button type="button" onClick={() => onChange({ photo_url: "" })} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}><X size={12} /> Remove</button>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={data.full_name || ""} onChange={e => onChange({ full_name: e.target.value })} placeholder="Your full name" />
        </div>
        <div>
          <label className="form-label">Gender *</label>
          <select className="form-input" value={data.gender || ""} onChange={e => onChange({ gender: e.target.value })}>
            <option value="">Select gender</option>
            <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="form-label">Date of Birth *</label>
          <input type="date" className="form-input" value={data.date_of_birth || ""} onChange={e => onChange({ date_of_birth: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Student ID / Roll Number *</label>
          <input className="form-input" value={data.student_id || ""} onChange={e => onChange({ student_id: e.target.value })} placeholder="e.g. AM.EN.U4CSE21001" />
        </div>
        <div>
          <label className="form-label">Nationality *</label>
          <input className="form-input" value={data.nationality || ""} onChange={e => onChange({ nationality: e.target.value })} placeholder="e.g. Indian" />
        </div>
      </div>
    </div>
  );
}
