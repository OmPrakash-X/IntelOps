import { api } from "@/lib/axios";

export const fetchUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const createUser = async (data) => {
  const res = await api.post("/users/create", data);
  return res.data;
};
