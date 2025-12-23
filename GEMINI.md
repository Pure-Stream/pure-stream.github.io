# WordWeb Project Overview

WordWeb (formerly referred to as BibleWebsite in some docs) is a hybrid SSR/SSG showcase website for the StudyBible application. It is built using **Astro**, **Tailwind CSS**, **Prisma ORM**, and **Better Auth**.

## 🚀 Key Technologies

- **Framework**: [Astro 5](https://astro.build/) (Output: `'server'` with Node adapter)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/))
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (Email/Password, Google, GitHub)
- **Email**: [Resend](https://resend.com/) (for verification)

## 📁 Project Structure

- `src/pages/`: File-based routing for Astro. Contains both SSR pages and API routes.
- `src/lib/`: Core libraries and utilities.
  - `auth.ts`: Better Auth configuration and Prisma adapter wrapper with field transformations.
  - `db.ts`: Prisma client singleton.
- `src/middleware.ts`: Route protection and session injection into `Astro.locals`.
- `prisma/schema.prisma`: Database schema defining `User`, `Account`, `Session`, and `VerificationToken`.
- `tests/`: Utility scripts for testing database, users, and passwords.

## 🛠️ Development Commands

### Building and Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio
npx prisma studio
```

### Testing

```bash
# Test database connection
node tests/test-db.js

# Test user operations
node tests/test-users.js
```

## 🔐 Authentication Details

The project uses a custom integration between Better Auth and the existing Prisma schema. 

### Custom Adapter Wrapper
Because the database schema uses field names like `sessionToken` (instead of `token`) and `expires` (instead of `expiresAt`), a **wrapped Prisma client** is used in `src/lib/auth.ts`. This wrapper:
- **Intercepts Writes**: Maps Better Auth field names to the Prisma schema (e.g., `token` -> `sessionToken`).
- **Transforms Reads**: Maps database fields back to the format Better Auth expects.
- **Handles Field Exclusions**: Removes fields like `createdAt`, `updatedAt`, `ipAddress`, and `userAgent` from session/account objects before saving if they aren't in the schema.
- **Normalizes Data**: Converts `emailVerified: false` to `null` to match the schema's `DateTime?` type.

### Session Management
- **Token Storage**: Sessions are stored in HTTP-only cookies (`better-auth.session_token`).
- **Middleware**: `src/middleware.ts` validates sessions on every request and populates `Astro.locals.session`, making user data available in all Astro pages.
- **Protected Routes**: Defined in `src/config/constants.ts` and enforced via middleware.

## 🎨 Development Conventions

- **Styling**: Use utility-first Tailwind classes. Custom theme extensions (fonts, colors) are in `tailwind.config.mjs`.
- **SSR/SSG**: Pages requiring authentication must use `export const prerender = false` (default when output is 'server').
- **Environment Variables**: Managed in `.env`. See `.env.example` for required keys (DATABASE_URL, AUTH_SECRET, OAuth credentials).
- **TypeScript**: Strict mode is enabled. Use types from `src/env.d.ts` for Astro-specific context.

## 📝 Usage

To add a new feature:
1.  **Database**: If needed, update `schema.prisma` and run `npx prisma migrate dev`.
2.  **Logic**: Add utilities or services in `src/lib/`.
3.  **UI**: Create components in `src/components/` and pages in `src/pages/`.
4.  **Auth**: Use `Astro.locals.session` to check user state in frontmatter.
