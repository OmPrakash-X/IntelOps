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

export const validateCreateUser = [
  body("username")
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
    .trim(),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["admin", "bugger", "teamLead", "teamMember"])
    .withMessage("Invalid role"),

  body("avatar")
    .optional()
    .isURL().withMessage("Avatar must be a valid URL"),

  body("group")
    .optional()
    .isMongoId()
    .withMessage("Invalid group ID")
, validateRequest];
