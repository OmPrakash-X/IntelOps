import { api } from "@/lib/axios";

export const fetchGroups = async () => {
  const res = await api.get("/groups");
  return res.data;
};

export const createGroup = async (data) => {
  const res = await api.post("/groups", data);
  return res.data;
};

export const addMembers = async (groupId, members) => {
  const res = await api.patch(`/groups/${groupId}/members`, { members });
  return res.data;
};

export const assignLead = async (groupId, teamLeadId) => {
  const res = await api.patch(`/groups/${groupId}/assign-lead`, { teamLeadId });
  return res.data;
};
