import { api } from "@/lib/axios";

// ─── Incidents ────────────────────────────────────────────────────────────────
export const getIncidents = async () => {
  const res = await api.get("/incidents");
  return res.data;
};

export const getIncidentById = async (id) => {
  const res = await api.get(`/incidents/${id}`);
  return res.data;
};

export const createIncident = async (data) => {
  const res = await api.post("/incidents", data);
  return res.data;
};

// ─── Status & Responders ─────────────────────────────────────────────────────
export const assignResponders = async (incidentId, responders) => {
  const res = await api.patch(`/incidents/${incidentId}/responders`, { responders });
  return res.data;
};

export const updateIncidentStatus = async (incidentId, status) => {
  const res = await api.patch(`/incidents/${incidentId}/status`, { status });
  return res.data;
};

// ─── Timeline ─────────────────────────────────────────────────────────────────
export const getTimeline = async (incidentId) => {
  const res = await api.get(`/incidents/${incidentId}/timeline`);
  return res.data;
};

export const addTimelineUpdate = async (incidentId, data) => {
  const res = await api.post(`/incidents/${incidentId}/timeline`, data);
  return res.data;
};

// ─── Postmortem ───────────────────────────────────────────────────────────────
export const updatePostmortem = async (incidentId, data) => {
  const res = await api.patch(`/incidents/${incidentId}/postmortem`, data);
  return res.data;
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const markNotificationRead = async (notificationId) => {
  const res = await api.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

// ─── Projects (used in dashboard filtering) ───────────────────────────────────
export const getProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const getGroups = async () => {
  const res = await api.get("/groups");
  return res.data;
};

export const addGroupMembers = async (groupId, members) => {
  const res = await api.patch(`/groups/${groupId}/members`, { members });
  return res.data;
};

export const assignGroupLead = async (groupId, teamLeadId) => {
  const res = await api.patch(`/groups/${groupId}/assign-lead`, { teamLeadId });
  return res.data;
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};
