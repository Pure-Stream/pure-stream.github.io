import { defineConfig } from 'auth-astro';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import Credentials from '@auth/core/providers/credentials';
import type { Provider } from '@auth/core/providers';

export default defineConfig({
  session: {
    strategy: 'jwt', // Use JWT sessions (better for serverless)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Dynamic import to avoid bundling issues
        const { db } = await import('./src/lib/db');
        const bcrypt = await import('bcryptjs');

        // Find user in database
        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Return user object (without password!)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    }) as Provider,
  ],
  pages: {
    signIn: '/login', // ROUTES.LOGIN from constants
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in - add user ID to token
      if (user) {
        token.id = user.id;
      }
      // OAuth sign in - save account info
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID from token to session
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
