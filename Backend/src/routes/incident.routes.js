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

// Get all incidents
router.get("/", protect, getIncidents);

// Get single incident
router.get("/:id", protect, getIncidentById);

// Assign responders (teamLead only)
router.patch("/:id/responders", protect, allowRoles("teamLead"), validateAssignResponders, assignResponders);

// Update status: open → inProgress → resolved
router.patch("/:id/status", protect, validateUpdateStatus, updateStatus);

// Manual postmortem write/edit (teamLead only — AI auto-generates, this allows refinement)
router.patch("/:id/postmortem", protect, allowRoles("teamLead"), updatePostmortem);

export default router;