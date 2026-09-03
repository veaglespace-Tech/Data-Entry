const express = require("express");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminAuth");

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require auth + admin role
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/users
// @desc    Get all users with form/entry counts
// @access  Admin
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { search = "" } = req.query;

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }

    const users = await prisma.user.findMany({
      where,
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
        _count: {
          select: {
            forms: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get entry counts for each user
    const usersWithEntries = await Promise.all(
      users.map(async (user) => {
        const entryCount = await prisma.entry.count({
          where: {
            form: { userId: user.id },
          },
        });
        return {
          ...user,
          forms: user._count.forms,
          entries: entryCount,
          _count: undefined,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithEntries,
    });
  })
);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user and all their data
// @access  Admin
router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    // Prevent self-deletion
    if (userId === req.user.id) {
      res.status(400);
      throw new Error("You cannot delete your own account");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Cascade delete: entries -> forms -> user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      message: `User "${user.name}" and all their data deleted successfully`,
    });
  })
);

// @route   GET /api/admin/users/:id
// @desc    Get detailed user info including plan and transactions
// @access  Admin
router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { forms: true }
        }
      },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Get total entries
    const entryCount = await prisma.entry.count({
      where: { form: { userId } }
    });

    // Determine plan start date (latest successful transaction)
    const latestSuccessTxn = user.transactions.find((t) => t.status === "SUCCESS" && t.planId === user.planId);
    const planStartedAt = latestSuccessTxn ? latestSuccessTxn.createdAt : user.createdAt;

    res.json({
      success: true,
      data: {
        ...user,
        formsCount: user._count.forms,
        entriesCount: entryCount,
        planStartedAt,
        _count: undefined,
      },
    });
  })
);

// @route   PUT /api/admin/users/:id/role
// @desc    Change a user's role
// @access  Admin
router.put(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    // Prevent self role change
    if (userId === req.user.id) {
      res.status(400);
      throw new Error("You cannot change your own role");
    }

    if (!role || !["USER", "ADMIN"].includes(role)) {
      res.status(400);
      throw new Error("Role must be USER or ADMIN");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: `User "${updatedUser.name}" role changed to ${role}`,
    });
  })
);
// @route   PUT /api/admin/users/:id
// @desc    Update user details and subscription plan
// @access  Admin
router.put(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, email, mobile, planId, planStatus, planExpiresAt } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Prepare update data
    const updateData = { name, email, mobile };
    
    let isPlanChanged = false;

    if (planId !== undefined) {
      const newPlanId = planId ? parseInt(planId) : null;
      if (user.planId !== newPlanId) {
        isPlanChanged = true;
      }
      updateData.planId = newPlanId;
    }
    if (planStatus !== undefined) {
      updateData.planStatus = planStatus;
    }
    if (planExpiresAt !== undefined) {
      updateData.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
    }

    // If email is changed, ensure it's not taken by another user
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        res.status(400);
        throw new Error("Email already in use");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        planId: true,
        planStatus: true,
        planExpiresAt: true,
      },
    });

    // If admin manually assigned a new plan, create a 0-rupee audit transaction
    if (isPlanChanged && updateData.planId) {
      await prisma.transaction.create({
        data: {
          txnid: `ADMIN_UPGRADE_${Date.now()}_${userId}`,
          userId: userId,
          planId: updateData.planId,
          amount: 0,
          status: "SUCCESS",
        }
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: "User details updated successfully",
    });
  })
);

// ==========================================
// ADMIN FORMS
// ==========================================

// @route   GET /api/admin/forms
// @desc    Get all forms in the system
// @access  Admin
router.get(
  "/forms",
  asyncHandler(async (req, res) => {
    const { search = "" } = req.query;

    let where = {};
    if (search) {
      where = {
        OR: [
          { title: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      };
    }

    const forms = await prisma.form.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: forms });
  })
);

// @route   DELETE /api/admin/forms/:id
// @desc    Delete any form in the system
// @access  Admin
router.delete(
  "/forms/:id",
  asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.id);

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    await prisma.form.delete({ where: { id: formId } });

    res.json({ success: true, message: "Form deleted successfully by Admin" });
  })
);

// ==========================================
// ADMIN TRANSACTIONS
// ==========================================

// @route   GET /api/admin/transactions
// @desc    Get all transactions in the system
// @access  Admin
router.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        plan: {
          select: { name: true, price: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, data: transactions });
  })
);

// ==========================================
// ADMIN PLANS
// ==========================================

// @route   GET /api/admin/plans
// @desc    Get all plans (Admin view)
// @access  Admin
router.get(
  "/plans",
  asyncHandler(async (req, res) => {
    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { price: 'asc' }
      ]
    });
    res.json({ success: true, data: plans });
  })
);

// @route   POST /api/admin/plans
// @desc    Create a new plan
// @access  Admin
router.post(
  "/plans",
  asyncHandler(async (req, res) => {
    const { name, description, price, period, features, formLimit, entryLimit, isActive, displayOrder } = req.body;

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price,
        period,
        features,
        formLimit,
        entryLimit,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder !== undefined ? displayOrder : 0
      }
    });

    res.status(201).json({ success: true, data: plan });
  })
);

// @route   PUT /api/admin/plans/:id
// @desc    Update a plan
// @access  Admin
router.put(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const planId = parseInt(req.params.id);
    const { name, description, price, period, features, formLimit, entryLimit, isActive, displayOrder } = req.body;

    const planExists = await prisma.plan.findUnique({ where: { id: planId } });
    if (!planExists) {
      res.status(404);
      throw new Error("Plan not found");
    }

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name,
        description,
        price,
        period,
        features,
        formLimit,
        entryLimit,
        isActive,
        displayOrder
      }
    });

    res.json({ success: true, data: plan });
  })
);

// @route   DELETE /api/admin/plans/:id
// @desc    Delete a plan
// @access  Admin
router.delete(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const planId = parseInt(req.params.id);

    const planExists = await prisma.plan.findUnique({ 
      where: { id: planId },
      include: { _count: { select: { users: true } } }
    });
    
    if (!planExists) {
      res.status(404);
      throw new Error("Plan not found");
    }

    // Don't delete if users are subscribed to it
    if (planExists._count.users > 0) {
      res.status(400);
      throw new Error("Cannot delete plan. Users are currently subscribed to it.");
    }

    await prisma.plan.delete({ where: { id: planId } });
    res.json({ success: true, message: "Plan deleted successfully" });
  })
);

// ==========================================
// ADMIN SETTINGS
// ==========================================

// @route   PUT /api/admin/settings/gst
// @desc    Update global GST percentage
// @access  Admin
router.put(
  "/settings/gst",
  asyncHandler(async (req, res) => {
    const { gst } = req.body;

    if (gst === undefined || isNaN(parseFloat(gst))) {
      res.status(400);
      throw new Error("Please provide a valid GST percentage");
    }

    const updatedSetting = await prisma.setting.upsert({
      where: { key: "GST_PERCENTAGE" },
      update: { value: String(gst) },
      create: { key: "GST_PERCENTAGE", value: String(gst) },
    });

    res.json({ success: true, data: { gst: parseFloat(updatedSetting.value) }, message: "GST updated successfully" });
  })
);

// @route   GET /api/admin/settings/gst
// @desc    Get global GST percentage
// @access  Admin
router.get(
  "/settings/gst",
  asyncHandler(async (req, res) => {
    const gstSetting = await prisma.setting.findUnique({
      where: { key: "GST_PERCENTAGE" },
    });
    
    const gstValue = gstSetting ? parseFloat(gstSetting.value) : 18;
    res.json({ success: true, data: { gst: gstValue } });
  })
);

// @route   GET /api/admin/settings/announcement
// @desc    Get global announcement banner
// @access  Admin
router.get(
  "/settings/announcement",
  asyncHandler(async (req, res) => {
    const annSetting = await prisma.setting.findUnique({
      where: { key: "SYSTEM_ANNOUNCEMENT" },
    });
    
    let announcement = { message: "", isActive: false };
    if (annSetting && annSetting.value) {
      try {
        announcement = JSON.parse(annSetting.value);
      } catch (e) {
        announcement = { message: annSetting.value, isActive: true };
      }
    }
    res.json({ success: true, data: announcement });
  })
);

// @route   PUT /api/admin/settings/announcement
// @desc    Update global announcement banner
// @access  Admin
router.put(
  "/settings/announcement",
  asyncHandler(async (req, res) => {
    const { message = "", isActive = false } = req.body;

    const payload = JSON.stringify({ message, isActive: Boolean(isActive) });

    const updatedSetting = await prisma.setting.upsert({
      where: { key: "SYSTEM_ANNOUNCEMENT" },
      update: { value: payload },
      create: { key: "SYSTEM_ANNOUNCEMENT", value: payload },
    });

    res.json({
      success: true,
      data: JSON.parse(updatedSetting.value),
      message: "Announcement updated successfully",
    });
  })
);

module.exports = router;
