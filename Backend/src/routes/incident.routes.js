import express from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  assignResponders,
  updateStatus,
  updatePostmortem
} from "../controllers/incident.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

import {
  validateCreateIncident,
  validateAssignResponders,
  validateUpdateStatus
} from "../validators/incident.validator.js";

const router = express.Router();

// Create incident (bugger only)
router.post("/", protect, allowRoles("bugger"), validateCreateIncident, createIncident);

// Get all incidents (public for landing page status)
router.get("/", getIncidents);

// Get single incident
router.get("/:id", getIncidentById);

// Assign responders (teamLead and admin)
router.patch("/:id/responders", protect, allowRoles("teamLead", "admin"), validateAssignResponders, assignResponders);

// Update status: open → inProgress → resolved
router.patch("/:id/status", protect, validateUpdateStatus, updateStatus);

// Manual postmortem write/edit (teamLead + admin)
router.patch("/:id/postmortem", protect, allowRoles("teamLead", "admin"), updatePostmortem);

export default router;