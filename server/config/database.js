import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logInfo } from '../utils/logger.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export async function connectDB() {
  try {
    await prisma.$connect();
    logInfo('PostgreSQL Connected via Prisma');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
}
