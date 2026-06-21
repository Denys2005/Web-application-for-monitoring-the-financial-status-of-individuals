import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.updateMany({ data: { isAdmin: true } })
  .then(res => console.log('Updated users:', res))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
