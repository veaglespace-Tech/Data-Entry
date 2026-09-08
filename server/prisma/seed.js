const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// 1. PLANS
// ─────────────────────────────────────────
const plans = [
  {
    name: "Plan 1",
    description: "JOB-IMAGE TO EXCEL",
    price: 4050,
    period: "7 days",
    formLimit: -1,
    entryLimit: 2500,
    displayOrder: 1,
    features: ["Mistake Allow: 200", "Pay-out (In INR): 15,700"],
  },
  {
    name: "Plan 2",
    description: "JOB-IMAGE TO EXCEL",
    price: 5500,
    period: "9 days",
    formLimit: -1,
    entryLimit: 2500,
    displayOrder: 2,
    features: ["Mistake Allow: 250", "Pay-out (In INR): 17,000"],
  },
  {
    name: "Plan 3",
    description: "JOB-IMAGE TO EXCEL",
    price: 6500,
    period: "7 days",
    formLimit: -1,
    entryLimit: 3500,
    displayOrder: 3,
    features: ["Mistake Allow: 200", "Pay-out (In INR): 22,000"],
  },
  {
    name: "Plan 4",
    description: "JOB-IMAGE TO EXCEL",
    price: 12250,
    period: "9 days",
    formLimit: -1,
    entryLimit: 3500,
    displayOrder: 4,
    features: ["Mistake Allow: 250", "Pay-out (In INR): 26,000"],
  },
  {
    name: "Plan 5",
    description: "JOB-IMAGE TO EXCEL",
    price: 16800,
    period: "10 days",
    formLimit: -1,
    entryLimit: 5000,
    displayOrder: 5,
    features: ["Mistake Allow: 250", "Pay-out (In INR): 38,000"],
  },
  {
    name: "Plan 6",
    description: "JOB-IMAGE TO EXCEL",
    price: 20800,
    period: "10 days",
    formLimit: -1,
    entryLimit: 7000,
    displayOrder: 6,
    features: ["Mistake Allow: 250", "Pay-out (In INR): 51,500"],
  },
  {
    name: "Plan 7",
    description: "JOB-IMAGE TO EXCEL",
    price: 23250,
    period: "12 days",
    formLimit: -1,
    entryLimit: 6000,
    displayOrder: 7,
    features: ["Mistake Allow: 500", "Pay-out (In INR): 55,000"],
  },
  {
    name: "Plan 8",
    description: "JOB-IMAGE TO EXCEL",
    price: 30000,
    period: "15 days",
    formLimit: -1,
    entryLimit: 10000,
    displayOrder: 8,
    features: ["Mistake Allow: 750", "Pay-out (In INR): 85,000"],
  },
  {
    name: "Plan 9",
    description: "JOB-IMAGE TO EXCEL",
    price: 35500,
    period: "20 days",
    formLimit: -1,
    entryLimit: 15000,
    displayOrder: 9,
    features: ["Mistake Allow: 700", "Pay-out (In INR): 1,10,000"],
  },
  {
    name: "Plan 10",
    description: "JOB-IMAGE TO EXCEL",
    price: 50000,
    period: "20 days",
    formLimit: -1,
    entryLimit: 18000,
    displayOrder: 10,
    features: ["Mistake Allow: 1000", "Pay-out (In INR): 1,60,000"],
  },
  {
    name: "Plan 11",
    description: "JOB-IMAGE TO EXCEL",
    price: 65000,
    period: "20 days",
    formLimit: -1,
    entryLimit: 30000,
    displayOrder: 11,
    features: ["Mistake Allow: 1000", "Pay-out (In INR): 2,90,000"],
  },
  {
    name: "Plan 12",
    description: "JOB-IMAGE TO EXCEL",
    price: 80000,
    period: "20 days",
    formLimit: -1,
    entryLimit: 30000,
    displayOrder: 12,
    features: ["Mistake Allow: 1200", "Pay-out (In INR): 3,10,000"],
  },
];

// ─────────────────────────────────────────
// 2. FIELD TEMPLATES
// ─────────────────────────────────────────
const fieldTemplates = [
  {
    title: "Basic Data Entry",
    description: "Standard image-to-excel data entry fields",
    fields: [
      { id: "field_1", label: "Serial No", placeholder: "Enter serial number", type: "number", required: true },
      { id: "field_2", label: "Name", placeholder: "Enter full name", type: "text", required: true },
      { id: "field_3", label: "Date", placeholder: "DD/MM/YYYY", type: "date", required: true },
      { id: "field_4", label: "Amount", placeholder: "Enter amount", type: "number", required: true },
      { id: "field_5", label: "Remarks", placeholder: "Any additional notes", type: "textarea", required: false },
    ],
  },
  {
    title: "Employee Record Entry",
    description: "Employee details data entry template",
    fields: [
      { id: "field_1", label: "Employee ID", placeholder: "e.g. EMP001", type: "text", required: true },
      { id: "field_2", label: "Full Name", placeholder: "Enter full name", type: "text", required: true },
      { id: "field_3", label: "Department", placeholder: "e.g. Sales, IT, HR", type: "text", required: true },
      { id: "field_4", label: "Designation", placeholder: "Enter designation", type: "text", required: true },
      { id: "field_5", label: "Date of Joining", placeholder: "DD/MM/YYYY", type: "date", required: true },
      { id: "field_6", label: "Salary", placeholder: "Monthly salary in INR", type: "number", required: false },
      { id: "field_7", label: "Contact Number", placeholder: "10-digit mobile number", type: "text", required: false },
    ],
  },
  {
    title: "Invoice / Bill Entry",
    description: "For entering invoice and billing records from images",
    fields: [
      { id: "field_1", label: "Invoice No", placeholder: "e.g. INV-2024-001", type: "text", required: true },
      { id: "field_2", label: "Invoice Date", placeholder: "DD/MM/YYYY", type: "date", required: true },
      { id: "field_3", label: "Party Name", placeholder: "Vendor / Customer name", type: "text", required: true },
      { id: "field_4", label: "Item Description", placeholder: "Brief description of item", type: "text", required: true },
      { id: "field_5", label: "Quantity", placeholder: "Enter quantity", type: "number", required: true },
      { id: "field_6", label: "Unit Price", placeholder: "Price per unit in INR", type: "number", required: true },
      { id: "field_7", label: "Total Amount", placeholder: "Total in INR", type: "number", required: true },
      { id: "field_8", label: "GST Amount", placeholder: "GST in INR", type: "number", required: false },
      { id: "field_9", label: "Remarks", placeholder: "Any notes", type: "textarea", required: false },
    ],
  },
];

// ─────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────
async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Starting seed process...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // ── 1. Plans (upsert by displayOrder — safe for live DB) ──
  console.log("\n📋 Seeding Plans...");
  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({
      where: { name: plan.name },
    });

    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: plan,
      });
      console.log(`  ✓ Updated: ${plan.name}`);
    } else {
      await prisma.plan.create({ data: plan });
      console.log(`  ✓ Created: ${plan.name}`);
    }
  }

  // ── 2. Admin User (upsert by email) ──
  console.log("\n👤 Seeding Admin User...");
  const adminEmail = "abhijeetambhore4@gmail.com";
  const hashedPassword = await bcrypt.hash("Veagle@123", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Abhijeet Ambhore",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "Abhijeet Ambhore",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`  ✓ Admin ready: ${adminEmail}`);

  // ── 3. Field Templates (upsert by title) ──
  console.log("\n🗂️  Seeding Field Templates...");
  for (const tmpl of fieldTemplates) {
    const existing = await prisma.adminFieldTemplate.findFirst({
      where: { title: tmpl.title },
    });

    if (existing) {
      await prisma.adminFieldTemplate.update({
        where: { id: existing.id },
        data: tmpl,
      });
      console.log(`  ✓ Updated: ${tmpl.title}`);
    } else {
      await prisma.adminFieldTemplate.create({ data: tmpl });
      console.log(`  ✓ Created: ${tmpl.title}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ✅ Seed completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
