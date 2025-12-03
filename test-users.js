// Test script to list all users in the database
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ override: true });

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

async function listUsers() {
  try {
    console.log('Fetching all users from database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: true, // Just to see if it's hashed
        createdAt: true,
      }
    });

    console.log(`Found ${users.length} user(s):\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password (hashed): ${user.password ? user.password.substring(0, 20) + '...' : 'null'}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
