IntelOps Backend – API Documentation
Overview

This backend supports:

Role-based user management (Admin, Team Lead, Team Member, Bugger)
Controlled user creation (no public signup)
Authentication using JWT (cookie/session-like)
User filtering for assignment workflows
Optimized database queries using indexing

Authentication
POST /api/auth/login

Request Body:
{
  "email": "user@test.com",
  "password": "123456"
}

Response:
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "userId",
    "role": "teamLead"
  }
}

Notes:
Token stored in cookie + returned in response
Used for protected routes

User APIs

Create User
POST /api/users/create

Access:
Admin → can create: bugger, teamLead, teamMember
TeamLead → can create: teamMember only

Request Body:
{
  "username": "rahul",
  "email": "rahul@test.com",
  "password": "123456",
  "role": "teamMember",
  "avatar": "https://i.pravatar.cc/150"
}

Response:
{
  "success": true,
  "data": { ...user }
}

Get Users
GET /api/users

Use Cases
1. Admin Dashboard
GET /api/users?role=teamLead

Fetch all team leads (for project assignment)

2. Team Lead Dashboard
GET /api/users

Fetch only their team members

Backend Logic
Role	Data Returned

Admin	All users (optional role filter)

TeamLead	Only users created by them (team members)

Response:
{
  "success": true,
  "count": 5,
  "data": [ ...users ]
}

Query Parameters
Param	Purpose
role	Filter users by role
page	Pagination (optional)
limit	Limit results

Middleware Flow
protect → allowRoles → validate → controller

🔹 protect
Verifies JWT
Attaches req.user

🔹 allowRoles("admin", "teamLead")
Restricts access based on role

🔹 validators
Ensures valid input
Returns structured errors

Database Design

User Model Key Fields
Field	Purpose
role	Access control
createdBy	Ownership (team structure)
email	Unique login
password	Hashed
avatar	Image URL

Indexing Strategy

Applied Indexes
role → index: true
createdBy → index: true
compound → { role, createdBy }
Why?
Query	Optimization
role filter	fast
team members fetch	fast
combined query	optimized

🧠 Core Logic Design
Role-based Creation
Admin → creates teamLead / bugger / members
TeamLead → creates teamMembers only
Ownership Model
TeamLead → owns teamMembers (via createdBy)
Query Filtering
Dynamic filter object used in DB queries

 Constraints
❌ No public registration
❌ No refresh tokens (simplified auth)
❌ No file upload (avatar = URL only)

Future Scope (Not implemented yet)
Incident APIs
Timeline system
Project & Group linking
AI integration APIs

Developer Notes
Always use protect before role-based routes
Do not trust frontend for access control
Keep APIs flexible using query params
Avoid over-indexing

Current Status
Auth ✔
User creation ✔
Role-based control ✔
Get users (filtered) ✔
Indexing ✔
