import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  withCredentials: true,
});