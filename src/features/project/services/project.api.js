import API from "../../../services/api";

export const fetchProjects = async () => {
  const res = await API.get("/projects");
  return res.data;
};

export const createProject = async (data) => {
  const res = await API.post("/projects", data);
  return res.data;
};