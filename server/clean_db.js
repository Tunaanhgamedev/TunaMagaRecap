import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function clean() {
  try {
    const deleted = await prisma.project.deleteMany({});
    console.log('✅ Deleted projects from SQLite Prisma:', deleted);
  } catch (err) {
    console.warn('Prisma cleanup note:', err.message);
  }

  // Also clean db.json
  const dbPath = path.join(process.cwd(), 'server', 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify({ projects: [], queue: [] }, null, 2));
  console.log('✅ Cleaned server/db.json to []');

  await prisma.$disconnect();
}

clean();
