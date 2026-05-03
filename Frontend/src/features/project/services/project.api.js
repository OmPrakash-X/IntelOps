import { api } from "@/lib/axios";

export const fetchProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

export const createProject = async (data) => {
  const res = await api.post("/projects", data);
  return res.data;
};

export const getProjectById = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};