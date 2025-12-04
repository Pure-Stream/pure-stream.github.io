// Test password verification for 123@gmail.com
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: '123@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('Password hash:', user.password?.substring(0, 30) + '...');

    const testPassword = '12345678';
    const isValid = await bcrypt.compare(testPassword, user.password);

    console.log('\nPassword verification:');
    console.log('  Testing password:', testPassword);
    console.log('  Result:', isValid ? '✅ VALID' : '❌ INVALID');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
