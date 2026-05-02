import express from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  assignLead,
  assignResponders,
  updateStatus
} from "../controllers/incident.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

import {
  validateCreateIncident,
  validateAssignLead,
  validateAssignResponders,
  validateUpdateStatus
} from "../validators/incident.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("bugger"),
  validateCreateIncident,
  createIncident
);

router.get(
  "/",
  protect,
  getIncidents
);


router.get(
  "/:id",
  protect,
  getIncidentById
);


router.patch(
  "/:id/assign-lead",
  protect,
  allowRoles("admin"),
  validateAssignLead,
  assignLead
);


router.patch(
  "/:id/responders",
  protect,
  allowRoles("teamLead"),
  validateAssignResponders,
  assignResponders
);


router.patch(
  "/:id/status",
  protect,
  validateUpdateStatus,
  updateStatus
);

export default router;