import { api } from "@/lib/axios";

export async function apiLogin({ email, password }) {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function apiLogout() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function apiGetMe() {
  const { data } = await api.get("/auth/get-me");
  return data;
}