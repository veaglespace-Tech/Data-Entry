const express = require("express");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/plans/settings/gst
// @desc    Get global GST percentage
// @access  Public
router.get(
  "/settings/gst",
  asyncHandler(async (req, res) => {
    let gstSetting = await prisma.setting.findUnique({
      where: { key: "GST_PERCENTAGE" },
    });

    // Fallback to 18 if not found (seed might have failed)
    const gstValue = gstSetting ? parseFloat(gstSetting.value) : 18;

    res.json({ success: true, data: { gst: gstValue } });
  })
);

// @route   GET /api/plans
// @desc    Get all active plans
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { price: 'asc' }
      ]
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
