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

    // Admin-only advanced metrics
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let totalUsers = 0;
    let activeUsersCount = 0;
    let expiredUsersCount = 0;
    let recentTransactions = [];
    let planDistribution = [];
    let expiringSoonUsers = [];
    let topForms = [];

    if (isAdmin) {
      totalUsers = await prisma.user.count();
      activeUsersCount = await prisma.user.count({ where: { planStatus: "ACTIVE" } });
      expiredUsersCount = await prisma.user.count({ where: { planStatus: "EXPIRED" } });

      // Revenue aggregates
      const revAgg = await prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      });
      totalRevenue = revAgg._sum.amount || 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const mRevAgg = await prisma.transaction.aggregate({
        where: {
          status: "SUCCESS",
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      });
      monthlyRevenue = mRevAgg._sum.amount || 0;

      // Recent 5 transactions
      recentTransactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          plan: { select: { name: true, price: true } },
        },
      });

      // Plan distribution
      const plansList = await prisma.plan.findMany({ select: { id: true, name: true } });
      const userPlanCounts = await prisma.user.groupBy({
        by: ["planId"],
        _count: { id: true },
      });

      planDistribution = plansList.map((p) => {
        const found = userPlanCounts.find((u) => u.planId === p.id);
        return {
          name: p.name,
          count: found ? found._count.id : 0,
        };
      });
      // Add Free / No plan if any
      const noPlanUsers = userPlanCounts.find((u) => u.planId === null);
      if (noPlanUsers && noPlanUsers._count.id > 0) {
        planDistribution.push({
          name: "Free / No Plan",
          count: noPlanUsers._count.id,
        });
      }

      // Expiring soon in <= 7 days
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      expiringSoonUsers = await prisma.user.findMany({
        where: {
          planStatus: "ACTIVE",
          planExpiresAt: {
            gte: now,
            lte: sevenDaysLater,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          planExpiresAt: true,
          plan: { select: { name: true } },
        },
        orderBy: { planExpiresAt: "asc" },
      });

      // Top forms by entry count
      topForms = await prisma.form.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { entries: true } },
        },
        orderBy: {
          entries: {
            _count: "desc",
          },
        },
        take: 5,
      });
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

    // Get announcement setting
    let announcement = null;
    try {
      const annSetting = await prisma.setting.findUnique({
        where: { key: "SYSTEM_ANNOUNCEMENT" },
      });
      if (annSetting && annSetting.value) {
        announcement = JSON.parse(annSetting.value);
      }
    } catch (e) {
      announcement = null;
    }

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
        // Admin specific
        totalRevenue,
        monthlyRevenue,
        activeUsersCount,
        expiredUsersCount,
        recentTransactions,
        planDistribution,
        expiringSoonUsers,
        topForms: topForms.map((tf) => ({
          id: tf.id,
          title: tf.title,
          entriesCount: tf._count.entries,
          owner: tf.user?.name || "Unknown",
          createdAt: tf.createdAt,
        })),
        announcement,
      },
    });
  })
);

module.exports = router;
