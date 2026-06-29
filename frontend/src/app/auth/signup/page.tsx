"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Must have uppercase letter")
    .regex(/[0-9]/, "Must have a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must have a special character"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match", path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

function getStrength(pw: string): { label: string; cls: string; score: number } {
  if (!pw) return { label: "", cls: "", score: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", cls: "strength-weak", score };
  if (score <= 2) return { label: "Medium", cls: "strength-medium", score };
  return { label: "Strong", cls: "strength-strong", score };
}

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const pw = watch("password", "");
  const strength = getStrength(pw);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/signup", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      });
      localStorage.setItem("token", res.data.access_token);
      await refreshProfile();
      toast.success("Account created successfully! 🎉");
      router.push("/register");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fb 0%, #FAF9F6 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }} className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
            <img src="/amrita_logo.png" alt="Amrita Logo" style={{ height: "54px", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: "1.6rem", color: "#1a1a2e", fontFamily: "Montserrat", fontWeight: 800 }}>Create Your Account</h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.25rem", fontWeight: 500 }}>Join the Amrita Alumni Network</p>
        </div>

        <div className="card glow-shadow-maroon animate-fade-in" style={{ padding: "2.5rem", borderRadius: "16px", border: "1px solid rgba(139,26,26,0.05)", background: "white" }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Full Name</label>
              <input {...register("full_name")} className={`form-input input-glow-focus ${errors.full_name ? "error" : ""}`} placeholder="Your full name" style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0" }} />
              {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Email Address</label>
              <input {...register("email")} type="email" className={`form-input input-glow-focus ${errors.email ? "error" : ""}`} placeholder="you@example.com" style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0" }} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input {...register("password")} type={showPw ? "text" : "password"} className={`form-input input-glow-focus ${errors.password ? "error" : ""}`} placeholder="Create a strong password" style={{ paddingRight: "2.75rem", borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0" }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {pw && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ height: 4, background: "#e0d8d0", borderRadius: 2, marginBottom: "0.25rem" }}>
                    <div className={`strength-bar ${strength.cls}`} />
                  </div>
                  <p style={{ fontSize: "0.78rem", color: strength.score <= 1 ? "#ef4444" : strength.score <= 2 ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input {...register("confirm_password")} type={showCPw ? "text" : "password"} className={`form-input input-glow-focus ${errors.confirm_password ? "error" : ""}`} placeholder="Repeat your password" style={{ paddingRight: "2.75rem", borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0" }} />
                <button type="button" onClick={() => setShowCPw(!showCPw)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showCPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm_password && <p className="form-error">{errors.confirm_password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary glow-shadow-maroon" style={{ width: "100%", justifyContent: "center", padding: "0.95rem", fontSize: "0.95rem", marginTop: "0.5rem", borderRadius: "10px" }}>
              {loading ? <><span className="spinner" />Creating Account...</> : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#4b5563", fontSize: "0.9rem", fontWeight: 500 }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#8B1A1A", fontWeight: 800, textDecoration: "none" }}>Login</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.78rem", marginTop: "1.5rem", fontWeight: 500 }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

