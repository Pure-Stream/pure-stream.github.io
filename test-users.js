import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users and their accounts...\n');

    const users = await prisma.user.findMany({
      where: {
        email: '123@gmail.com'
      },
      include: {
        accounts: true
      }
    });

    console.log('Found users:');
    console.log(JSON.stringify(users, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkUsers();
