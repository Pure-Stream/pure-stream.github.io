// Simple test to check if Prisma can connect to the database
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ override: true });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('DATABASE_URL value:', process.env.DATABASE_URL);

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma client with adapter
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn', 'query'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!', result);

    // Try to count users
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);

    // Check all users and their accounts
    const allUsers = await prisma.user.findMany({
      include: { accounts: true }
    });

    console.log('\n📋 All users in database:');
    console.log(JSON.stringify(allUsers, null, 2));

    // Check all accounts
    const allAccounts = await prisma.account.findMany();
    console.log('\n📋 All accounts in database:');
    console.log(JSON.stringify(allAccounts, null, 2));

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testConnection();
