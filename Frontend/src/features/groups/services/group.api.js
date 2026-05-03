import API from "../../../services/api";

export const fetchGroups = async () => {
  const res = await API.get("/groups");
  return res.data;
};

export const createGroup = async (data) => {
  const res = await API.post("/groups", data);
  return res.data;
};

export const addMembers = async (id, members) => {
  const res = await API.patch(`/groups/${id}/members`, { members });
  return res.data;
};

export const updateGroup = async (id, data) => {
  const res = await API.patch(`/groups/${id}`, data);
  return res.data;
};

export const deleteGroup = async (id) => {
  const res = await API.delete(`/groups/${id}`);
  return res.data;
};
