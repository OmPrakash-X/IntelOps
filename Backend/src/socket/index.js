import { Server } from "socket.io";
import { config } from "../config/config.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Personal notification room — user joins with their userId
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`[Socket] User ${userId} joined personal room`);
    });

    // Incident room — users join when they open an incident detail page
    // AI results (ai:rootCause, ai:nextAction, ai:postmortem) are emitted here
    socket.on("join:incident", (incidentId) => {
      socket.join(`incident:${incidentId}`);
      console.log(`[Socket] Socket ${socket.id} joined incident room: ${incidentId}`);
    });

    socket.on("leave:incident", (incidentId) => {
      socket.leave(`incident:${incidentId}`);
      console.log(`[Socket] Socket ${socket.id} left incident room: ${incidentId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};