import express from "express";
import {
  createProject,
  getProjects,
  getProjectById
} from "../controllers/project.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateCreateProject } from "../validators/project.validator.js";

const router = express.Router();


router.post(
  "/",
  protect,
  allowRoles("admin"),
  validateCreateProject,
  createProject
);

router.get(
  "/",
  protect,
  allowRoles("admin", "teamLead", "bugger"),
  getProjects
);

router.get(
  "/:id",
  protect,
  getProjectById
);

export default router;