const express = require("express");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { protect } = require("../middleware/auth");
const { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } = require("../middleware/validate");
const { sendPasswordResetEmail } = require("../utils/emailService");

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token (30 day login token)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Generate short-lived password reset token (1 hour)
const generateResetToken = (id, email) => {
  return jwt.sign({ id, email, purpose: "password_reset" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// @route   POST /api/auth/register
// @desc    Submit a registration request (pending admin approval)
// @access  Public
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, mobile, address, country, state, gender } = req.body;

    // Check if user already exists in User table (already approved)
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400);
      throw new Error("An account with this email already exists.");
    }

    // Check if a pending request already exists
    const existingRequest = await prisma.registrationRequest.findUnique({ where: { email } });
    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        res.status(400);
        throw new Error("A registration request with this email is already pending admin approval.");
      }
      if (existingRequest.status === "REJECTED") {
        res.status(400);
        throw new Error("Your previous registration request was rejected. Please contact the admin.");
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create registration request (not a user yet)
    const request = await prisma.registrationRequest.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobile,
        address,
        country,
        state,
        gender,
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration request submitted successfully! Admin will review and approve your account. You'll be able to login once approved.",
      data: {
        id: request.id,
        name: request.name,
        email: request.email,
        status: request.status,
      },
    });
  })
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Check if they have a pending/rejected registration request
      const request = await prisma.registrationRequest.findUnique({ where: { email } });
      if (request) {
        if (request.status === "PENDING") {
          res.status(403);
          throw new Error("Your registration is pending admin approval. Please wait for approval.");
        }
        if (request.status === "REJECTED") {
          res.status(403);
          throw new Error("Your registration request was rejected. Please contact the admin.");
        }
      }
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Check if account is banned/inactive
    if (user.status === "BANNED") {
      res.status(403);
      throw new Error("Your account has been suspended. Please contact the admin.");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Check plan start date
    if (user.planStartsAt && new Date() < new Date(user.planStartsAt)) {
      res.status(403);
      const dateStr = new Date(user.planStartsAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
      });
      throw new Error(`Your plan starts on ${dateStr}. You can login from that day onwards.`);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        planId: user.planId,
        planStatus: user.planStatus,
        planStartsAt: user.planStartsAt,
        planExpiresAt: user.planExpiresAt,
        address: user.address,
        country: user.country,
        state: user.state,
        gender: user.gender,
        plan: user.plan,
        token: generateToken(user.id),
      },
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: req.user,
    });
  })
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  protect,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (user) {
      const { name, mobile, password, address, country, state, gender } = req.body;
      
      let updatedData = {
        name: name || user.name,
        mobile: mobile !== undefined ? mobile : user.mobile,
        address: address !== undefined ? address : user.address,
        country: country !== undefined ? country : user.country,
        state: state !== undefined ? state : user.state,
        gender: gender !== undefined ? gender : user.gender,
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updatedData.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updatedData,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
          planId: true,
          planStatus: true,
          planExpiresAt: true,
          createdAt: true,
          address: true,
          country: true,
          state: true,
          gender: true,
        }
      });

      res.json({
        success: true,
        data: {
          ...updatedUser,
          token: generateToken(updatedUser.id),
        },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link to email
// @access  Public
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success (don't reveal if email exists - security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    const resetToken = generateResetToken(user.id, user.email);

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (err) {
      console.error("Email send failed:", err.message);
      res.status(500);
      throw new Error("Failed to send reset email. Please try again later.");
    }

    res.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  })
);

// @route   POST /api/auth/reset-password
// @desc    Reset password using the token
// @access  Public
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      res.status(400);
      throw new Error("Invalid or expired reset link. Please request a new one.");
    }

    // Verify the token purpose
    if (decoded.purpose !== "password_reset") {
      res.status(400);
      throw new Error("Invalid reset token.");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.email !== decoded.email) {
      res.status(400);
      throw new Error("User not found or token is invalid.");
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  })
);

module.exports = router;
