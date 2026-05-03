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
 * AI Routes — mounted under /api/incidents/:id/ai
 * All routes require authentication.
 */

// Root Cause Detection + Next Action Suggestions (any authenticated user)
router.get("/:id/ai/suggestions", protect, getAISuggestions);

// Manually trigger AI analysis (teamLead + admin only)
router.post("/:id/ai/analyze", protect, allowRoles("admin", "teamLead"), triggerAnalysis);

// Get stored postmortem for a resolved incident (any authenticated user)
router.get("/:id/ai/postmortem", protect, getPostmortem);

// Manually trigger postmortem generation (teamLead + admin only)
router.post("/:id/ai/postmortem", protect, allowRoles("admin", "teamLead"), triggerPostmortem);

export default router;
