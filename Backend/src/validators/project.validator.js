import { body, validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const validateCreateProject = [
  body("name")
    .notEmpty()
    .withMessage("Project name is required"),

  body("groupId")
    .notEmpty()
    .withMessage("Group is required")
    .isMongoId()
    .withMessage("Invalid group ID"),

  validateRequest
];