# IntelOps Backend - Incident Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

A production-ready, role-based incident management backend system built with Express.js and MongoDB. Designed to handle complex organizational hierarchies, real-time notifications, and audit logging.

[Features](#features) • [Installation](#installation) • [API Documentation](#api-documentation) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Database Models](#database-models)
8. [API Documentation](#api-documentation)
   - [Authentication](#authentication-apis)
   - [Users](#user-apis)
   - [Groups](#group-apis)
   - [Projects](#project-apis)
   - [Incidents](#incident-apis)
   - [Timeline](#timeline-apis)
   - [Notifications](#notification-apis)
9. [Roles & Permissions](#roles--permissions)
10. [Middleware Flow](#middleware-flow)
11. [Real-Time Integration (Socket.io)](#real-time-integration-socketio)
12. [Notification System](#notification-system)
13. [Error Handling](#error-handling)
14. [Development](#development)
15. [Deployment](#deployment)

---

## Overview

**IntelOps** is a comprehensive incident management backend system that simulates real-world production systems similar to Jira, Azure DevOps, and PagerDuty. It enforces strict organizational hierarchies, role-based access control, and maintains complete audit trails.

### Use Cases

- **Incident Tracking**: Track and manage incidents across teams and projects
- **Team Collaboration**: Organize teams with clear leadership and responsibilities
- **Real-Time Updates**: Receive instant notifications via Socket.io
- **Audit Compliance**: Complete timeline history of all actions
- **Access Control**: Granular permission system based on user roles
- **Project Management**: Organize incidents by project and team ownership

---

## Features

✅ **Role-Based Access Control (RBAC)**
- Admin, TeamLead, TeamMember, and Bugger roles
- Hierarchical permission enforcement
- Project and group-based access

✅ **Organizational Hierarchy**
- Group → Project → Incident structure
- Automatic ownership derivation
- Team-based access control

✅ **Incident Management**
- Create and track incidents with severity levels
- Auto-assign team leads
- Manage responders and assignments
- Status tracking (open, inProgress, resolved)

✅ **Real-Time Notifications**
- Socket.io integration for instant updates
- Persistent notification storage
- Event-driven triggers

✅ **Audit Trail**
- Complete timeline history
- Immutable action logging
- User activity tracking

✅ **Security**
- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Token-based session management

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js API                           │
│  ┌────────────────┬────────────────┬──────────────────────┐ │
│  │   Routes       │  Middleware    │    Controllers       │ │
│  │ - Auth         │ - Auth         │ - Logic              │ │
│  │ - Users        │ - Role         │ - Validation         │ │
│  │ - Groups       │ - Validation   │ - Business Rules     │ │
│  │ - Projects     │                │ - DB Operations      │ │
│  │ - Incidents    │                │                      │ │
│  │ - Timeline     │                │                      │ │
│  │ - Notify       │                │                      │ │
│  └────────────────┴────────────────┴──────────────────────┘ │
└────────────────┬─────────────────────┬─────────────────────┘
                 │                     │
                 ▼                     ▼
        ┌─────────────────┐  ┌──────────────────┐
        │   MongoDB       │  │  Socket.io       │
        │                 │  │  Real-Time       │
        │ - Models        │  │  - Notifications │
        │ - Persistence   │  │  - Events        │
        │ - Indexing      │  │  - Rooms         │
        └─────────────────┘  └──────────────────┘
```

### Data Flow

```
Request
   ↓
Route Handler
   ↓
Protect Middleware (JWT validation)
   ↓
AllowRoles Middleware (RBAC check)
   ↓
Validator Middleware (Input validation)
   ↓
Controller (Business logic)
   ↓
Database Query
   ↓
Notification System (if applicable)
   ↓
Socket.io Emit (if real-time)
   ↓
Response
```

---

## Prerequisites

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **MongoDB**: >= 4.0 (Atlas or Local)
- **Git**: For version control

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IntelOps/Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the Backend directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/IntelOps

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key_here

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# Server Port (optional, defaults to 3000)
PORT=3000
```

### 4. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

### 5. Create Initial Admin User

```bash
npm run create-admin
```

This creates a default admin user with:
- **Username**: admin
- **Email**: admin@test.com
- **Password**: admin123

---

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `oGnIGvaCeQ46zNyHlBmKcf7hIhDBQVfxLOajDNP6N5U` |
| `CLIENT_URL` | Frontend application URL for CORS | `http://localhost:5173` |
| `PORT` | Server port (optional) | `3000` |

### CORS Configuration

The server is configured to accept requests from the `CLIENT_URL` specified in `.env`:

```javascript
cors({
  origin: config.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})
```

---

## Database Models

### User Model

Represents system users with role-based access.

```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique, lowercase),
  password: String (hashed, required),
  role: String (enum: "admin", "bugger", "teamLead", "teamMember"),
  group: ObjectId (ref: Group, nullable),
  avatar: String (URL, optional),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `{ role: 1 }`, `{ group: 1, role: 1 }`, `{ email: 1 }`

---

### Group Model

Represents teams/groups within the organization.

```javascript
{
  _id: ObjectId,
  name: String (required),
  teamLead: ObjectId (ref: User, nullable),
  members: [ObjectId] (ref: User),
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

**Purpose**: Groups organize users into teams. Each group has one TeamLead who manages the group's projects and incidents.

---

### Project Model

Represents projects within groups.

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (default: ""),
  group: ObjectId (ref: Group, required),
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

**Purpose**: Projects are logical containers for incidents. Incidents inherit the project's group.

---

### Incident Model

Represents individual incidents/issues/bugs.

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  status: String (enum: "open", "inProgress", "resolved", default: "open"),
  severity: String (enum: "low", "medium", "high", default: "low"),
  isPublic: Boolean (default: false),
  publicSlug: String (unique, sparse),
  project: ObjectId (ref: Project),
  group: ObjectId (ref: Group, required),
  createdBy: ObjectId (ref: User, required),
  assignedLead: ObjectId (ref: User, required),
  responders: [ObjectId] (ref: User),
  resolvedBy: ObjectId (ref: User, nullable),
  resolvedAt: Date,
  postmortem: {
    summary: String,
    rootCause: String,
    impact: String,
    resolution: String
  },
  aiSuggestions: {
    nextAction: String,
    timelineSummary: String,
    generatedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Rules**:
- Every incident must belong to a project
- The incident's group is automatically derived from the project's group
- The assignedLead is automatically assigned from the group's teamLead
- Only TeamLeads can assign responders
- Responders must be members of the same group

---

### Timeline Model

Represents audit log entries for incidents.

```javascript
{
  _id: ObjectId,
  incident: ObjectId (ref: Incident, required),
  type: String (enum: "update", "action", "status", default: "update"),
  message: String (required),
  isPublic: Boolean (default: false),
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

**Purpose**: Immutable history of all actions on an incident. Automatically created by the system.

---

### Notification Model

Represents persistent notifications for users.

```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: User, required),
  type: String (enum: "incident", "assignment", "timeline", "status"),
  incident: ObjectId (ref: Incident),
  message: String (required),
  isRead: Boolean (default: false),
  createdAt: Date
}
```

**Purpose**: Stores notifications for users. Also emitted via Socket.io for real-time delivery.

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Response Format

All API responses follow a consistent format:

**Success Response**:
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Authentication

All endpoints (except login) require a JWT token in the cookies or Authorization header.

**Token Generation**: JWT tokens are generated during login and stored in cookies.

---

## Authentication APIs

### POST /auth/login

Authenticate user and receive JWT token.

**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@test.com",
    "password": "123456"
  }
```

**Request Body**:
```json
{
  "email": "user@test.com",
  "password": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "role": "teamLead"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Status Codes**:
- `200`: Login successful
- `400`: Invalid credentials
- `500`: Server error

---

### GET /auth/get-me

Retrieve the current authenticated user's information.

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```bash
curl -X GET http://localhost:3000/api/auth/get-me \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "rahul",
    "email": "rahul@test.com",
    "role": "teamLead",
    "group": "507f1f77bcf86cd799439012",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized (missing/invalid token)
- `404`: User not found

---

### GET /auth/logout

Logout the current user.

**Request**:
```bash
curl -X GET http://localhost:3000/api/auth/logout \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User APIs

### POST /users/create

Create a new user in the system.

**Access Control**:
- **Admin**: Can create users with any role
- **TeamLead**: Can only create TeamMember users within their group

**Middleware Flow**: `protect` → `allowRoles("admin", "teamLead")` → `validateCreateUser` → `createUser`

**Request**:
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "username": "rahul",
    "email": "rahul@test.com",
    "password": "123456",
    "role": "teamMember",
    "group": "507f1f77bcf86cd799439012"
  }
```

**Request Body**:
```json
{
  "username": "rahul",
  "email": "rahul@test.com",
  "password": "123456",
  "role": "teamMember",
  "group": "507f1f77bcf86cd799439012"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "username": "rahul",
    "email": "rahul@test.com",
    "role": "teamMember",
    "group": "507f1f77bcf86cd799439012",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation Rules**:
- `username`: Required, string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `role`: Required, must be one of: "admin", "bugger", "teamLead", "teamMember"
- `group`: Required for teamMember and teamLead roles

**Error Response** (403 Forbidden):
```json
{
  "success": false,
  "message": "TeamLead can only create teamMember users"
}
```

---

### GET /users

List all users with optional filters.

**Access Control**: Admin and TeamLead only

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | Filter by role (admin, bugger, teamLead, teamMember) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

**Request**:
```bash
curl -X GET "http://localhost:3000/api/users?role=teamMember&page=1&limit=10" \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "username": "rahul",
      "email": "rahul@test.com",
      "role": "teamMember",
      "group": "507f1f77bcf86cd799439012",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "username": "priya",
      "email": "priya@test.com",
      "role": "teamMember",
      "group": "507f1f77bcf86cd799439012",
      "isActive": true,
      "createdAt": "2024-01-16T11:20:00Z"
    }
  ]
}
```

---

## Group APIs

### POST /groups

Create a new group (Admin only).

**Access Control**: Admin only

**Middleware Flow**: `protect` → `allowRoles("admin")` → `validateCreateGroup` → `createGroup`

**Request**:
```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "name": "Backend Team"
  }
```

**Request Body**:
```json
{
  "name": "Backend Team"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Backend Team",
    "teamLead": null,
    "members": [],
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation**:
- `name`: Required, string, unique

---

### GET /groups

Retrieve all groups.

**Access Control**: Admin and TeamLead

**Request**:
```bash
curl -X GET http://localhost:3000/api/groups \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Backend Team",
      "teamLead": {
        "_id": "507f1f77bcf86cd799439015",
        "username": "rahul"
      },
      "members": [
        {
          "_id": "507f1f77bcf86cd799439016",
          "username": "priya"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### PATCH /groups/:id/assign-lead

Assign a TeamLead to a group.

**Access Control**: Admin only

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/groups/507f1f77bcf86cd799439012/assign-lead \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "teamLeadId": "507f1f77bcf86cd799439015"
  }
```

**Request Body**:
```json
{
  "teamLeadId": "507f1f77bcf86cd799439015"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Backend Team",
    "teamLead": "507f1f77bcf86cd799439015",
    "members": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Business Rules**:
- The user must have role "teamLead"
- The user must be added to the group before assigning as lead

---

### PATCH /groups/:id/members

Add members to a group.

**Access Control**: TeamLead (can add to their own group only)

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/groups/507f1f77bcf86cd799439012/members \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "members": ["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
  }
```

**Request Body**:
```json
{
  "members": ["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Backend Team",
    "teamLead": "507f1f77bcf86cd799439015",
    "members": ["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Project APIs

### POST /projects

Create a new project within a group.

**Access Control**: Admin only

**Request**:
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "name": "Payment System",
    "description": "Handles transactions",
    "groupId": "507f1f77bcf86cd799439012"
  }
```

**Request Body**:
```json
{
  "name": "Payment System",
  "description": "Handles transactions",
  "groupId": "507f1f77bcf86cd799439012"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "name": "Payment System",
    "description": "Handles transactions",
    "group": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation**:
- `name`: Required, string
- `description`: Optional, string
- `groupId`: Required, must be a valid group ObjectId

---

### GET /projects

Retrieve all projects accessible to the user.

**Access Control**: Admin, TeamLead, Bugger

**Request**:
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "name": "Payment System",
      "description": "Handles transactions",
      "group": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Backend Team"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /projects/:id

Retrieve a specific project by ID.

**Request**:
```bash
curl -X GET http://localhost:3000/api/projects/507f1f77bcf86cd799439018 \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "name": "Payment System",
    "description": "Handles transactions",
    "group": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Backend Team"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Incident APIs

### POST /incidents

Create a new incident.

**Access Control**: Bugger only

**Important**: The system automatically:
1. Derives the group from the project
2. Assigns the group's TeamLead as assignedLead
3. Sets status to "open"
4. Creates a timeline entry
5. Sends notifications to the assigned TeamLead

**Middleware Flow**: `protect` → `allowRoles("bugger")` → `validateCreateIncident` → `createIncident`

**Request**:
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "title": "Server Down",
    "description": "API not responding",
    "severity": "high",
    "projectId": "507f1f77bcf86cd799439018"
  }
```

**Request Body**:
```json
{
  "title": "Server Down",
  "description": "API not responding",
  "severity": "high",
  "projectId": "507f1f77bcf86cd799439018"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439019",
    "title": "Server Down",
    "description": "API not responding",
    "severity": "high",
    "status": "open",
    "project": "507f1f77bcf86cd799439018",
    "group": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439020",
    "assignedLead": "507f1f77bcf86cd799439015",
    "responders": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation Rules**:
- `title`: Required, string
- `description`: Optional, string
- `severity`: Required, must be one of: "low", "medium", "high"
- `projectId`: Required, must be a valid project ObjectId

**System Actions**:
- Creates incident with status = "open"
- Assigns incident to group's teamLead
- Creates timeline entry: "Incident created"
- Notifies teamLead via notification system and Socket.io

---

### GET /incidents

Retrieve incidents with role-based filtering.

**Access Control**: All authenticated users

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (open, inProgress, resolved) |
| `severity` | string | Filter by severity (low, medium, high) |
| `groupId` | string | Filter by group ID |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

**Request**:
```bash
curl -X GET "http://localhost:3000/api/incidents?status=open&severity=high" \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "title": "Server Down",
      "description": "API not responding",
      "severity": "high",
      "status": "open",
      "project": "507f1f77bcf86cd799439018",
      "group": "507f1f77bcf86cd799439012",
      "assignedLead": "507f1f77bcf86cd799439015",
      "responders": [],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Role-Based Filtering**:
- **Admin**: Can see all incidents
- **TeamLead**: Can see incidents in their group
- **TeamMember**: Can see incidents they are assigned to
- **Bugger**: Can see incidents they created

---

### GET /incidents/:id

Retrieve a specific incident by ID.

**Request**:
```bash
curl -X GET http://localhost:3000/api/incidents/507f1f77bcf86cd799439019 \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439019",
    "title": "Server Down",
    "description": "API not responding",
    "severity": "high",
    "status": "open",
    "project": "507f1f77bcf86cd799439018",
    "group": "507f1f77bcf86cd799439012",
    "assignedLead": {
      "_id": "507f1f77bcf86cd799439015",
      "username": "rahul"
    },
    "responders": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "username": "priya"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### PATCH /incidents/:id/responders

Assign responders to an incident.

**Access Control**: TeamLead only

**Important**: 
- Responders must be members of the incident's group
- Existing responders are replaced
- Notifications are sent to newly assigned responders

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/incidents/507f1f77bcf86cd799439019/responders \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "responders": ["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
  }
```

**Request Body**:
```json
{
  "responders": ["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "responders": ["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
  }
}
```

**Business Rules**:
- Only TeamLead of the incident's group can assign responders
- Responders must be members of the same group
- Duplicate responders are removed
- System creates timeline entry: "Responders assigned"

---

### PATCH /incidents/:id/status

Update incident status.

**Access Control**: TeamLead (for incidents in their group)

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/incidents/507f1f77bcf86cd799439019/status \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "status": "inProgress"
  }
```

**Request Body**:
```json
{
  "status": "inProgress"
}
```

**Allowed Values**: "open", "inProgress", "resolved"

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "inProgress"
  }
}
```

**System Actions**:
- Updates incident status
- Creates timeline entry with status change
- Notifies all responders and assigned lead
- If resolved, records resolvedBy and resolvedAt

---

## Timeline APIs

### POST /incidents/:id/timeline

Add an event to incident timeline.

**Access Control**: All authenticated users

**Important**: Timeline entries are immutable audit logs. Once created, they cannot be deleted or modified.

**Request**:
```bash
curl -X POST http://localhost:3000/api/incidents/507f1f77bcf86cd799439019/timeline \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d {
    "message": "Investigation started",
    "type": "action"
  }
```

**Request Body**:
```json
{
  "message": "Investigation started",
  "type": "action"
}
```

**Request Parameters**:
- `message`: Required, string (max 500 characters)
- `type`: Optional, one of "update", "action", "status" (default: "update")

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "incident": "507f1f77bcf86cd799439019",
    "message": "Investigation started",
    "type": "action",
    "createdBy": "507f1f77bcf86cd799439015",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

**System Actions**:
- Creates immutable timeline entry
- Notifies all incident responders and lead
- Emits Socket.io event to relevant users

---

### GET /incidents/:id/timeline

Retrieve all timeline events for an incident.

**Request**:
```bash
curl -X GET http://localhost:3000/api/incidents/507f1f77bcf86cd799439019/timeline \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "incident": "507f1f77bcf86cd799439019",
      "message": "Incident created",
      "type": "status",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439020",
        "username": "bugger_user"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439020",
      "incident": "507f1f77bcf86cd799439019",
      "message": "Investigation started",
      "type": "action",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439015",
        "username": "rahul"
      },
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Sorting**: Results are sorted by createdAt (oldest first)

---

## Notification APIs

### GET /notifications

Retrieve notifications for the current user.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `isRead` | boolean | Filter by read status (true/false) |
| `type` | string | Filter by type (incident, assignment, timeline, status) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

**Request**:
```bash
curl -X GET "http://localhost:3000/api/notifications?isRead=false&limit=20" \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "recipient": "507f1f77bcf86cd799439015",
      "type": "incident",
      "incident": "507f1f77bcf86cd799439019",
      "message": "New incident assigned: Server Down",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439023",
      "recipient": "507f1f77bcf86cd799439015",
      "type": "assignment",
      "incident": "507f1f77bcf86cd799439019",
      "message": "You have been assigned to: Server Down",
      "isRead": false,
      "createdAt": "2024-01-15T10:32:00Z"
    }
  ]
}
```

---

### PATCH /notifications/:id/read

Mark a notification as read.

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/notifications/507f1f77bcf86cd799439022/read \
  -H "Cookie: token=<jwt_token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "isRead": true
  }
}
```

---

## Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────┐
│  ADMIN                                  │
│  - Create groups, projects              │
│  - Manage all users                     │
│  - Create admin/bugger/teamLead roles   │
│  - Full system access                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TEAMLEAD                               │
│  - Manage team members in group         │
│  - Assign responders to incidents       │
│  - Update incident status               │
│  - Create teamMember users              │
│  - View group incidents                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BUGGER                                 │
│  - Create incidents                     │
│  - Add timeline events                  │
│  - View projects                        │
│  - Cannot assign/manage                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TEAM MEMBER                            │
│  - Work on assigned incidents           │
│  - Add timeline events                  │
│  - View group incidents                 │
│  - Cannot create/assign                 │
└─────────────────────────────────────────┘
```

### Permission Matrix

| Operation | Admin | TeamLead | Bugger | TeamMember |
|-----------|-------|----------|--------|-----------|
| Create Group | ✅ | ❌ | ❌ | ❌ |
| Assign Lead | ✅ | ❌ | ❌ | ❌ |
| Add Members | ✅ | ✅ | ❌ | ❌ |
| Create Project | ✅ | ❌ | ❌ | ❌ |
| Create User (Admin) | ✅ | ❌ | ❌ | ❌ |
| Create User (TeamMember) | ✅ | ✅ | ❌ | ❌ |
| Create Incident | ❌ | ❌ | ✅ | ❌ |
| Assign Responders | ✅ | ✅ | ❌ | ❌ |
| Update Status | ✅ | ✅ | ❌ | ❌ |
| Add Timeline Event | ✅ | ✅ | ✅ | ✅ |
| View Notifications | ✅ | ✅ | ✅ | ✅ |

---

## Middleware Flow

The API employs a standardized middleware chain to handle authentication, authorization, and validation:

### 1. Protect Middleware

**Location**: [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js)

**Purpose**: Verify JWT token and attach user to request

**Flow**:
1. Extract token from cookies or Authorization header
2. Verify token signature
3. Decode token to get user ID
4. Fetch user from database
5. Attach user to `req.user`

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `401 Unauthorized`: Token verification failed

```javascript
// Example usage in routes
router.get("/", protect, getUsers);
```

---

### 2. AllowRoles Middleware

**Location**: [src/middlewares/role.middleware.js](src/middlewares/role.middleware.js)

**Purpose**: Enforce role-based access control

**Usage**:
```javascript
// Allow only Admin and TeamLead
router.get("/", protect, allowRoles("admin", "teamLead"), getUsers);

// Allow only Admin
router.post("/", protect, allowRoles("admin"), createGroup);
```

**Error Response** (403 Forbidden):
```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

### 3. Validator Middleware

**Location**: [src/validators/](src/validators/)

**Purpose**: Validate request body and query parameters

**Example Validators**:
- `validateLoginUser`: Email format, password required
- `validateCreateUser`: Username unique, valid email, secure password
- `validateCreateIncident`: Title required, valid severity level
- `validateCreateGroup`: Group name required

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Validation failed: email is invalid"
}
```

---

### Example: Complete Middleware Flow

```javascript
// Route definition
router.post(
  "/",
  protect,                    // 1. Verify JWT
  allowRoles("admin"),        // 2. Check role
  validateCreateGroup,        // 3. Validate input
  createGroup                 // 4. Execute logic
);

// Request → Protect → AllowRoles → Validator → Controller → Response
```

---

## Real-Time Integration (Socket.io)

The system uses **Socket.io** for real-time notifications and updates.

### Server Setup

**Location**: [src/socket/index.js](src/socket/index.js)

```javascript
import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
    });
  });

  return io;
};
```

### Client Setup

```javascript
// Frontend
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

// Join user room
socket.emit("join", userId);

// Listen for notifications
socket.on("notification", (data) => {
  console.log("New notification:", data);
  // Update UI
});
```

### Socket Events

#### Server-Emitted Events

**Event**: `notification`

**Triggered When**:
- Incident is created (sent to TeamLead)
- Responders are assigned (sent to responders)
- Timeline event is added
- Incident status changes

**Payload**:
```javascript
{
  _id: "507f1f77bcf86cd799439022",
  recipient: "507f1f77bcf86cd799439015",
  type: "incident",
  incident: "507f1f77bcf86cd799439019",
  message: "New incident assigned: Server Down",
  isRead: false,
  createdAt: "2024-01-15T10:30:00Z"
}
```

**Emission Pattern**:
```javascript
// Emit to specific user room
io.to(userId).emit("notification", notification);

// Only users in the room receive the event
```

### User Rooms

Each authenticated user joins a room with their user ID:

```javascript
socket.on("join", (userId) => {
  socket.join(userId); // User is now in room "userId"
});

// Backend can emit to this room
io.to(userId).emit("notification", data);
```

---

## Notification System

The notification system provides both persistent storage and real-time delivery.

### Notification Types

| Type | Trigger | Recipients |
|------|---------|-----------|
| `incident` | New incident created | Assigned TeamLead |
| `assignment` | Responders assigned | Assigned responders |
| `timeline` | Timeline event added | All incident participants |
| `status` | Incident status changed | All incident participants |

### Notification Flow

```
1. Event Occurs (e.g., incident created)
   ↓
2. Create Notification Records in DB
   ↓
3. Emit Socket.io Events
   ↓
4. Frontend receives real-time update
   ↓
5. User can view persistent notification in DB
```

### Creating Notifications

**Location**: [src/utils/notification.util.js](src/utils/notification.util.js)

```javascript
import { createNotification } from "../utils/notification.util.js";

// Create notification for multiple recipients
await createNotification({
  recipients: [userId1, userId2],
  message: "New incident: Server Down",
  incidentId: incidentId,
  type: "incident"
});
```

### Notification Rules

✅ **Duplicate Prevention**: Same user won't receive duplicate notifications for the same event

✅ **Actor Exclusion**: The user who triggered the event doesn't receive a notification about it

✅ **Persistence**: All notifications are stored in MongoDB

✅ **Real-Time Delivery**: Notifications are also emitted via Socket.io for instant UI updates

---

## Error Handling

The API uses consistent error handling with appropriate HTTP status codes.

### Error Response Format

```json
{
  "success": false,
  "message": "Description of the error"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | OK | Successful GET request |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Unexpected error |

### Common Error Scenarios

**Authentication Errors**:
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**Authorization Errors**:
```json
{
  "success": false,
  "message": "Forbidden"
}
```

**Validation Errors**:
```json
{
  "success": false,
  "message": "Validation failed: email is invalid"
}
```

**Resource Not Found**:
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Development

### Project Structure

```
Backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── config/
│   │   ├── config.js         # Environment configuration
│   │   └── db.js             # MongoDB connection
│   ├── controllers/          # Business logic
│   ├── middlewares/          # Custom middlewares
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── socket/               # Socket.io setup
│   ├── utils/                # Utility functions
│   └── validators/           # Input validation
├── server.js                 # Server entry point
├── package.json
├── .env                      # Environment variables
└── .gitignore
```

### Running in Development

```bash
npm run dev
```

Uses **nodemon** for auto-reload on file changes.

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with auto-reload |
| `npm start` | Start production server |
| `npm run create-admin` | Create admin user |

### Testing APIs

**Using cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

**Using Postman**:
1. Import the API collection
2. Set environment variables (token, base URL)
3. Run requests

**Using Thunder Client** (VS Code):
```
Install Thunder Client extension
Create requests with proper headers and body
Test endpoints directly
```

---

## Deployment

### Environment Setup for Production

1. **Create production `.env`**:
```env
MONGO_URI=mongodb+srv://prod_user:prod_password@prod-cluster.mongodb.net/IntelOps
JWT_SECRET=your_production_jwt_secret_here
CLIENT_URL=https://yourdomain.com
PORT=3000
NODE_ENV=production
```

2. **Install production dependencies**:
```bash
npm ci --only=production
```

### Deployment Platforms

#### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=your_uri
   heroku config:set JWT_SECRET=your_secret
   ```
5. Deploy: `git push heroku main`

#### Railway

1. Connect GitHub repository
2. Add environment variables in Dashboard
3. Auto-deploys on push

#### AWS EC2

1. Launch Ubuntu instance
2. Install Node.js and npm
3. Clone repository
4. Install dependencies: `npm install`
5. Set environment variables
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   ```

#### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t intellops-backend .
docker run -p 3000:3000 --env-file .env intellops-backend
```

### Database Backups

**MongoDB Atlas** (Recommended):
- Automatic daily backups
- Point-in-time restore available
- Integrated with cloud platform

**Manual Backup**:
```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/IntelOps" --out=./backups
```

### Monitoring & Logging

- **Morgan**: HTTP request logging (already configured)
- **Sentry**: Error tracking and reporting
- **PM2 Monitoring**: Process health monitoring
- **DataDog**: Infrastructure monitoring

---

## API Summary Table

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | Login and get token | Public |
| GET | `/auth/get-me` | Get current user | Protected |
| GET | `/auth/logout` | Logout | Protected |
| POST | `/users/create` | Create user | Admin, TeamLead |
| GET | `/users` | List users | Admin, TeamLead |
| POST | `/groups` | Create group | Admin |
| GET | `/groups` | List groups | Admin, TeamLead |
| PATCH | `/groups/:id/assign-lead` | Assign TeamLead | Admin |
| PATCH | `/groups/:id/members` | Add members | TeamLead |
| POST | `/projects` | Create project | Admin |
| GET | `/projects` | List projects | Admin, TeamLead, Bugger |
| GET | `/projects/:id` | Get project | Protected |
| POST | `/incidents` | Create incident | Bugger |
| GET | `/incidents` | List incidents | Protected |
| GET | `/incidents/:id` | Get incident | Protected |
| PATCH | `/incidents/:id/responders` | Assign responders | TeamLead |
| PATCH | `/incidents/:id/status` | Update status | TeamLead |
| POST | `/incidents/:id/timeline` | Add timeline event | Protected |
| GET | `/incidents/:id/timeline` | Get timeline | Protected |
| GET | `/notifications` | List notifications | Protected |
| PATCH | `/notifications/:id/read` | Mark read | Protected |

---

## Key Business Rules

### 1. Incident Creation
- Only Buggers can create incidents
- Incident must belong to a project
- Group is derived from project
- TeamLead is auto-assigned from group

### 2. Responder Assignment
- Only TeamLead can assign responders
- Responders must be from the same group
- Creates timeline entry automatically
- Sends notifications to responders

### 3. Group Management
- Only Admins can create groups
- Groups must have unique names
- TeamLead must be assigned before incidents
- Only one TeamLead per group

### 4. User Creation
- Admins can create any role
- TeamLeads can only create TeamMembers
- Email must be unique
- User must be added to group (if not admin/bugger)

### 5. Timeline Events
- Immutable audit log
- Cannot be deleted or edited
- Automatically created by system
- Created for all significant actions

### 6. Notifications
- No duplicate notifications
- Actor is excluded from recipients
- Persistent in database
- Emitted in real-time via Socket.io

---

## Security Considerations

✅ **Password Security**
- Passwords hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Never returned in API responses

✅ **JWT Tokens**
- Secure random strings (256-bit)
- Stored in HTTP-only cookies
- Short expiration recommended

✅ **CORS Configuration**
- Restricted to CLIENT_URL
- Only specific HTTP methods allowed
- Credentials required for browser requests

✅ **Input Validation**
- All inputs validated before processing
- Database queries use parameterized queries
- Express-validator for schema validation

✅ **Authorization Checks**
- Role-based access control on all endpoints
- Group isolation enforced
- No cross-group operations allowed

---

## Troubleshooting

### Common Issues

**Error: "MONGO_URI is not defined"**
- Solution: Add MONGO_URI to `.env` file

**Error: "Invalid token"**
- Solution: Token may be expired. Login again to get new token

**Error: "Forbidden"**
- Solution: User role doesn't have permission for this action

**Error: "Not authorized, no token"**
- Solution: Include token in cookies or Authorization header

**Socket.io connection fails**
- Solution: Check CORS origin in `.env`

---

## Support & Documentation

For additional help:
- Review model documentation in [src/models/](src/models/)
- Check validator rules in [src/validators/](src/validators/)
- Examine controller logic in [src/controllers/](src/controllers/)
- Review middleware implementation in [src/middlewares/](src/middlewares/)

---

## License

ISC

---

## Version History

**v1.0.0** (January 2024)
- Initial release
- Complete RBAC implementation
- Incident management system
- Real-time notifications
- Socket.io integration
- Audit trail via Timeline

---

<div align="center">

Made with ❤️ for incident management

</div>
