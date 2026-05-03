import API from "../../../services/api";

export const loginUser = async (credentials) => {
  const res = await API.post("/auth/login", credentials);
  return res.data;
};

export const getMe = async () => {
  const res = await API.get("/auth/get-me");
  return res.data;
};
