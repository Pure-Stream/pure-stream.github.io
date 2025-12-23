/**
 * Test email verification flow
 * Usage: npx tsx tests/test-email-verification.js
 *
 * This script:
 * 1. Creates a test user via the signup API
 * 2. Retrieves the verification token from the database
 * 3. Calls the verification endpoint
 * 4. Confirms the email was verified
 */

import 'dotenv/config.js';
import { db } from '../src/lib/db.js';

const TEST_EMAIL = 'sujith.christopher52@gmail.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';
const BASE_URL = 'http://localhost:4327'; // Change if dev server is on different port

async function testEmailVerification() {
  try {
    console.log('\n🧪 Starting email verification test...\n');

    // Step 1: Create a test user via signup endpoint
    console.log('📝 Step 1: Creating test user via API...');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Name: ${TEST_NAME}`);

    const signupResponse = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME,
      }),
    });

    const signupData = await signupResponse.json();

    if (!signupResponse.ok) {
      console.log('❌ Failed to create user');
      console.log(`   Status: ${signupResponse.status}`);
      console.log(`   Error: ${signupData.error}`);
      return;
    }

    if (signupData.user) {
      console.log('✅ User created successfully');
      console.log(`   User ID: ${signupData.user.id}`);
    } else {
      console.log('❌ User creation response missing user data');
      return;
    }

    // Step 2: Get the verification token from database
    console.log('\n🔍 Step 2: Retrieving verification token from database...');

    const verificationToken = await db.verificationToken.findFirst({
      where: { identifier: TEST_EMAIL },
    });

    if (!verificationToken) {
      console.log('❌ No verification token found in database');
      console.log('⚠️  This means the onSignUpSuccess hook might not have triggered');
      return;
    }

    console.log('✅ Verification token found');
    console.log(`   Token: ${verificationToken.token.slice(0, 10)}...`);
    console.log(`   Expires: ${verificationToken.expires}`);

    // Step 3: Call the verification endpoint
    console.log('\n✔️ Step 3: Verifying email via API endpoint...');

    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verificationToken.token }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.log('❌ Verification failed');
      console.log(`   Status: ${verifyResponse.status}`);
      console.log(`   Message: ${verifyData.error}`);
      return;
    }

    console.log('✅ Email verified successfully');
    console.log(`   Message: ${verifyData.message}`);

    // Step 4: Confirm the user's emailVerified is set
    console.log('\n📋 Step 4: Confirming user emailVerified status...');

    const updatedUser = await db.user.findUnique({
      where: { email: TEST_EMAIL },
    });

    if (updatedUser?.emailVerified) {
      console.log('✅ User email is verified');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Verified at: ${updatedUser.emailVerified}`);
    } else {
      console.log('❌ User email is NOT verified');
    }

    // Step 5: Verify token was deleted
    console.log('\n🧹 Step 5: Confirming verification token was deleted...');

    const deletedToken = await db.verificationToken.findFirst({
      where: { identifier: TEST_EMAIL },
    });

    if (!deletedToken) {
      console.log('✅ Verification token was deleted after use');
    } else {
      console.log('⚠️  Verification token still exists (should be deleted)');
    }

    console.log('\n✨ Email verification test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  } finally {
    await db.$disconnect();
  }
}

testEmailVerification();
