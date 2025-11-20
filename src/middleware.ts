import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await getSession(context.request);

  // Attach session to locals so it's available in pages
  context.locals.session = session;

  // Protect dashboard and other authenticated routes
  const protectedRoutes = ['/dashboard', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirect to login if not authenticated
    return context.redirect('/login');
  }

  return next();
});
