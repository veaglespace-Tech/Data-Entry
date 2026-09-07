const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  // 1. Seed Plans
  const plans = [
    { name: "Plan 1", description: "JOB-IMAGE TO EXCEL", price: 4050, period: "7 days", formLimit: -1, entryLimit: 2500, displayOrder: 1, features: ["Mistake Allow: 200", "Pay-out (In INR): 15,700"] },
    { name: "Plan 2", description: "JOB-IMAGE TO EXCEL", price: 5500, period: "9 days", formLimit: -1, entryLimit: 2500, displayOrder: 2, features: ["Mistake Allow: 250", "Pay-out (In INR): 17,000"] },
    { name: "Plan 3", description: "JOB-IMAGE TO EXCEL", price: 6500, period: "7 days", formLimit: -1, entryLimit: 3500, displayOrder: 3, features: ["Mistake Allow: 200", "Pay-out (In INR): 22,000"] },
    { name: "Plan 4", description: "JOB-IMAGE TO EXCEL", price: 12250, period: "9 days", formLimit: -1, entryLimit: 3500, displayOrder: 4, features: ["Mistake Allow: 250", "Pay-out (In INR): 26,000"] },
    { name: "Plan 5", description: "JOB-IMAGE TO EXCEL", price: 16800, period: "10 days", formLimit: -1, entryLimit: 5000, displayOrder: 5, features: ["Mistake Allow: 250", "Pay-out (In INR): 38,000"] },
    { name: "Plan 6", description: "JOB-IMAGE TO EXCEL", price: 20800, period: "10 days", formLimit: -1, entryLimit: 7000, displayOrder: 6, features: ["Mistake Allow: 250", "Pay-out (In INR): 51,500"] },
    { name: "Plan 7", description: "JOB-IMAGE TO EXCEL", price: 23250, period: "12 days", formLimit: -1, entryLimit: 6000, displayOrder: 7, features: ["Mistake Allow: 500", "Pay-out (In INR): 55,000"] },
    { name: "Plan 8", description: "JOB-IMAGE TO EXCEL", price: 30000, period: "15 days", formLimit: -1, entryLimit: 10000, displayOrder: 8, features: ["Mistake Allow: 750", "Pay-out (In INR): 85,000"] },
    { name: "Plan 9", description: "JOB-IMAGE TO EXCEL", price: 35500, period: "20 days", formLimit: -1, entryLimit: 15000, displayOrder: 9, features: ["Mistake Allow: 700", "Pay-out (In INR): 110,000"] },
    { name: "Plan 10", description: "JOB-IMAGE TO EXCEL", price: 50000, period: "20 days", formLimit: -1, entryLimit: 18000, displayOrder: 10, features: ["Mistake Allow: 1000", "Pay-out (In INR): 160,000"] },
    { name: "Plan 11", description: "JOB-IMAGE TO EXCEL", price: 65000, period: "20 days", formLimit: -1, entryLimit: 30000, displayOrder: 11, features: ["Mistake Allow: 1000", "Pay-out (In INR): 290,000"] },
    { name: "Plan 12", description: "JOB-IMAGE TO EXCEL", price: 80000, period: "20 days", formLimit: -1, entryLimit: 30000, displayOrder: 12, features: ["Mistake Allow: 1200", "Pay-out (In INR): 310,000"] },
  ];

  console.log("Clearing old plans...");
  await prisma.plan.deleteMany(); // Reset plans to only keep these 12

  console.log("Creating new subscription plans...");
  for (const planData of plans) {
    await prisma.plan.create({
      data: planData,
    });
    console.log(`Plan '${planData.name}' created.`);
  }

  // 2. Seed Admin User
  const adminEmail = "abhijeetambhore4@gmail.com";
  console.log("Creating admin user:", adminEmail);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const hashedPassword = await bcrypt.hash("Veagle@123", 10);

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Abhijeet Ambhore",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user created successfully.");
  } else {
    // Optionally update the existing user
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: "Abhijeet Ambhore",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user already existed, credentials updated.");
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
