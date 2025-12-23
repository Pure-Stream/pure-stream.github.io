import 'dotenv/config.js';
import { sendVerificationEmail } from '../src/lib/email.js';

console.log('\n🔍 Testing Resend Initialization\n');
console.log('RESEND_API_KEY from env:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set');
console.log('RESEND_API_KEY value:', process.env.RESEND_API_KEY);

// Try to send a test email
(async () => {
  try {
    console.log('\n📧 Attempting to send test email...\n');
    const result = await sendVerificationEmail('test@example.com', 'test_token_12345678');
    console.log('\n✅ Function returned:', result);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
})();
