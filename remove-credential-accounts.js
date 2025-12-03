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
  log: ['error', 'warn', 'query'],
});

async function removeCredentialAccounts() {
  try {
    console.log('🗑️  Removing credential accounts...');

    // Delete all accounts with provider "credential"
    const result = await prisma.account.deleteMany({
      where: {
        provider: 'credential'
      }
    });

    console.log(`✅ Deleted ${result.count} credential accounts`);
    console.log('\nBetter-auth email/password authentication uses the User table directly,');
    console.log('not the Account table. Account table is only for OAuth providers.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

removeCredentialAccounts();
