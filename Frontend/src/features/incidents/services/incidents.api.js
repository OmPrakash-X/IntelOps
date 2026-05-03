import API from "../../../services/api";

export const getIncidents = async () => {
  const res = await API.get("/incidents");
  return res.data;
};

export const createIncident = async (data) => {
  const res = await API.post("/incidents", data);
  return res.data;
};

export const getProjects = async () => {
  const res = await API.get("/projects");
  return res.data;
};

export const getGroups = async () => {
  const res = await API.get("/groups");
  return res.data;
};

export const addGroupMembers = async (groupId, members) => {
  const res = await API.patch(`/groups/${groupId}/members`, { members });
  return res.data;
};

export const assignResponders = async (incidentId, responders) => {
  const res = await API.patch(`/incidents/${incidentId}/responders`, { responders });
  return res.data;
};

export const updateIncidentStatus = async (incidentId, status) => {
  const res = await API.patch(`/incidents/${incidentId}/status`, { status });
  return res.data;
};

export const addTimelineUpdate = async (incidentId, data) => {
  const res = await API.post(`/timelines/${incidentId}/timeline`, data);
  return res.data;
};

export const getNotifications = async () => {
  const res = await API.get("/notifications");
  return res.data;
};

export const getUsers = async () => {
  const res = await API.get("/users");
  return res.data;
};
