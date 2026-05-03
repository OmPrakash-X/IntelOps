import { body, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};

export const validateAddTimeline = [
  body("message")
    .notEmpty().withMessage("Message is required")
    .isLength({ min: 3 }).withMessage("Message too short"),

  body("type")
    .isIn(["info", "action", "status"])
    .withMessage("Invalid type"),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be boolean"),

  validateRequest
];