import express from "express";
import { Router } from "express";
import { getMe, loginUser,logoutUser } from "../controllers/auth.controller.js";
import { validateLoginUser } from "../validators/auth.validator.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", validateLoginUser, loginUser);
router.get("/get-me", protect, getMe);
router.get("/logout", logoutUser);

export default router;