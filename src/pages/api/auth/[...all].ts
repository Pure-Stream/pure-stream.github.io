import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { sendVerificationEmail } from "../../../lib/email";
import type { APIRoute } from "astro";
import crypto from "crypto";

export const ALL: APIRoute = async (context) => {
  const request = context.request;
  const url = new URL(request.url);

  // Handle signup requests specially to generate verification tokens
  if (url.pathname.includes("/api/auth/sign-up/email") && request.method === "POST") {
    console.log('🔔 Intercepting signup request...');

    // Call the default auth handler
    const response = await auth.handler(request.clone());

    // Check if signup was successful
    if (response.status === 200 || response.status === 201) {
      console.log('📊 Signup successful, parsing response...');

      const responseData = await response.clone().json();

      if (responseData.user?.email) {
        const email = responseData.user.email;
        console.log('📧 Creating verification token for:', email);

        try {
          // Generate verification token
          const token = crypto.randomBytes(32).toString('hex');
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          // Store token in database
          await db.verificationToken.create({
            data: {
              identifier: email,
              token,
              expires,
            },
          });
          console.log('✅ Token stored in database:', token.slice(0, 10) + '...');

          // Send verification email
          console.log('📧 Sending verification email...');
          await sendVerificationEmail(email, token);
          console.log('✅ Verification email sent!');
        } catch (error) {
          console.error('❌ Error sending verification email:', error);
          // Don't fail the signup, just log the error
        }
      }
    }

    return response;
  }

  // For all other auth requests, use the default handler
  return auth.handler(request);
};
