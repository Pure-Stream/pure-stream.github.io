import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendVerificationEmail = async (email: string, token: string) => {
  console.log('📧 sendVerificationEmail called');
  console.log('   Email:', email);
  console.log('   Token:', token.slice(0, 10) + '...');
  console.log('   Resend initialized:', !!resend);

  if (!resend) {
    console.warn('⚠️ Resend API key not configured. Email verification will not work.');
    console.warn('Add RESEND_API_KEY to your .env file to enable email sending.');
    console.warn('Current RESEND_API_KEY value:', process.env.RESEND_API_KEY ? '***set***' : 'undefined');
    return { success: false, message: 'Email service not configured' };
  }

  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:4321';
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;

  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // Update this to your domain after verifying with Resend
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                color: #333;
                margin-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                color: #1f2937;
              }
              .content {
                color: #666;
                line-height: 1.6;
                margin-bottom: 30px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(to right, #2563eb, #4f46e5);
                color: white;
                text-decoration: none;
                padding: 12px 32px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                color: #999;
                font-size: 12px;
              }
              .expires {
                color: #d97706;
                margin-top: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email</h1>
              </div>

              <div class="content">
                <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
                <p>Click the button below to verify your email:</p>
                <a href="${verificationLink}" class="button">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
                <div class="expires">
                  ⚠️ This link expires in 24 hours.
                </div>
              </div>

              <div class="footer">
                <p>If you didn't create this account, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return response;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};
