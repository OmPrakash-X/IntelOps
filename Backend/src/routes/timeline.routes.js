import express from "express";
import {
  addTimelineEvent,
  getTimeline
} from "../controllers/timeline.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validateAddTimeline } from "../validators/timeline.validator.js";

const router = express.Router();


router.post(
  "/:id/timeline",
  protect,
  validateAddTimeline,
  addTimelineEvent
);


router.get(
  "/:id/timeline",
  getTimeline
);

export default router;