const express = require("express");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/plans
// @desc    Get all plans
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    res.json({
      success: true,
      data: plans,
    });
  })
);

// @route   GET /api/plans/:id
// @desc    Get plan by ID
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!plan) {
      res.status(404);
      throw new Error("Plan not found");
    }

    res.json({
      success: true,
      data: plan,
    });
  })
);

module.exports = router;
