# IntelOps Backend – Complete API & Architecture Documentation

## 1. Overview

The system is designed as a workflow-driven incident management platform with layered architecture:

- Action → Data Layer → Notification Layer → Real-time Layer → Client

| Layer | Responsibility |
|---|---|
| Data Layer | Persistent storage (MongoDB) |
| Notification Layer | Tracks system events per user |
| Real-time Layer | Socket.io for live updates |
| Client | UI rendering and interaction |

## 2. Core Domain Models
### 2.1 Project
Represents a system or product.
```json
{
  "name": "String",
  "description": "String",
  "createdBy": "ObjectId", // admin
  "group": "ObjectId"
}
```
### 2.2 Group (Team)
Represents a team responsible for incidents.
```json
{
  "name": "String",
  "teamLead": "ObjectId",
  "members": ["ObjectId"],
  "createdBy": "ObjectId" // admin
}
```
### 2.3 User
```json
{
  "username": ,
  "email": ,
  "role": // admin | bugger | teamLead | teamMember,
  "createdBy": ,
  "group": "ObjectId"
}
```
### 2.4 Incident (Updated)
```json
{
  "title": ,
  "description": ,
  "severity": ,
  "status": ,
  "project": "ObjectId",
  "group": "ObjectId",
  "createdBy": ,
  "assignedLead": ,
  "responders": ["ObjectId"]
defaults to empty array if no responders]
defaults to empty array if no responders]
defaults to empty array if no responders]
defaults to empty array if no responders]
defaults to empty array if no responders]
description: String,
title: String,
eventType: String,
date: Date,
timelineMessage: String,
timelineType: String,
timelineCreatedBy: ObjectId,
timelineIsPublic: Boolean,
timelineCreatedAt: Date, 
description: String, 
title: String, 
senderUserID: ObjectID, 
senderUserName:String, 
senderUserRole:String, 
senderUserEmail:String, 
senderUserGroup:String, 
senderUserCreatedAt:String, 
senderUserUpdatedAt:String}