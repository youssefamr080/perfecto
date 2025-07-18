const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query'],
});

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
    );
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
    console.log('الجداول الموجودة:', tables.map(t => t.table_name));
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 