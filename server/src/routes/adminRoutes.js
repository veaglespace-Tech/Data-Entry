const express = require("express");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminAuth");

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require auth + admin role
router.use(protect);
router.use(adminOnly);

// ==========================================
// REGISTRATION REQUESTS
// ==========================================

// @route   GET /api/admin/registration-requests
// @desc    Get all registration requests
// @access  Admin
router.get(
  "/registration-requests",
  asyncHandler(async (req, res) => {
    const { status, search = "" } = req.query;

    let where = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const requests = await prisma.registrationRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: requests });
  })
);

// @route   POST /api/admin/registration-requests/:id/approve
// @desc    Approve a registration request and create user account
// @access  Admin
router.post(
  "/registration-requests/:id/approve",
  asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id);
    const { planId, planExpiresAt, adminNote, templateIds } = req.body;

    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      res.status(404);
      throw new Error("Registration request not found");
    }

    if (request.status !== "PENDING") {
      res.status(400);
      throw new Error(`Request is already ${request.status.toLowerCase()}`);
    }

    // Check if user already exists (edge case)
    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (existingUser) {
      // Just mark request approved
      await prisma.registrationRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", adminNote },
      });
      res.status(400);
      throw new Error("A user with this email already exists");
    }

    // Validate plan if provided
    let resolvedPlanId = null;
    if (planId) {
      const plan = await prisma.plan.findUnique({ where: { id: parseInt(planId) } });
      if (!plan) {
        res.status(400);
        throw new Error("Selected plan not found");
      }
      resolvedPlanId = plan.id;
    }

    // Create user from the registration request
    const user = await prisma.user.create({
      data: {
        name: request.name,
        email: request.email,
        password: request.password, // already hashed
        mobile: request.mobile,
        address: request.address,
        country: request.country,
        state: request.state,
        gender: request.gender,
        role: "USER",
        planId: resolvedPlanId,
        planStatus: resolvedPlanId ? "ACTIVE" : "INACTIVE",
        planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
        status: "ACTIVE",
      },
    });

    // Mark request as approved
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", adminNote: adminNote || null },
    });

    // Assign templates if provided
    if (templateIds && Array.isArray(templateIds) && templateIds.length > 0) {
      await prisma.userFieldTemplate.createMany({
        data: templateIds.map(tid => ({
          userId: user.id,
          templateId: parseInt(tid)
        }))
      });
    }

    res.json({
      success: true,
      message: `Registration request approved. Account created for "${user.name}"`,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
    });
  })
);

// @route   POST /api/admin/registration-requests/:id/reject
// @desc    Reject a registration request
// @access  Admin
router.post(
  "/registration-requests/:id/reject",
  asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id);
    const { adminNote } = req.body;

    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      res.status(404);
      throw new Error("Registration request not found");
    }

    if (request.status !== "PENDING") {
      res.status(400);
      throw new Error(`Request is already ${request.status.toLowerCase()}`);
    }

    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", adminNote: adminNote || null },
    });

    res.json({
      success: true,
      message: `Registration request for "${request.name}" rejected`,
    });
  })
);

// @route   DELETE /api/admin/registration-requests/:id
// @desc    Delete a registration request
// @access  Admin
router.delete(
  "/registration-requests/:id",
  asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.id);

    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      res.status(404);
      throw new Error("Registration request not found");
    }

    await prisma.registrationRequest.delete({ where: { id: requestId } });

    res.json({ success: true, message: "Registration request deleted" });
  })
);

// ==========================================
// ADMIN FIELD TEMPLATES
// ==========================================

// @route   GET /api/admin/field-templates
// @desc    Get all field templates with assignment counts
// @access  Admin
router.get(
  "/field-templates",
  asyncHandler(async (req, res) => {
    const templates = await prisma.adminFieldTemplate.findMany({
      include: {
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: templates });
  })
);

// @route   GET /api/admin/field-templates/:id
// @desc    Get single field template with assigned users
// @access  Admin
router.get(
  "/field-templates/:id",
  asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.id);

    const template = await prisma.adminFieldTemplate.findUnique({
      where: { id: templateId },
      include: {
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!template) {
      res.status(404);
      throw new Error("Field template not found");
    }

    res.json({ success: true, data: template });
  })
);

// @route   POST /api/admin/field-templates
// @desc    Create a new field template (up to 12 fields)
// @access  Admin
router.post(
  "/field-templates",
  asyncHandler(async (req, res) => {
    const { title, description, fields } = req.body;

    if (!title) {
      res.status(400);
      throw new Error("Title is required");
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      res.status(400);
      throw new Error("At least one field is required");
    }

    if (fields.length > 12) {
      res.status(400);
      throw new Error("Maximum 12 fields allowed per template");
    }

    // Validate each field
    for (const field of fields) {
      if (!field.label || !field.label.trim()) {
        res.status(400);
        throw new Error("Each field must have a label");
      }
    }

    // Normalize fields
    const normalizedFields = fields.map((f, index) => ({
      id: f.id || `field_${index + 1}`,
      label: f.label.trim(),
      placeholder: f.placeholder || "",
      type: f.type || "text",
      required: f.required || false,
    }));

    const template = await prisma.adminFieldTemplate.create({
      data: {
        title: title.trim(),
        description: description || null,
        fields: normalizedFields,
      },
    });

    res.status(201).json({ success: true, data: template });
  })
);

// @route   PUT /api/admin/field-templates/:id
// @desc    Update a field template
// @access  Admin
router.put(
  "/field-templates/:id",
  asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.id);
    const { title, description, fields } = req.body;

    const existing = await prisma.adminFieldTemplate.findUnique({ where: { id: templateId } });
    if (!existing) {
      res.status(404);
      throw new Error("Field template not found");
    }

    if (fields && fields.length > 12) {
      res.status(400);
      throw new Error("Maximum 12 fields allowed per template");
    }

    let normalizedFields = existing.fields;
    if (fields && Array.isArray(fields)) {
      normalizedFields = fields.map((f, index) => ({
        id: f.id || `field_${index + 1}`,
        label: f.label.trim(),
        placeholder: f.placeholder || "",
        type: f.type || "text",
        required: f.required || false,
      }));
    }

    const template = await prisma.adminFieldTemplate.update({
      where: { id: templateId },
      data: {
        title: title ? title.trim() : existing.title,
        description: description !== undefined ? description : existing.description,
        fields: normalizedFields,
      },
    });

    res.json({ success: true, data: template });
  })
);

// @route   DELETE /api/admin/field-templates/:id
// @desc    Delete a field template
// @access  Admin
router.delete(
  "/field-templates/:id",
  asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.id);

    const existing = await prisma.adminFieldTemplate.findUnique({
      where: { id: templateId },
      include: { _count: { select: { assignments: true } } },
    });

    if (!existing) {
      res.status(404);
      throw new Error("Field template not found");
    }

    // Delete all assignments first, then template
    await prisma.userFieldTemplate.deleteMany({ where: { templateId } });
    await prisma.adminFieldTemplate.delete({ where: { id: templateId } });

    res.json({ success: true, message: "Field template deleted successfully" });
  })
);

// @route   POST /api/admin/users/:id/assign-template
// @desc    Assign a field template to a user
// @access  Admin
router.post(
  "/users/:id/assign-template",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { templateId } = req.body;

    if (!templateId) {
      res.status(400);
      throw new Error("templateId is required");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const template = await prisma.adminFieldTemplate.findUnique({ where: { id: parseInt(templateId) } });
    if (!template) {
      res.status(404);
      throw new Error("Field template not found");
    }

    // Upsert (create if not exists)
    const assignment = await prisma.userFieldTemplate.upsert({
      where: {
        userId_templateId: {
          userId,
          templateId: parseInt(templateId),
        },
      },
      update: { assignedAt: new Date() },
      create: {
        userId,
        templateId: parseInt(templateId),
      },
    });

    res.json({
      success: true,
      message: `Template "${template.title}" assigned to "${user.name}"`,
      data: assignment,
    });
  })
);

// @route   DELETE /api/admin/users/:id/unassign-template/:templateId
// @desc    Remove a field template assignment from a user
// @access  Admin
router.delete(
  "/users/:id/unassign-template/:templateId",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const templateId = parseInt(req.params.templateId);

    const assignment = await prisma.userFieldTemplate.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });

    if (!assignment) {
      res.status(404);
      throw new Error("Assignment not found");
    }

    await prisma.userFieldTemplate.delete({
      where: { userId_templateId: { userId, templateId } },
    });

    res.json({ success: true, message: "Template unassigned successfully" });
  })
);

// @route   GET /api/admin/users/:id/templates
// @desc    Get all templates assigned to a user
// @access  Admin
router.get(
  "/users/:id/templates",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    const assignments = await prisma.userFieldTemplate.findMany({
      where: { userId },
      include: {
        template: true,
      },
      orderBy: { assignedAt: "desc" },
    });

    res.json({ success: true, data: assignments });
  })
);

// ==========================================
// ADMIN USERS
// ==========================================

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
        status: true,
        createdAt: true,
        plan: { select: { name: true } },
        _count: {
          select: {
            forms: true,
            fieldTemplateAssignments: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    // Get entry counts for each user
    const usersWithEntries = await Promise.all(
      users.map(async (user) => {
        const entryCount = await prisma.entry.count({
          where: { form: { userId: user.id } },
        });
        return {
          ...user,
          forms: user._count.forms,
          entries: entryCount,
          assignedTemplates: user._count.fieldTemplateAssignments,
          _count: undefined,
        };
      })
    );

    res.json({ success: true, data: usersWithEntries });
  })
);

// @route   GET /api/admin/users/:id
// @desc    Get detailed user info including plan and templates
// @access  Admin
router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
        fieldTemplateAssignments: {
          include: { template: true },
          orderBy: { assignedAt: "desc" },
        },
        _count: { select: { forms: true } },
      },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const entryCount = await prisma.entry.count({ where: { form: { userId } } });

    res.json({
      success: true,
      data: {
        ...user,
        formsCount: user._count.forms,
        entriesCount: entryCount,
        _count: undefined,
      },
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

    if (userId === req.user.id) {
      res.status(400);
      throw new Error("You cannot delete your own account");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({
      success: true,
      message: `User "${user.name}" and all their data deleted successfully`,
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

    if (userId === req.user.id) {
      res.status(400);
      throw new Error("You cannot change your own role");
    }

    if (!role || !["USER", "ADMIN"].includes(role)) {
      res.status(400);
      throw new Error("Role must be USER or ADMIN");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
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
    const { name, email, mobile, planId, planStatus, planExpiresAt, status } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (status !== undefined) updateData.status = status;

    if (planId !== undefined) {
      updateData.planId = planId ? parseInt(planId) : null;
    }
    if (planStatus !== undefined) {
      updateData.planStatus = planStatus;
    }
    if (planExpiresAt !== undefined) {
      updateData.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
    }

    // If email is changed, ensure it's not taken
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        res.status(400);
        throw new Error("Email already in use");
      }
      updateData.email = email;
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
        status: true,
      },
    });

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
        user: { select: { name: true, email: true } },
        _count: { select: { entries: true } },
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
        _count: { select: { users: true } },
      },
      orderBy: [{ displayOrder: "asc" }, { price: "asc" }],
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
        price: parseInt(price) || 0,
        period: period || "monthly",
        features: features || [],
        formLimit: parseInt(formLimit) || -1,
        entryLimit: parseInt(entryLimit) || -1,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 0,
      },
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
        price: price !== undefined ? parseInt(price) : undefined,
        period,
        features,
        formLimit: formLimit !== undefined ? parseInt(formLimit) : undefined,
        entryLimit: entryLimit !== undefined ? parseInt(entryLimit) : undefined,
        isActive,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
      },
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
      include: { _count: { select: { users: true } } },
    });

    if (!planExists) {
      res.status(404);
      throw new Error("Plan not found");
    }

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
