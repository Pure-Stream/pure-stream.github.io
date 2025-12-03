const BASE_URL = 'http://localhost:4323';
const testEmail = `test-${Date.now()}@gmail.com`;
const testPassword = 'testtest123';

async function testAuthFlow() {
  try {
    console.log('🔐 Testing authentication flow...\n');

    // Step 1: Get CSRF token
    console.log('📝 Step 1: Getting CSRF token...');
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`, {
      method: 'GET',
    });
    const csrfText = await csrfResponse.text();
    console.log(`Response status: ${csrfResponse.status}`);
    console.log(`Response text: ${csrfText}\n`);

    let csrfToken = null;
    try {
      const csrfData = JSON.parse(csrfText);
      csrfToken = csrfData.token;
      console.log(`✅ CSRF Token: ${csrfToken}\n`);
    } catch (e) {
      console.log('⚠️  Could not parse CSRF response\n');
    }

    // Step 2: Sign up with email and password
    console.log(`📝 Step 2: Signing up with ${testEmail}...`);
    const signupResponse = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      }),
    });

    console.log(`Response status: ${signupResponse.status}`);
    const signupData = await signupResponse.json();
    console.log('Response data:', JSON.stringify(signupData, null, 2));
    console.log();

    if (!signupResponse.ok) {
      console.error('❌ Signup failed!');
      return;
    }

    console.log('✅ Signup successful!\n');

    // Step 3: Try to sign in with email
    console.log(`📝 Step 3: Signing in with ${testEmail}...`);
    const signinResponse = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log(`Response status: ${signinResponse.status}`);
    const signinData = await signinResponse.json();
    console.log('Response data:', JSON.stringify(signinData, null, 2));
    console.log();

    if (signinResponse.ok) {
      console.log('✅ Sign in successful!');
    } else {
      console.error('❌ Sign in failed!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuthFlow();
