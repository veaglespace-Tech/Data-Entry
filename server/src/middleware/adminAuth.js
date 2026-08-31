/**
 * Admin-only middleware
 * Must be used AFTER the protect middleware
 * Checks if the authenticated user has ADMIN role
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403);
    next(new Error("Access denied. Admin only."));
  }
};

module.exports = { adminOnly };
