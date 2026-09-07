const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'abhijeetambhore4@gmail.com';
  const newPassword = 'Veagle@123';
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  
  console.log('Password reset to Veagle@123 for', email);
  
  // also let's make sure the alternate email admin@datavault.com works just in case
  const exists = await prisma.user.findUnique({ where: { email: 'admin@datavault.com' } });
  if (!exists) {
    await prisma.user.create({
      data: {
        name: 'Demo Admin',
        email: 'admin@datavault.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('Created admin@datavault.com with Veagle@123');
  } else {
    await prisma.user.update({
      where: { email: 'admin@datavault.com' },
      data: { password: hashedPassword, role: 'ADMIN', status: 'ACTIVE' }
    });
    console.log('Updated admin@datavault.com with Veagle@123');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
