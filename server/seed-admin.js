const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@datavault.com' }
  });

  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@datavault.com',
        password: hashedPassword,
        role: 'ADMIN',
        planStatus: 'ACTIVE',
      }
    });
    console.log("Admin created: admin@datavault.com / admin123");
  } else {
    console.log("Admin already exists.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
