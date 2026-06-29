/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "./api";

interface UserProfile {
  id: string;
  firebase_uid?: string;
  full_name: string;
  email: string;
  is_email_verified: boolean;
  has_profile: boolean;
  registration_complete: boolean;
  current_step?: number;
}

interface UserSession {
  email: string;
  name: string;
}

interface AuthContextType {
  user: UserSession | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: true,
  logout: async () => {}, refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = async () => {
    try {
      const res = await api.post("/api/auth/sync-user");
      setProfile(res.data);
      setUser({ email: res.data.email, name: res.data.full_name });
      return res.data;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      setProfile(null);
    }
  };


  const refreshProfile = async () => {
    await syncProfile();
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setProfile(null);
    setUser(null);
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      syncProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

