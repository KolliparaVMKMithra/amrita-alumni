"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface Props { data: any; onChange: (d: any) => void; }

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
];

export default function Step2({ data, onChange }: Props) {
  const { user } = useAuth();
  
  // Local states for parsed phone structures
  const [mobileCode, setMobileCode] = useState("+91");
  const [mobileNum, setMobileNum] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("+91");
  const [whatsappNum, setWhatsappNum] = useState("");

  // Focus states for unified container outlines
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  const [isWhatsappFocused, setIsWhatsappFocused] = useState(false);

  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "Singapore", "UAE", "Other"];

  // Helper to split a combined phone string (e.g. "+91 9876543210")
  const parsePhoneStr = (phoneStr: string) => {
    if (!phoneStr) return { code: "+91", num: "" };
    
    // Check if starts with code
    const trimStr = phoneStr.trim();
    const match = COUNTRY_CODES.find(c => trimStr.startsWith(c.code));
    if (match) {
      const numOnly = trimStr.slice(match.code.length).trim().replace(/\D/g, "");
      return { code: match.code, num: numOnly };
    }
    
    // Fallback if not matching lists
    if (trimStr.startsWith("+")) {
      const spaceIdx = trimStr.indexOf(" ");
      if (spaceIdx > 0) {
        return { code: trimStr.slice(0, spaceIdx), num: trimStr.slice(spaceIdx).trim().replace(/\D/g, "") };
      }
    }
    return { code: "+91", num: trimStr.replace(/\D/g, "") };
  };

  // Sync state on load (Only when prop value differs from internal state to avoid cursor jumping)
  useEffect(() => {
    const currentCombinedMobile = `${mobileCode} ${mobileNum}`.trim();
    if (data.mobile && data.mobile.trim() !== currentCombinedMobile) {
      const parsed = parsePhoneStr(data.mobile);
      setMobileCode(parsed.code);
      setMobileNum(parsed.num);
    }
  }, [data.mobile]);

  useEffect(() => {
    const currentCombinedWhatsapp = `${whatsappCode} ${whatsappNum}`.trim();
    if (data.whatsapp && data.whatsapp.trim() !== currentCombinedWhatsapp) {
      const parsed = parsePhoneStr(data.whatsapp);
      setWhatsappCode(parsed.code);
      setWhatsappNum(parsed.num);
    }
  }, [data.whatsapp]);

  const handleMobileCodeChange = (code: string) => {
    setMobileCode(code);
    onChange({ mobile: `${code} ${mobileNum}` });
  };

  const handleMobileNumChange = (num: string) => {
    const cleanNum = num.replace(/\D/g, "");
    setMobileNum(cleanNum);
    onChange({ mobile: `${mobileCode} ${cleanNum}` });
  };

  const handleWhatsappCodeChange = (code: string) => {
    setWhatsappCode(code);
    onChange({ whatsapp: `${code} ${whatsappNum}` });
  };

  const handleWhatsappNumChange = (num: string) => {
    const cleanNum = num.replace(/\D/g, "");
    setWhatsappNum(cleanNum);
    onChange({ whatsapp: `${whatsappCode} ${cleanNum}` });
  };

  const sameAsMobile = () => {
    setWhatsappCode(mobileCode);
    setWhatsappNum(mobileNum);
    onChange({ whatsapp: `${mobileCode} ${mobileNum}` });
  };

  const sameAsCurrent = () => onChange({
    permanent_address: data.current_address,
    city: data.city,
    state: data.state,
    country: data.country,
    pin_code: data.pin_code
  });

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "0.5rem", fontFamily: "Montserrat", fontWeight: 800 }}>Contact Information</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "2rem" }}>How can we reach you?</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        
        {/* Mobile Input with Premium Unified Select */}
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Mobile Number *</label>
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            border: isMobileFocused ? "2px solid #8B1A1A" : "2px solid #e0d8d0", 
            borderRadius: "10px", 
            background: "var(--card-bg)",
            padding: "0 0.85rem",
            boxShadow: isMobileFocused ? "0 0 0 4px rgba(139,26,26,0.15)" : "none",
            transition: "all 0.2s ease"
          }}>
            <select 
              value={mobileCode} 
              onChange={e => handleMobileCodeChange(e.target.value)}
              onFocus={() => setIsMobileFocused(true)}
              onBlur={() => setIsMobileFocused(false)}
              style={{ 
                border: "none", 
                background: "transparent", 
                color: "var(--text-primary)",
                padding: "0.8rem 0.3rem 0.8rem 0",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
                width: "72px"
              }}
            >
              {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}>{c.flag} {c.code}</option>)}
            </select>
            <div style={{ width: "1px", height: "22px", background: "rgba(139,26,26,0.2)", margin: "0 0.65rem" }} />
            <input 
              value={mobileNum} 
              onChange={e => handleMobileNumChange(e.target.value)} 
              onFocus={() => setIsMobileFocused(true)}
              onBlur={() => setIsMobileFocused(false)}
              placeholder="9876543210 (10 digits)"
              maxLength={10}
              style={{ 
                flex: 1, 
                border: "none", 
                background: "transparent", 
                color: "var(--text-primary)",
                padding: "0.8rem 0",
                fontSize: "0.95rem",
                fontWeight: 500,
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* WhatsApp Input with Premium Unified Select */}
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>WhatsApp Number</label>
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            border: isWhatsappFocused ? "2px solid #8B1A1A" : "2px solid #e0d8d0", 
            borderRadius: "10px", 
            background: "var(--card-bg)",
            padding: "0 0.85rem",
            boxShadow: isWhatsappFocused ? "0 0 0 4px rgba(139,26,26,0.15)" : "none",
            transition: "all 0.2s ease"
          }}>
            <select 
              value={whatsappCode} 
              onChange={e => handleWhatsappCodeChange(e.target.value)}
              onFocus={() => setIsWhatsappFocused(true)}
              onBlur={() => setIsWhatsappFocused(false)}
              style={{ 
                border: "none", 
                background: "transparent", 
                color: "var(--text-primary)",
                padding: "0.8rem 0.3rem 0.8rem 0",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
                width: "72px"
              }}
            >
              {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}>{c.flag} {c.code}</option>)}
            </select>
            <div style={{ width: "1px", height: "22px", background: "rgba(139,26,26,0.2)", margin: "0 0.65rem" }} />
            <input 
              value={whatsappNum} 
              onChange={e => handleWhatsappNumChange(e.target.value)} 
              onFocus={() => setIsWhatsappFocused(true)}
              onBlur={() => setIsWhatsappFocused(false)}
              placeholder="9876543210 (10 digits)"
              maxLength={10}
              style={{ 
                flex: 1, 
                border: "none", 
                background: "transparent", 
                color: "var(--text-primary)",
                padding: "0.8rem 0",
                fontSize: "0.95rem",
                fontWeight: 500,
                outline: "none"
              }}
            />
          </div>
          <button type="button" onClick={sameAsMobile} style={{ background: "none", border: "none", color: "#8B1A1A", fontSize: "0.78rem", cursor: "pointer", marginTop: 4, fontWeight: 700, fontFamily: "Montserrat" }}>✓ Same as mobile</button>
        </div>

        {/* Personal Registered Email - Locked and Pre-populated */}
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Personal Email (Registered)</label>
          <input 
            className="form-input" 
            value={user?.email || data.email || ""} 
            readOnly 
            style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "rgba(139,26,26,0.03)", color: "var(--text-secondary)", cursor: "not-allowed" }} 
          />
        </div>

        {/* Alternate Email */}
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Alternate Email *</label>
          <input 
            type="email" 
            className="form-input input-glow-focus" 
            value={data.alternate_email || ""} 
            onChange={e => onChange({ alternate_email: e.target.value })} 
            placeholder="alternate@email.com" 
            style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}
          />
        </div>

        {/* LinkedIn Profile */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label" style={{ fontWeight: 700 }}>LinkedIn Profile URL</label>
          <input 
            className="form-input input-glow-focus" 
            value={data.linkedin_url || ""} 
            onChange={e => onChange({ linkedin_url: e.target.value })} 
            placeholder="https://linkedin.com/in/yourprofile" 
            style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Current Address */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Current Address *</label>
          <textarea 
            className="form-input input-glow-focus" 
            rows={3} 
            value={data.current_address || ""} 
            onChange={e => onChange({ current_address: e.target.value })} 
            placeholder="Door no, Street, Area" 
            style={{ resize: "vertical", borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} 
          />
        </div>

        {/* Permanent Address */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Permanent Address</label>
            <button type="button" onClick={sameAsCurrent} style={{ background: "none", border: "none", color: "#8B1A1A", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700, fontFamily: "Montserrat" }}>✓ Same as current</button>
          </div>
          <textarea 
            className="form-input input-glow-focus" 
            rows={3} 
            value={data.permanent_address || ""} 
            onChange={e => onChange({ permanent_address: e.target.value })} 
            placeholder="Permanent address" 
            style={{ resize: "vertical", borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} 
          />
        </div>

        {/* City & State */}
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>City *</label>
          <input className="form-input input-glow-focus" value={data.city || ""} onChange={e => onChange({ city: e.target.value })} placeholder="City" style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>State *</label>
          <input className="form-input input-glow-focus" value={data.state || ""} onChange={e => onChange({ state: e.target.value })} placeholder="State" style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} />
        </div>

        {/* Country & PIN */}
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Country *</label>
          <select className="form-input input-glow-focus" value={data.country || ""} onChange={e => onChange({ country: e.target.value })} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }}>
            <option value="">Select country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>PIN Code *</label>
          <input className="form-input input-glow-focus" value={data.pin_code || ""} onChange={e => onChange({ pin_code: e.target.value })} placeholder="600001" maxLength={10} style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0", background: "var(--card-bg)", color: "var(--text-primary)" }} />
        </div>

      </div>
    </div>
  );
}
