const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Middleware to protect routes — verifies JWT token
 * and attaches user to request object
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          planId: true,
          planStatus: true,
          planExpiresAt: true,
          createdAt: true,
          mobile: true,
          address: true,
          country: true,
          state: true,
          gender: true,
        },
      });

      // Auto-expire plan if past expiry date
      if (
        req.user &&
        req.user.planStatus === "ACTIVE" &&
        req.user.planExpiresAt &&
        new Date() > new Date(req.user.planExpiresAt)
      ) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { planStatus: "EXPIRED" },
        });
        req.user.planStatus = "EXPIRED";
      }

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      res.status(401);
      next(new Error("Not authorized, token failed"));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error("Not authorized, no token"));
  }
};

module.exports = { protect };
