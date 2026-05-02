IntelOps Backend – API Documentation
🚀 Overview

This backend supports:

Role-based user management (Admin, Bugger, Team Lead, Team Member)
Controlled user creation (no public signup)
Authentication using JWT (cookie + token-based)
Incident lifecycle management (core system)
Timeline tracking for all actions
Optimized database queries using indexing
🔐 Authentication
POST /api/auth/login
📥 Request Body
{
  "email": "user@test.com",
  "password": "123456"
}
📤 Response
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "userId",
    "role": "teamLead"
  }
}
🧠 Notes
Token stored in cookie + returned in response
Used for all protected routes
👤 User APIs
✅ Create User
POST /api/users/create
🔒 Access
Admin → create: bugger, teamLead, teamMember
TeamLead → create: teamMember only
📥 Request Body
{
  "username": "rahul",
  "email": "rahul@test.com",
  "password": "123456",
  "role": "teamMember",
  "avatar": "https://i.pravatar.cc/150"
}
📊 Get Users
GET /api/users
🔹 Use Cases
Admin Dashboard
GET /api/users?role=teamLead

👉 Fetch all team leads

Team Lead Dashboard
GET /api/users

👉 Fetch only their team members

📤 Response
{
  "success": true,
  "count": 5,
  "data": []
}
🧠 Backend Logic
Role	Data Returned
Admin	All users (optional filter)
TeamLead	Only their team members
🔍 Query Parameters
Param	Purpose
role	Filter users
page	Pagination
limit	Limit results
🔥 Incident APIs (CORE SYSTEM)
✅ Create Incident
POST /api/incidents
🔒 Access
Bugger
📥 Request Body
{
  "title": "Payment service failure",
  "description": "Checkout failing with 500 error",
  "severity": "high"
}
🧠 Flow
Bugger → creates incident
→ status = open
→ timeline auto-entry created
📊 Get All Incidents
GET /api/incidents

👉 Returns all incidents sorted by latest

🔍 Get Single Incident
GET /api/incidents/:id
👨‍💼 Assign Team Lead
PATCH /api/incidents/:id/assign-lead
🔒 Access
Admin
📥 Body
{
  "teamLeadId": "user_id"
}
🧠 Flow
Admin assigns lead
→ status = inProgress
→ timeline entry created
👨‍💻 Assign Responders
PATCH /api/incidents/:id/responders
🔒 Access
TeamLead
📥 Body
{
  "responders": ["user_id_1", "user_id_2"]
}
🧠 Flow
TeamLead assigns responders
→ timeline entry created
🔄 Update Status
PATCH /api/incidents/:id/status
📥 Body
{
  "status": "resolved"
}
🧠 Flow
Status updated
→ timeline entry created
🎯 Incident Lifecycle
Bugger → Create Incident
→ Admin assigns Team Lead
→ Team Lead assigns Responders
→ Responders update status
→ Incident resolved
🧠 Middleware Flow
protect → allowRoles → validators → controller
🔹 protect
Verifies JWT
Attaches req.user
🔹 allowRoles
Restricts access based on role
🔹 validators
Validates input
Returns structured errors
🧱 Database Design
👤 User Model
Field	Purpose
role	Access control
createdBy	Ownership
email	Unique
password	Hashed
avatar	Image URL
🔥 Incident Model
Field	Purpose
title	Incident title
severity	Priority
status	open / inProgress / resolved
createdBy	Bugger
assignedLead	Team Lead
responders	Assigned members
⏱ Timeline Model
Field	Purpose
incident	Reference
message	Update
type	action / status
createdBy	User
⚡ Indexing Strategy
✅ Applied Indexes
User:
- role
- createdBy
- (role + createdBy)

Incident:
- createdBy
- assignedLead
- status
🧠 Core Logic Design
Role-based Creation
Admin → creates all users
TeamLead → creates only teamMembers
Ownership Model
TeamLead → owns teamMembers via createdBy
Incident Flow
Structured workflow instead of random updates
🚫 Constraints
❌ No public registration
❌ No refresh tokens
❌ No file uploads
❌ No socket integration yet
🔮 Future Scope
Timeline APIs (manual updates)
Socket.io (real-time notifications)
Project & Group APIs
AI-based incident analysis
🧠 Developer Notes
Always use protect before role-based routes
Never trust frontend for permissions
Use query params for flexibility
Avoid unnecessary indexing
Focus on working flow over perfection
✅ Current Status
Auth ✔
User APIs ✔
Incident APIs ✔
Assignment Flow ✔
Timeline (auto) ✔
Indexing ✔
🚀 Next Step
Timeline APIs → Core Feature