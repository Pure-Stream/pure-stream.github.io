import { defineMiddleware } from 'astro:middleware';
import { PROTECTED_ROUTES, ROUTES } from './config/constants';

// Helper function to decode JWT (without verification for now)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url to string
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    return decoded;
  } catch (err) {
    console.error('[Middleware] JWT decode error:', err);
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  console.log(`[Middleware] Path: ${pathname}`);

  // Get access token from cookies
  const accessToken = context.cookies.get('sb-access-token')?.value;
  console.log(`[Middleware] Access Token: ${accessToken ? 'Found' : 'Missing'}`);

  let user = null;

  // If we have an access token, decode it to get user info
  if (accessToken) {
    const decoded = decodeJWT(accessToken);
    if (decoded && decoded.sub && decoded.email) {
      // Check if token is still valid (not expired)
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp > now) {
        user = {
          id: decoded.sub,
          email: decoded.email,
          user_metadata: decoded.user_metadata || {},
        };
        console.log(`[Middleware] User authenticated: ${user.email}`);
      } else {
        console.log(`[Middleware] Token expired`);
      }
    } else {
      console.log(`[Middleware] Invalid token format`);
    }
  } else {
    console.log(`[Middleware] No access token found`);
  }

  // Attach user to locals so it's available in pages
  context.locals.user = user;

  // Protect authenticated routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    console.log(`[Middleware] Protected route without user, redirecting to login`);
    // Redirect to login if not authenticated
    return context.redirect(ROUTES.LOGIN);
  }

  return next();
});
