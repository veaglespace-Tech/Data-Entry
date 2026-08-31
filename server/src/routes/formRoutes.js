const express = require("express");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const { protect } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// All form routes are protected
router.use(protect);

// Helper: Build where clause based on role
const getFormWhere = (req, formId) => {
  const isAdmin = req.user.role === "ADMIN";
  const where = { id: formId };
  if (!isAdmin) {
    where.userId = req.user.id;
  }
  return where;
};

// @route   GET /api/forms
// @desc    Get all forms (admin: all users, user: own only)
// @access  Private
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === "ADMIN";

    const forms = await prisma.form.findMany({
      where: isAdmin ? {} : { userId: req.user.id },
      include: {
        _count: {
          select: { entries: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: forms,
    });
  })
);

// @route   POST /api/forms
// @desc    Create a new form
// @access  Private
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, description, fields } = req.body;

    if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
      res.status(400);
      throw new Error("Please provide a title and at least one field");
    }

    // Validate fields structure
    for (const field of fields) {
      if (!field.name || !field.label || !field.type) {
        res.status(400);
        throw new Error("Each field must have name, label, and type");
      }
    }

    const form = await prisma.form.create({
      data: {
        title,
        description: description || null,
        fields,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: form,
    });
  })
);

// @route   GET /api/forms/:id
// @desc    Get a single form by ID (admin: any, user: own)
// @access  Private
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const form = await prisma.form.findFirst({
      where: getFormWhere(req, parseInt(req.params.id)),
      include: {
        _count: {
          select: { entries: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    res.json({
      success: true,
      data: form,
    });
  })
);

// @route   PUT /api/forms/:id
// @desc    Update a form (admin: any, user: own)
// @access  Private
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { title, description, fields } = req.body;

    // Check if form exists (admin can access any)
    const existingForm = await prisma.form.findFirst({
      where: getFormWhere(req, parseInt(req.params.id)),
    });

    if (!existingForm) {
      res.status(404);
      throw new Error("Form not found");
    }

    const form = await prisma.form.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title: title || existingForm.title,
        description: description !== undefined ? description : existingForm.description,
        fields: fields || existingForm.fields,
      },
    });

    res.json({
      success: true,
      data: form,
    });
  })
);

// @route   DELETE /api/forms/:id
// @desc    Delete a form and all entries (admin: any, user: own)
// @access  Private
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const form = await prisma.form.findFirst({
      where: getFormWhere(req, parseInt(req.params.id)),
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    await prisma.form.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: "Form deleted successfully",
    });
  })
);

// ============================================
// ENTRY ROUTES (nested under forms)
// ============================================

// @route   GET /api/forms/:formId/entries
// @desc    Get all entries for a form with search, filter, pagination
// @access  Private
router.get(
  "/:formId/entries",
  asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.formId);
    const { page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" } = req.query;

    // Verify form access (admin: any, user: own)
    const form = await prisma.form.findFirst({
      where: getFormWhere(req, formId),
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    let where = { formId };

    // Search in JSON data
    if (search) {
      where.data = {
        string_contains: search,
      };
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.entry.count({ where }),
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

// @route   POST /api/forms/:formId/entries
// @desc    Create a new entry for a form
// @access  Private
router.post(
  "/:formId/entries",
  asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.formId);
    const { data } = req.body;

    // Verify form access
    const form = await prisma.form.findFirst({
      where: getFormWhere(req, formId),
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    if (!data || typeof data !== "object") {
      res.status(400);
      throw new Error("Please provide entry data");
    }

    // Validate required fields
    const formFields = form.fields;
    for (const field of formFields) {
      if (field.required && (!data[field.name] || data[field.name] === "")) {
        res.status(400);
        throw new Error(`Field "${field.label}" is required`);
      }
    }

    const entry = await prisma.entry.create({
      data: {
        data,
        formId,
      },
    });

    res.status(201).json({
      success: true,
      data: entry,
    });
  })
);

// @route   GET /api/forms/:formId/entries/:id
// @desc    Get a single entry
// @access  Private
router.get(
  "/:formId/entries/:id",
  asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.formId);
    const entryId = parseInt(req.params.id);

    const form = await prisma.form.findFirst({
      where: getFormWhere(req, formId),
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    const entry = await prisma.entry.findFirst({
      where: { id: entryId, formId },
    });

    if (!entry) {
      res.status(404);
      throw new Error("Entry not found");
    }

    res.json({
      success: true,
      data: entry,
    });
  })
);

// @route   PUT /api/forms/:formId/entries/:id
// @desc    Update an entry
// @access  Private
router.put(
  "/:formId/entries/:id",
  asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.formId);
    const entryId = parseInt(req.params.id);
    const { data } = req.body;

    const form = await prisma.form.findFirst({
      where: getFormWhere(req, formId),
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    const existingEntry = await prisma.entry.findFirst({
      where: { id: entryId, formId },
    });

    if (!existingEntry) {
      res.status(404);
      throw new Error("Entry not found");
    }

    const entry = await prisma.entry.update({
      where: { id: entryId },
      data: { data },
    });

    res.json({
      success: true,
      data: entry,
    });
  })
);

// @route   DELETE /api/forms/:formId/entries/:id
// @desc    Delete an entry
// @access  Private
router.delete(
  "/:formId/entries/:id",
  asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.formId);
    const entryId = parseInt(req.params.id);

    const form = await prisma.form.findFirst({
      where: getFormWhere(req, formId),
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    const entry = await prisma.entry.findFirst({
      where: { id: entryId, formId },
    });

    if (!entry) {
      res.status(404);
      throw new Error("Entry not found");
    }

    await prisma.entry.delete({
      where: { id: entryId },
    });

    res.json({
      success: true,
      message: "Entry deleted successfully",
    });
  })
);

// @route   GET /api/forms/:formId/entries-export
// @desc    Export entries to CSV
// @access  Private
router.get(
  "/:formId/entries-export",
  asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.formId);

    const form = await prisma.form.findFirst({
      where: getFormWhere(req, formId),
    });

    if (!form) {
      res.status(404);
      throw new Error("Form not found");
    }

    const entries = await prisma.entry.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" },
    });

    if (entries.length === 0) {
      res.status(400);
      throw new Error("No entries to export");
    }

    // Build CSV from form fields and entry data
    const formFields = form.fields;
    const csvRows = [];

    // Header row
    const headers = ["ID", ...formFields.map((f) => f.label), "Created At"];
    csvRows.push(headers.join(","));

    // Data rows
    for (const entry of entries) {
      const row = [
        entry.id,
        ...formFields.map((f) => {
          const value = entry.data[f.name] || "";
          // Escape commas and quotes in CSV
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }),
        new Date(entry.createdAt).toLocaleString(),
      ];
      csvRows.push(row.join(","));
    }

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${form.title.replace(/[^a-z0-9]/gi, "_")}_entries.csv"`
    );
    res.send(csv);
  })
);

module.exports = router;
