import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';
import { PROTECTED_ROUTES, ROUTES } from './config/constants';

export const onRequest = defineMiddleware(async (context, next) => {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: context.request.headers
  });

  // Attach session to locals so it's available in pages
  context.locals.session = session ? {
    user: session.user,
    session: session.session
  } : null;

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
