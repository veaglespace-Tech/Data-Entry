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

module.exports = router;
