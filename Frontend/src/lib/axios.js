import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

// Read token from localStorage — avoids circular import with the Redux store
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
