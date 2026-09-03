const { z } = require("zod");

/**
 * Middleware factory: validates req.body against a Zod schema.
 * On failure, returns 400 with a list of validation errors.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  req.body = result.data; // Use sanitized/parsed data
  next();
};

// ==========================================
// SCHEMAS
// ==========================================

const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  mobile: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid mobile number")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  gender: z.string().optional(),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required" }).min(1),
  password: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .trim()
    .optional(),
  mobile: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid mobile number")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100)
    .optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  gender: z.string().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
};
