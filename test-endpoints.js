const BASE_URL = 'http://localhost:4324';

// Test various endpoint patterns that better-auth might use
const endpoints = [
  // Credential signin variations
  '/api/auth/sign-in/credentials',
  '/api/auth/signin/credentials',
  '/api/auth/credentials/sign-in',
  '/api/auth/signIn/credentials',

  // Email variations
  '/api/auth/sign-in/email',
  '/api/auth/signin/email',
  '/api/auth/email/sign-in',
  '/api/auth/signIn/email',

  // General auth info
  '/api/auth',
  '/api/auth/session',
  '/api/auth/user',
  '/api/auth/callback',
];

async function testEndpoints() {
  console.log('Testing better-auth endpoints with POST...\n');

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123',
        }),
      });

      const status = response.status;
      const statusColor = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️';
      const text = await response.text();
      const preview = text.substring(0, 100);

      console.log(`${statusColor} ${status} - ${endpoint}`);
      if (status !== 404 && preview) {
        console.log(`   Response preview: ${preview}...`);
      }
    } catch (error) {
      console.log(`❌ ERROR - ${endpoint}: ${error.message}`);
    }
  }
}

testEndpoints();
