import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Custom signin attempt for:', email);

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ User found:', user.email);

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log('❌ Invalid password');
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Password valid, creating session');

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret');
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    // Set session cookie
    cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    console.log('✅ Session created successfully');

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Signin error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
