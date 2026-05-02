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
import Notification from "../models/notification.model.js";
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
    
    // Real-time emit 
    const io = getIO();
    notifications.forEach((notif) => {
      io.to(notif.recipient.toString()).emit("notification", notif);
    });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};
```

### 1.5 Notification Triggers
| Event | Recipients |
| :--- | :--- |
| Incident created | Admin |
| Team Lead assigned | Assigned Team Lead |
| Responders assigned | Selected responders |
| Timeline update | Lead + Responders (excluding actor) |
| Status update | Admin + Lead + Responders |

### 1.6 API Endpoints
- `GET /api/notifications` - Fetch notifications for logged-in user.
- `PATCH /api/notifications/:id/read` - Mark notification as read.

### 1.7 Best Practices
- Always create notifications after successful DB operations.
- Remove duplicate recipients.
- Exclude the actor from notifications.
- Validate recipient IDs before insertion.

---

## 2. Socket.io (Real-Time System)

### 2.1 Purpose
Socket.io enables real-time communication between backend and frontend.

### 2.2 Key Principles
- Socket is a delivery layer only.
- Database remains the source of truth.
- Events are emitted to specific users using rooms.

### 2.3 Backend Setup 
**File:** `socket/index.js`
```js
import { Server } from "socket.io";

let io; 

export const initSocket = (server) => { 
  io = new Server(server, { 
    cors: { 
      origin: "*", 
      methods: ["GET", "POST"] 
    }
  }); 

  io.on("connection", (socket) => {
    // User joins personal room 
    socket.on("join", (userId) => { 
      socket.join(userId); 
    }); 
    
    socket.on("disconnect", () => { 
      console.log("User disconnected:", socket.id); 
    });
  });
}; 

export const getIO = () => { 
  if (!io) {
    throw new Error("Socket not initialized"); 
  }
  return io; 
}; 
```