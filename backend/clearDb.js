const { PrismaClient } = require('@prisma/client');

async function clearDatabase() {
  const prisma = new PrismaClient();
  try {
    // Delete all records from each model
    await prisma.like.deleteMany();
    await prisma.save.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ All data cleared from the database.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
