/**
 * Clear all users from the database
 * Usage: npx tsx tests/clear-users.js
 */

import 'dotenv/config.js';
import { db } from '../src/lib/db.js';

async function clearUsers() {
  try {
    console.log('🗑️  Clearing all users from database...');

    // Delete all verification tokens (independent)
    const tokensDeleted = await db.verificationToken.deleteMany({});
    console.log(`✅ Deleted ${tokensDeleted.count} verification tokens`);

    // Delete all users (cascades delete sessions and accounts automatically)
    const usersDeleted = await db.user.deleteMany({});
    console.log(`✅ Deleted ${usersDeleted.count} users`);

    console.log('\n✨ Database cleared successfully!');
    console.log('You can now sign up with any email address.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    console.error('Full error:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

clearUsers();
