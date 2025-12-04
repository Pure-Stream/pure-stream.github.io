import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  try {
    const { token } = await context.request.json();

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date(verificationToken.expires) < new Date()) {
      // Delete expired token
      await db.verificationToken.delete({
        where: { token },
      });

      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { status: 400 }
      );
    }

    // Find user by email (identifier in VerificationToken is the email)
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }

    // Mark email as verified
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the verification token
    await db.verificationToken.delete({
      where: { token },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Email verified successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
};
