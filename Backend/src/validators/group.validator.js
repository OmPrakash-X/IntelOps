import { body, validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// CREATE GROUP
export const validateCreateGroup = [
  body("name")
    .notEmpty()
    .withMessage("Group name is required"),
  validateRequest
];

export const validateAssignLead = [
  body("teamLeadId")
    .notEmpty()
    .withMessage("Team lead is required")
    .isMongoId()
    .withMessage("Invalid ID"),
  validateRequest
];

export const validateAddMembers = [
  body("members")
    .isArray({ min: 1 })
    .withMessage("Members array required"),
  validateRequest
];