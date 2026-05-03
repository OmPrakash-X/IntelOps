import API from "../../../services/api";

export const fetchUsers = async () => {
  const res = await API.get("/users");
  return res.data;
};

export const createUser = async (data) => {
  const res = await API.post("/users", data);
  return res.data;
};
