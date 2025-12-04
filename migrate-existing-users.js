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

async function migrateExistingUsers() {
  try {
    console.log('🔄 Migrating existing users to better-auth format...');

    // Find all users with passwords but no credential account
    const usersWithPasswords = await prisma.user.findMany({
      where: {
        password: {
          not: null
        }
      },
      include: {
        accounts: true
      }
    });

    console.log(`Found ${usersWithPasswords.length} users with passwords`);

    for (const user of usersWithPasswords) {
      // Check if user already has a credential account
      const hasCredentialAccount = user.accounts.some(
        acc => acc.provider === 'credential'
      );

      if (!hasCredentialAccount) {
        console.log(`Creating credential account for user: ${user.email}`);

        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'credential',
            provider: 'credential',
            providerAccountId: user.email, // Use email as the provider account ID
          }
        });

        console.log(`✅ Created credential account for ${user.email}`);
      } else {
        console.log(`⏭️  User ${user.email} already has a credential account`);
      }
    }

    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

migrateExistingUsers();
