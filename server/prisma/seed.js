const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  // 1. Seed Plans
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals starting out.",
      price: 0,
      period: "forever",
      formLimit: 3,
      entryLimit: 100,
      features: [
        "Up to 3 Custom Forms",
        "100 Data Entries per month",
        "Basic Analytics",
        "CSV Export",
      ],
    },
    {
      name: "Pro",
      description: "Ideal for growing teams and businesses.",
      price: 1499,
      period: "per month",
      formLimit: -1, // Unlimited
      entryLimit: 10000,
      features: [
        "Unlimited Custom Forms",
        "10,000 Data Entries per month",
        "Advanced Dashboard & Analytics",
        "Priority Email Support",
        "API Access",
      ],
    },
    {
      name: "Enterprise",
      description: "For large scale data operations.",
      price: 4999,
      period: "per month",
      formLimit: -1,
      entryLimit: -1,
      features: [
        "Everything in Pro",
        "Unlimited Data Entries",
        "Custom Domains",
        "Dedicated Account Manager",
        "SSO Authentication",
      ],
    },
  ];

  console.log("Creating subscription plans...");
  for (const planData of plans) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: planData.name },
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: planData,
      });
      console.log(`Plan '${planData.name}' created.`);
    } else {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: planData,
      });
      console.log(`Plan '${planData.name}' updated.`);
    }
  }

  // 2. Seed Admin User
  const adminEmail = "abhijeetambhore4@gmail.com";
  console.log("Creating admin user...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const hashedPassword = await bcrypt.hash("Veagle@123", 10);

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "system admin",
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
        name: "system admin",
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
