import express from "express";
import {
  getAISuggestions,
  triggerAnalysis,
  getPostmortem,
  triggerPostmortem,
} from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * AI Routes — all mounted under /api/incidents/:id/ai
 * All routes require authentication.
 */

// Root Cause Detection + Next Action Suggestions
router.get(
  "/:id/ai/suggestions",
  protect,
  getAISuggestions
);

// Manually trigger AI analysis (teamLead + admin only)
router.post(
  "/:id/ai/analyze",
  protect,
  allowRoles("admin", "teamLead"),
  triggerAnalysis
);

// Get stored postmortem for a resolved incident
router.get(
  "/:id/ai/postmortem",
  protect,
  getPostmortem
);

// Manually trigger postmortem generation (admin only)
router.post(
  "/:id/ai/postmortem",
  protect,
  allowRoles("admin", "teamLead"),
  triggerPostmortem
);

export default router;
