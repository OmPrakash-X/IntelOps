import express from "express";
import { createUser, getUsers } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateCreateUser } from "../validators/user.validator.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  allowRoles("admin", "teamLead"),
  validateCreateUser,
  createUser
);

router.get(
  "/",
  protect,
  allowRoles("admin", "teamLead"),
  getUsers
);

export default router;