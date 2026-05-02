# IntelOps Backend – Notifications & Real-Time System

## Overview

This document describes the implementation of:

- Notification system (persistent, database-driven)
- Real-time updates using Socket.io
- Frontend integration for real-time communication

The system follows a layered architecture:

`Action → Database Update → Notification Created → Socket Event → Frontend Update`

---

## 1. Notification System
### 1.1 Purpose
The notification system ensures that all relevant users are informed about system events such as:
- Incident creation
- Team lead assignment
- Responder assignment
- Timeline updates
- Status changes
### 1.2 Key Principles
- Notifications are stored in the database.
- Users can retrieve notifications even when offline.
- Socket.io is used only for real-time delivery (not storage).
### 1.3 Notification Model
```json
{
  recipient: ObjectId, // user receiving notification
  message: String,
  incident: ObjectId,
  type: "incident" | "assignment" | "timeline" | "status",
  isRead: Boolean,
  createdAt: Date
}
```
### 1.4 Notification Utility
All notifications are created using a centralized utility.
**File:** `utils/notification.util.js`
```js
aimport Notification from "../models/notification.model.js";
import { getIO } from "../socket/index.js";

export const createNotification = async ({
  recipients,
  message,
  incidentId,
  type
}) => {
  try {
    const docs = recipients.map((userId) => ({
      recipient: userId,
      message,
      incident: incidentId,
      type
    }));
    
    const notifications = await Notification.insertMany(docs);
    
b// Real-time emit 
dconst io = getIO();
tnotifications.forEach((notif) => {
io.to(notif.recipient.toString()).emit("notification", notif);
defaults to the `createNotification` function.
d} catch (err) {
cconsole.error("Notification error:", err.message);
defaults to the `createNotification` function.
d};
defaults to the `createNotification` function.
d``` 
defaults to the `createNotification` function.
d### 1.5 Notification Triggers
event	Recipients\
tIncident created	Admin
tTeam Lead assigned	Assigned Team Lead
tResponders assigned	Selected responders
tTimeline update	Lead + Responders (excluding actor)
tStatus update	Admin + Lead + Responders 
defaults to the `createNotification` function.
d### 1.6 API Endpoints
get /api/notifications - Fetch notifications for logged-in user.
patch /api/notifications/:id/read - Mark notification as read.
defaults to the `createNotification` function.
d### 1.7 Best Practices
eAlways create notifications after successful DB operations.
eRemove duplicate recipients.
eExclude the actor from notifications.
eValidate recipient IDs before insertion.
defaults to the `createNotification` function.
d---
defaults to the `createNotification` function.
d## 2. Socket.io (Real-Time System)
d### 2.1 Purpose
Socket.io enables real-time communication between backend and frontend.
d### 2.2 Key Principles
deSocket is a delivery layer only.
deDatabase remains the source of truth.
deEvents are emitted to specific users using rooms.
d### 2.3 Backend Setup 
fie: socket/index.js 
inport { Server } from "socket.io";
nlet io; 
extexport const initSocket = (server) => { 
io = new Server(server, { 
cors: { 
origin: "*", 
methosds: ["GET", "POST"] }
s}); n// User joins personal room socket.on("join", (userId) => { socket.join(userId); }); socket.on("disconnect", () => { console.log("User disconnected:", socket.id); }); }; export const getIO = () => { if (!io) throw new Error("Socket not initialized") ; return io; }; 
defaults to the `initSocket` and `getIO` functions.`