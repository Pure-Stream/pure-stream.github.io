import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ override: true });

// Debug: Check if DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
} else {
  console.log('✅ DATABASE_URL is loaded');
}

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  var pgPool: pg.Pool | undefined;
}

// Use globalThis instead of global for better compatibility
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: pg.Pool | undefined;
};

// Create PostgreSQL connection pool (reuse in development)
const pool = globalForPrisma.pgPool ?? new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
}

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma client with adapter (reuse in development)
export const db = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
