IntelOps Backend – API Documentation
Overview

This backend implements a structured incident management system with role-based access and workflow-driven APIs.

It supports:

Role-based user management (Admin, Bugger, Team Lead, Team Member)
Controlled user creation (no public registration)
JWT-based authentication (cookie + token)
Incident lifecycle management
Timeline-based event tracking
Resource-level access control
Indexed queries for performance
Authentication
POST /api/auth/login
Request Body
{
  "email": "user@test.com",
  "password": "123456"
}
Response
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "userId",
    "role": "teamLead"
  }
}
Notes
Token is returned in response and stored in cookies
Required for all protected routes
Middleware Flow

All protected routes follow:

protect → allowRoles → validators → controller
protect
Verifies JWT
Attaches req.user
allowRoles
Restricts access based on role
validators
Validates request body
Returns structured errors
User APIs
Create User
POST /api/users/create
Access
Admin: can create bugger, teamLead, teamMember
TeamLead: can create teamMember only
Request Body
{
  "username": "rahul",
  "email": "rahul@test.com",
  "password": "123456",
  "role": "teamMember",
  "avatar": "https://i.pravatar.cc/150"
}
Get Users
GET /api/users
Use Cases

Admin Dashboard

GET /api/users?role=teamLead

Fetch all team leads for assignment

Team Lead Dashboard

GET /api/users

Fetch only team members created by that team lead

Query Parameters
Param	Description
role	Filter by role
page	Pagination
limit	Limit results
Response
{
  "success": true,
  "count": 5,
  "data": []
}
Incident APIs

Base Route: /api/incidents

Create Incident
POST /api/incidents
Access
Bugger
Request Body
{
  "title": "Payment service failure",
  "description": "Checkout failing with 500 error",
  "severity": "high"
}
Behavior
Creates incident with status open
Automatically creates initial timeline entry
Get All Incidents
GET /api/incidents
Returns all incidents sorted by latest first
Get Single Incident
GET /api/incidents/:id
Assign Team Lead
PATCH /api/incidents/:id/assign-lead
Access
Admin
Request Body
{
  "teamLeadId": "user_id"
}
Behavior
Assigns team lead
Updates status to inProgress
Creates timeline event
Assign Responders
PATCH /api/incidents/:id/responders
Access
TeamLead
Request Body
{
  "responders": ["user_id_1", "user_id_2"]
}
Behavior
Assigns responders
Creates timeline event
Update Status
PATCH /api/incidents/:id/status
Request Body
{
  "status": "resolved"
}
Allowed Values
open
inProgress
resolved
Behavior
Updates incident status
Creates timeline event
Timeline APIs

Base Route: /api/incidents/:id/timeline

Add Timeline Event
POST /api/incidents/:id/timeline
Access Control
Only assigned Team Lead or Responders
Request Body
{
  "message": "Restarted payment service",
  "type": "action",
  "isPublic": true
}
Allowed Types
info
action
status
Get Timeline
GET /api/incidents/:id/timeline
Behavior
Returns timeline events sorted in ascending order (oldest first)
Includes both system-generated and manual events
Incident Lifecycle
Bugger → Create Incident
→ Admin assigns Team Lead
→ Team Lead assigns Responders
→ Responders update timeline
→ Status updated → Incident resolved
Access Control Design
Role-Based Access

Handled via middleware

Resource-Based Access

Handled inside controllers

Example:

Timeline updates allowed only if user is assigned to that incident
Database Design
User Model
Field	Purpose
role	Access control
createdBy	Ownership
email	Unique identifier
password	Hashed
avatar	Image URL
Incident Model
Field	Purpose
title	Incident title
severity	Priority
status	Current state
createdBy	Bugger
assignedLead	Team Lead
responders	Assigned users
Timeline Model
Field	Purpose
incident	Reference to incident
message	Event description
type	action / status / info
createdBy	User
isPublic	Visibility
Indexing Strategy
User
role
createdBy
compound index (role + createdBy)
Incident
createdBy
assignedLead
status
Timeline
incident
Validation Rules
Title minimum length enforced
Severity must be one of predefined values
MongoDB ObjectId validation applied
Responders must be array of valid IDs
Constraints
No public registration
No refresh token mechanism
No file upload support
No real-time system implemented yet
Current Status
Authentication implemented
User management implemented
Incident APIs implemented
Timeline APIs implemented
Resource-level access control implemented
Indexing applied
Next Steps
Notification system
Socket.io integration (real-time updates)
Project and Group APIs
AI-based analysis
Developer Notes
Always apply authentication before authorization
Do not rely on frontend for access control
Prefer controller-level checks for resource ownership
Avoid over-engineering abstractions
Ensure APIs are tested with role-specific scenarios