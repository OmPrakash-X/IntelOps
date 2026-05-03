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


export const validateCreateIncident = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 5 }).withMessage("Title must be at least 5 characters"),

  body("severity")
    .notEmpty().withMessage("Severity is required")
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid severity"),

  body("description")
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("projectId")
    .notEmpty().withMessage("Project ID is required")
    .isMongoId().withMessage("Invalid project ID"),

  validateRequest
];


export const validateAssignLead = [
  body("teamLeadId")
    .notEmpty().withMessage("Team Lead ID required")
    .isMongoId().withMessage("Invalid ID"),

  validateRequest
];


export const validateAssignResponders = [
  body("responders")
    .isArray({ min: 1 })
    .withMessage("Responders must be an array"),

  body("responders.*")
    .isMongoId()
    .withMessage("Invalid responder ID"),

  validateRequest
];


export const validateUpdateStatus = [
  body("status")
    .isIn(["open", "inProgress", "resolved"])
    .withMessage("Invalid status"),

  validateRequest
];