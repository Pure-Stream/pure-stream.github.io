import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';
import { PROTECTED_ROUTES, ROUTES } from './config/constants';
import { jwtVerify } from 'jose';

export const onRequest = defineMiddleware(async (context, next) => {
  console.log('🔒 Middleware checking:', context.url.pathname);

  let session = await getSession(context.request);
  console.log('Auth-astro session:', session ? '✅ Found' : '❌ None');

  // If no auth-astro session, check for custom JWT token
  if (!session) {
    const authToken = context.cookies.get('auth-token')?.value;
    console.log('Custom auth-token:', authToken ? '✅ Found' : '❌ None');

    if (authToken) {
      try {
        const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret');
        const { payload } = await jwtVerify(authToken, secret);

        // Create a session object from the JWT payload
        session = {
          user: {
            id: payload.id as string,
            email: payload.email as string,
            name: payload.name as string,
          },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        console.log('✅ JWT verified, session created for:', payload.email);
      } catch (error) {
        console.error('❌ Invalid JWT token:', error);
        // Invalid token, clear it
        context.cookies.delete('auth-token');
      }
    }
  }

  // Attach session to locals so it's available in pages
  context.locals.session = session;

  // Protect authenticated routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirect to login if not authenticated
    return context.redirect(ROUTES.LOGIN);
  }

  return next();
});
