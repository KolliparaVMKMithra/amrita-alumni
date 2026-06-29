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
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const email = watch("email");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("token", res.data.access_token);
      await refreshProfile();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      toast.success(res.data.message);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fb 0%, #FAF9F6 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }} className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
            <img src="/amrita_logo.png" alt="Amrita Logo" style={{ height: "54px", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: "1.6rem", color: "#1a1a2e", fontFamily: "Montserrat", fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.25rem", fontWeight: 500 }}>Sign in to your alumni account</p>
        </div>

        <div className="card glow-shadow-maroon animate-fade-in" style={{ padding: "2.5rem", borderRadius: "16px", border: "1px solid rgba(139,26,26,0.05)", background: "white" }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Email Address</label>
              <input {...register("email")} type="email" className={`form-input input-glow-focus ${errors.email ? "error" : ""}`} placeholder="you@example.com" style={{ borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0" }} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Password</label>
                <button type="button" onClick={handleForgotPassword} style={{ background: "none", border: "none", color: "#8B1A1A", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "Montserrat" }}>Forgot password?</button>
              </div>
              <div style={{ position: "relative" }}>
                <input {...register("password")} type={showPw ? "text" : "password"} className={`form-input input-glow-focus ${errors.password ? "error" : ""}`} placeholder="Your password" style={{ paddingRight: "2.75rem", borderRadius: "10px", padding: "0.8rem 1rem", border: "2px solid #e0d8d0" }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.88rem", color: "#4b5563", fontWeight: 500 }}>
              <input type="checkbox" {...register("remember")} style={{ accentColor: "#8B1A1A", width: "16px", height: "16px" }} />
              Remember me
            </label>
            <button type="submit" disabled={loading} className="btn-primary glow-shadow-maroon" style={{ width: "100%", justifyContent: "center", padding: "0.95rem", fontSize: "0.95rem", marginTop: "0.25rem", borderRadius: "10px" }}>
              {loading ? <><span className="spinner" />Signing in...</> : "Sign In →"}
            </button>
          </form>


          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#4b5563", fontSize: "0.9rem", fontWeight: 500 }}>
            New to Amrita Alumni?{" "}
            <Link href="/auth/signup" style={{ color: "#8B1A1A", fontWeight: 800, textDecoration: "none" }}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

