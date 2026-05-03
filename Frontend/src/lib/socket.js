import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_API || "http://localhost:3000";

// Singleton socket instance — created once, reused everywhere
export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // connect only after auth is confirmed
});

/**
 * Join a personal notification room for the authenticated user.
 * Call this once after login / auth bootstrap.
 * @param {string} userId
 */
export function joinUserRoom(userId) {
  if (userId) socket.emit("join", userId);
}

/**
 * Join an incident-specific room to receive AI insight events.
 * @param {string} incidentId
 */
export function joinIncidentRoom(incidentId) {
  if (incidentId) socket.emit("join", `incident:${incidentId}`);
}

export function leaveIncidentRoom(incidentId) {
  if (incidentId) socket.emit("leave", `incident:${incidentId}`);
}
