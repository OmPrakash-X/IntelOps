import express from "express";
import { analyzeIncident } from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/analyze", protect, analyzeIncident);

export default router;