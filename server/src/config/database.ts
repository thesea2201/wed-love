import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'wedlove',
  user: 'wedlove',
  password: 'wedlove123',
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL Connected via Prisma');
  } catch (error) {
    console.warn('PostgreSQL connection failed. Check DATABASE_URL and ensure Docker is running.');
    console.warn('Run: docker compose up -d');
  }
};
