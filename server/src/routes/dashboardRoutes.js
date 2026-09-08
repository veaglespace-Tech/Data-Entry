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

    const formFilter = isAdmin ? {} : { userId };
    const entryFilter = isAdmin ? {} : { form: { userId } };

    const totalForms = await prisma.form.count({ where: formFilter });
    const totalEntries = await prisma.entry.count({ where: entryFilter });

    // Admin-only metrics
    let totalUsers = 0;
    let activeUsersCount = 0;
    let pendingRequestsCount = 0;
    let totalFieldTemplates = 0;
    let totalAssignedTemplates = 0;
    let recentRegistrationRequests = [];
    let planDistribution = [];
    let topForms = [];

    if (isAdmin) {
      totalUsers = await prisma.user.count();
      activeUsersCount = await prisma.user.count({ where: { planStatus: "ACTIVE" } });
      pendingRequestsCount = await prisma.registrationRequest.count({ where: { status: "PENDING" } });
      totalFieldTemplates = await prisma.adminFieldTemplate.count();
      totalAssignedTemplates = await prisma.userFieldTemplate.count();
      
      recentRegistrationRequests = await prisma.registrationRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 4,
      });

      // Plan distribution
      const plansList = await prisma.plan.findMany({ select: { id: true, name: true } });
      const userPlanCounts = await prisma.user.groupBy({
        by: ["planId"],
        _count: { id: true },
      });

      planDistribution = plansList.map((p) => {
        const found = userPlanCounts.find((u) => u.planId === p.id);
        return { name: p.name, count: found ? found._count.id : 0 };
      });

      const noPlanUsers = userPlanCounts.find((u) => u.planId === null);
      if (noPlanUsers && noPlanUsers._count.id > 0) {
        planDistribution.push({ name: "No Plan", count: noPlanUsers._count.id });
      }

      // Top forms by entry count
      topForms = await prisma.form.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { entries: true } },
        },
        orderBy: { entries: { _count: "desc" } },
        take: 5,
      });
    }

    // Recent entries (last 5)
    const recentEntries = await prisma.entry.findMany({
      where: entryFilter,
      include: {
        form: { select: { title: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Entries per form (for charts)
    const formsWithCount = await prisma.form.findMany({
      where: formFilter,
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { entries: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Entries per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.entry.findMany({
      where: { ...entryFilter, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
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
      if (activityByDay[key] !== undefined) activityByDay[key]++;
    });

    const dailyActivity = Object.entries(activityByDay).map(([date, count]) => ({ date, entries: count }));

    // Announcement setting
    let announcement = null;
    try {
      const annSetting = await prisma.setting.findUnique({ where: { key: "SYSTEM_ANNOUNCEMENT" } });
      if (annSetting && annSetting.value) announcement = JSON.parse(annSetting.value);
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
        pendingRequestsCount,
        totalFieldTemplates,
        totalAssignedTemplates,
        recentRegistrationRequests,
        activeUsersCount,
        recentEntries,
        formsWithCount: formsWithCount.map((f) => ({
          id: f.id,
          title: f.title,
          entries: f._count.entries,
          createdAt: f.createdAt,
          owner: f.user?.name || "Unknown",
        })),
        dailyActivity,
        planDistribution,
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

// @route   GET /api/dashboard/my-templates
// @desc    Get field templates assigned to the current user
// @access  Private (User)
router.get(
  "/my-templates",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const assignments = await prisma.userFieldTemplate.findMany({
      where: { userId },
      include: { template: true },
      orderBy: { assignedAt: "desc" },
    });

    res.json({ success: true, data: assignments });
  })
);

// @route   GET /api/dashboard/my-entries
// @desc    Get all entries by the current user across all their forms
// @access  Private (User)
router.get(
  "/my-entries",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where: { form: { userId } },
        include: {
          form: { select: { id: true, title: true, fields: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.entry.count({ where: { form: { userId } } }),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  })
);

// @route   GET /api/dashboard/my-entries/export
// @desc    Export user's entries as Excel (.xlsx)
// @access  Private (User)
router.get(
  "/my-entries/export",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { formId } = req.query;

    let entryFilter = { form: { userId } };
    let targetForm = null;

    if (formId) {
      const form = await prisma.form.findFirst({
        where: { id: parseInt(formId), userId },
      });
      if (!form) {
        res.status(404);
        throw new Error("Form not found");
      }
      entryFilter = { formId: parseInt(formId) };
      targetForm = form;
    }

    const entries = await prisma.entry.findMany({
      where: entryFilter,
      include: { form: { select: { id: true, title: true, fields: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (entries.length === 0) {
      res.status(400);
      throw new Error("No entries to export");
    }

    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "DataVault";
    workbook.created = new Date();

    // Group entries by form
    const entriesByForm = {};
    entries.forEach((entry) => {
      const fId = entry.form.id;
      if (!entriesByForm[fId]) {
        entriesByForm[fId] = { form: entry.form, entries: [] };
      }
      entriesByForm[fId].entries.push(entry);
    });

    for (const [, { form, entries: formEntries }] of Object.entries(entriesByForm)) {
      const sheetName = form.title.replace(/[\\\/\?\*\[\]]/g, "_").slice(0, 31);
      const sheet = workbook.addWorksheet(sheetName);

      const formFields = Array.isArray(form.fields) ? form.fields : [];

      // Header row
      const headers = ["#", ...formFields.map((f) => f.label || f.name), "Submitted At"];
      sheet.addRow(headers);

      // Style header
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      headerRow.height = 20;
      sheet.columns = [
        { width: 6 },
        ...formFields.map(() => ({ width: 20 })),
        { width: 22 },
      ];

      // Data rows
      formEntries.forEach((entry, index) => {
        const row = [
          index + 1,
          ...formFields.map((f) => {
            const val = entry.data[f.name] || entry.data[f.id] || "";
            return String(val);
          }),
          new Date(entry.createdAt).toLocaleString("en-IN"),
        ];
        sheet.addRow(row);
      });

      // Alternate row shading
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && rowNumber % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1F5F9" },
          };
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = targetForm
      ? `${targetForm.title.replace(/[^a-z0-9]/gi, "_")}_entries.xlsx`
      : `my_entries_${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  })
);

// @route   GET /api/dashboard/analytics
// @desc    Admin analytics — revenue, plan sales, net worth
// @access  Private (Admin)
router.get(
  "/analytics",
  asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") {
      res.status(403);
      throw new Error("Admin access required");
    }

    // All plans with price info
    const plans = await prisma.plan.findMany({
      orderBy: { displayOrder: "asc" },
    });

    // Users with plan info
    const usersWithPlans = await prisma.user.findMany({
      where: { planId: { not: null } },
      select: {
        id: true,
        planId: true,
        planStatus: true,
        planExpiresAt: true,
        createdAt: true,
        plan: { select: { id: true, name: true, price: true, period: true } },
      },
    });

    // Plan-wise breakdown
    const planBreakdown = plans.map((plan) => {
      const planUsers = usersWithPlans.filter((u) => u.planId === plan.id);
      const activeUsers = planUsers.filter((u) => u.planStatus === "ACTIVE");
      const revenue = planUsers.length * plan.price;
      return {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        period: plan.period,
        totalUsers: planUsers.length,
        activeUsers: activeUsers.length,
        revenue,
      };
    });

    // Totals
    const totalRevenue = planBreakdown.reduce((sum, p) => sum + p.revenue, 0);
    const totalActiveSubscriptions = usersWithPlans.filter((u) => u.planStatus === "ACTIVE").length;
    const totalExpiredSubscriptions = usersWithPlans.filter((u) => u.planStatus === "EXPIRED").length;
    const totalUsersWithPlan = usersWithPlans.length;
    const avgPlanValue = totalUsersWithPlan > 0 ? Math.round(totalRevenue / totalUsersWithPlan) : 0;

    // Upgrade requests from settings
    let upgradeRequests = [];
    try {
      const setting = await prisma.setting.findUnique({ where: { key: "UPGRADE_REQUESTS" } });
      if (setting && setting.value) upgradeRequests = JSON.parse(setting.value);
    } catch { upgradeRequests = []; }

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalActiveSubscriptions,
        totalExpiredSubscriptions,
        totalUsersWithPlan,
        avgPlanValue,
        planBreakdown: planBreakdown.filter((p) => p.totalUsers > 0),
        allPlanBreakdown: planBreakdown,
        upgradeRequests,
      },
    });
  })
);

// @route   GET /api/dashboard/upgrade-requests
// @desc    Get all pending upgrade requests (Admin only)
// @access  Private (Admin)
router.get(
  "/upgrade-requests",
  asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") {
      res.status(403);
      throw new Error("Admin access required");
    }
    let upgradeRequests = [];
    try {
      const setting = await prisma.setting.findUnique({ where: { key: "UPGRADE_REQUESTS" } });
      if (setting && setting.value) upgradeRequests = JSON.parse(setting.value);
    } catch { upgradeRequests = []; }

    res.json({ success: true, data: upgradeRequests });
  })
);

// @route   DELETE /api/dashboard/upgrade-requests/:id
// @desc    Dismiss/delete an upgrade request (Admin)
// @access  Private (Admin)
router.delete(
  "/upgrade-requests/:id",
  asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") {
      res.status(403);
      throw new Error("Admin access required");
    }
    const reqId = req.params.id;
    let upgradeRequests = [];
    try {
      const setting = await prisma.setting.findUnique({ where: { key: "UPGRADE_REQUESTS" } });
      if (setting && setting.value) upgradeRequests = JSON.parse(setting.value);
    } catch { upgradeRequests = []; }

    upgradeRequests = upgradeRequests.filter((r) => r.id !== reqId);

    await prisma.setting.upsert({
      where: { key: "UPGRADE_REQUESTS" },
      update: { value: JSON.stringify(upgradeRequests) },
      create: { key: "UPGRADE_REQUESTS", value: JSON.stringify(upgradeRequests) },
    });

    res.json({ success: true, message: "Upgrade request dismissed" });
  })
);

// @route   POST /api/dashboard/upgrade-request
// @desc    User submits a plan upgrade request
// @access  Private (User)
router.post(
  "/upgrade-request",
  asyncHandler(async (req, res) => {
    const { desiredPlanId, message } = req.body;
    const userId = req.user.id;

    if (!desiredPlanId) {
      res.status(400);
      throw new Error("Please select a plan to upgrade to");
    }

    const plan = await prisma.plan.findUnique({ where: { id: parseInt(desiredPlanId) } });
    if (!plan) {
      res.status(404);
      throw new Error("Selected plan not found");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    // Load existing requests
    let upgradeRequests = [];
    try {
      const setting = await prisma.setting.findUnique({ where: { key: "UPGRADE_REQUESTS" } });
      if (setting && setting.value) upgradeRequests = JSON.parse(setting.value);
    } catch { upgradeRequests = []; }

    // Check if user already has a pending request
    const existing = upgradeRequests.find((r) => r.userId === userId && r.status === "PENDING");
    if (existing) {
      res.status(400);
      throw new Error("You already have a pending upgrade request. Please wait for admin review.");
    }

    const newRequest = {
      id: `upg_${Date.now()}_${userId}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      currentPlanId: user.planId,
      currentPlanName: user.plan?.name || "None",
      desiredPlanId: parseInt(desiredPlanId),
      desiredPlanName: plan.name,
      desiredPlanPrice: plan.price,
      message: message || "",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    upgradeRequests.unshift(newRequest);

    await prisma.setting.upsert({
      where: { key: "UPGRADE_REQUESTS" },
      update: { value: JSON.stringify(upgradeRequests) },
      create: { key: "UPGRADE_REQUESTS", value: JSON.stringify(upgradeRequests) },
    });

    res.json({
      success: true,
      message: `Upgrade request for "${plan.name}" submitted successfully! Admin will review shortly.`,
    });
  })
);

module.exports = router;

