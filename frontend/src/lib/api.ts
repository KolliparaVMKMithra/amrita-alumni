// Axios instance with local auth token interceptor
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);


export default api;
