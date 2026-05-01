import express from "express";
import { Router } from "express";
import { loginUser } from "../controllers/auth.controller.js";
import { validateLoginUser } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/login", validateLoginUser, loginUser);

export default router;