const express = require("express");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const { protect } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// All dashboard routes are protected
router.use(protect);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics (admin: global, user: personal)
// @access  Private
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    // Scope filter: admin sees all, user sees own
    const formFilter = isAdmin ? {} : { userId };
    const entryFilter = isAdmin ? {} : { form: { userId } };

    // Get total forms
    const totalForms = await prisma.form.count({
      where: formFilter,
    });

    // Get total entries
    const totalEntries = await prisma.entry.count({
      where: entryFilter,
    });

    // Admin-only: Get total users
    let totalUsers = 0;
    if (isAdmin) {
      totalUsers = await prisma.user.count();
    }

    // Get recent entries (last 5)
    const recentEntries = await prisma.entry.findMany({
      where: entryFilter,
      include: {
        form: {
          select: { title: true, user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get entries per form (for charts)
    const formsWithCount = await prisma.form.findMany({
      where: formFilter,
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: { entries: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get entries created per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.entry.findMany({
      where: {
        ...entryFilter,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const activityByDay = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      activityByDay[key] = 0;
    }

    recentActivity.forEach((entry) => {
      const key = entry.createdAt.toISOString().split("T")[0];
      if (activityByDay[key] !== undefined) {
        activityByDay[key]++;
      }
    });

    const dailyActivity = Object.entries(activityByDay).map(([date, count]) => ({
      date,
      entries: count,
    }));

    res.json({
      success: true,
      data: {
        totalForms,
        totalEntries,
        totalUsers,
        isAdmin,
        recentEntries,
        formsWithCount: formsWithCount.map((f) => ({
          id: f.id,
          title: f.title,
          entries: f._count.entries,
          createdAt: f.createdAt,
          owner: f.user?.name || "Unknown",
        })),
        dailyActivity,
      },
    });
  })
);

module.exports = router;
