import { io } from "socket.io-client";

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:3000";

// Singleton socket instance
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(BASE, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

/**
 * Connect and join the user's personal notification room.
 * Call this once after login (from App.jsx or authSlice).
 */
export function connectSocket(userId) {
  const s = getSocket();
  if (!s.connected) {
    const token = localStorage.getItem("token");
    s.auth = { token };
    s.connect();
  }
  if (userId) {
    s.emit("join", userId);
  }
  return s;
}

/**
 * Disconnect and clean up the socket.
 * Call this on logout.
 */
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
  socket = null;
}

export default getSocket;
