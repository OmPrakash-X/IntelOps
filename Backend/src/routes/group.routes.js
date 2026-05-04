import express from "express";
import {
  createGroup,
  getGroups,
  assignTeamLead,
  addMembers,
  updateGroup,
  deleteGroup
} from "../controllers/group.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

import {
  validateCreateGroup,
  validateAssignLead,
  validateAddMembers
} from "../validators/group.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("admin"),
  validateCreateGroup,
  createGroup
);

router.get(
  "/",
  protect,
  allowRoles("admin", "teamLead"),
  getGroups
);

router.patch(
  "/:id/assign-lead",
  protect,
  allowRoles("admin"),
  validateAssignLead,
  assignTeamLead
);

router.patch(
  "/:id/members",
  protect,
  allowRoles("teamLead", "admin"),
  validateAddMembers,
  addMembers
);

router.patch(
  "/:id",
  protect,
  allowRoles("admin"),
  updateGroup
);

router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteGroup
);

export default router;