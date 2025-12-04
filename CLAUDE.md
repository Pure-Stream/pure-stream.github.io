# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
BibleWebsite is a hybrid (SSR + SSG) marketing/showcase website for the StudyBible application (https://github.com/SujithChristopher/StudyBible). Built with Astro 5.15.9 and Tailwind CSS, it features a compact homepage, an interactive GitHub-style feedback system, and a complete authentication system with Google OAuth, GitHub OAuth, and email/password login. The site is designed to be clean, modern, and responsive.

## Development Commands

### Running the Development Server
```bash
# Start development server with hot reload
npm run dev
# Server runs on http://localhost:4321 (or next available port)
```

### Building for Production
```bash
# Build static site for deployment
npm run build
# Output: dist/ directory

# Preview production build locally
npm run preview
```

## Architecture Overview

### Site Structure
This is a hybrid SSR/SSG project with Astro handling both the build process and page routing:

```
├── auth.config.ts            # Auth.js configuration (providers, callbacks)
├── prisma/
│   ├── schema.prisma         # Database schema (User, Account, Session models)
│   └── migrations/           # Database migration history
├── prisma.config.ts          # Prisma 7 configuration (database URL, migrations path)
├── src/
│   ├── lib/
│   │   └── db.ts            # Prisma client instance (singleton pattern)
│   ├── middleware.ts        # Route protection middleware
│   ├── layouts/
│   │   └── Layout.astro     # Base layout with meta tags, fonts, global styles
│   ├── pages/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── signup.ts       # User registration API endpoint
│   │   ├── index.astro             # Homepage (/) - SSR for session
│   │   ├── feedback.astro          # Feedback/Issues page (/feedback)
│   │   ├── login.astro             # Login page with OAuth & credentials
│   │   ├── signup.astro            # User registration page
│   │   └── dashboard.astro         # Protected user dashboard
│   └── components/                 # (Empty - for future reusable components)
└── .env                            # Environment variables (gitignored)
```

### Page Routing
Astro uses file-based routing with hybrid rendering:
- `src/pages/index.astro` → `/` (SSR - requires session check)
- `src/pages/feedback.astro` → `/feedback` (SSG)
- `src/pages/login.astro` → `/login` (SSR - authentication page)
- `src/pages/signup.astro` → `/signup` (SSR - registration page)
- `src/pages/dashboard.astro` → `/dashboard` (SSR - protected route)
- `src/pages/api/auth/signup.ts` → `/api/auth/signup` (API endpoint)
- Auth.js auto-generates: `/api/auth/signin/*`, `/api/auth/signout`, `/api/auth/callback/*`

### Layout System
All pages import and use `src/layouts/Layout.astro` which provides:
- HTML structure and meta tags
- Google Fonts (Inter, Poppins)
- Global CSS reset and styling
- Gradient background via Tailwind utility classes

### Styling Approach
**Tailwind CSS** is the primary styling solution:
- Utility-first classes for all styling
- Custom theme extensions in `tailwind.config.mjs`:
  - Primary color palette (blue shades)
  - Custom fonts: `font-sans` (Inter) and `font-display` (Poppins)
- Inline `<style>` blocks for page-specific animations (e.g., blob animations)
- Glass morphism effects: `bg-white/60 backdrop-blur-sm`

## Authentication System

### Overview

Complete authentication system built with **better-auth**, **Prisma ORM**, and **bcryptjs**.

**Supported Authentication Methods:**

1. **Email/Password** - Credential-based authentication via better-auth (fully working)
2. **Google OAuth** - Sign in with Google account
3. **GitHub OAuth** - Sign in with GitHub account

### Better-Auth Architecture

#### Authentication Flow

1. **Signup** (`/api/auth/sign-up/email`): Creates user account with hashed password
2. **Signin** (`/api/auth/sign-in/email`): Validates credentials and creates session
3. **Session Management**: HTTP-only cookies store `better-auth.session_token`
4. **Middleware Protection**: Validates session on protected routes

#### Field Name Mapping

**Schema Field Mismatch Issue:**
The Prisma schema uses field names that differ from better-auth's expected field names. To bridge this mismatch, we implemented transformation functions in `src/lib/auth.ts`:

**Account Field Transformations** (`transformAccountFromDb()`):

- Database: `provider` → better-auth: `providerId`
- Database: `providerAccountId` → better-auth: `accountId`
- Applied on account reads (findUnique, findMany)

**Session Field Transformations** (`transformSessionFromDb()`):

- Database: `sessionToken` → better-auth: `token`
- Database: `expires` → better-auth: `expiresAt`
- Applied on session reads and creates

**Transformation Benefits:**

- Better-auth receives data with expected field names
- Proper session cookie generation: `better-auth.session_token=xxxxx`
- Credential account recognition during signin
- Seamless session validation in middleware

#### Prisma Adapter Wrapper

The `src/lib/auth.ts` file wraps the Prisma client to:

1. Map better-auth field names → schema field names (on write)
2. Transform data back to better-auth field names (on read)
3. Handle field exclusions and transformations for each model:
   - **User**: Converts `emailVerified: false` → `null`
   - **Session**: Maps token and expiration field names
   - **Account**: Maps provider and credential fields

**Security Features:**

- Passwords hashed with bcrypt (10 salt rounds)
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- 30-day session expiration
- CSRF protection built into better-auth
- SQL injection protected via Prisma ORM

**Dependencies:**

- `better-auth`: Modern authentication library
- `bcryptjs`: Password hashing and verification
- `@prisma/client`: Database ORM
- `@prisma/adapter-pg`: PostgreSQL adapter for Prisma 7
- `pg`: Node.js PostgreSQL client

### Configuration (`src/lib/auth.ts`)

Main authentication configuration with:

- **Email/Password Provider**: Enabled with `emailAndPassword: { enabled: true }`
- **OAuth Providers**: Google and GitHub (configured via environment variables)
- **Session**: 30-day expiration with automatic renewal
- **Trusted Origins**: Localhost for development

The wrapper pattern allows using better-auth while maintaining the existing Prisma schema.

### Database (`prisma/schema.prisma`)
Four models required by Auth.js:
1. **User**: Core user data (id, name, email, password, image)
2. **Account**: OAuth provider accounts linked to users
3. **Session**: Active user sessions with JWT tokens
4. **VerificationToken**: Email verification tokens (future use)

**Database Provider: PostgreSQL (Neon)**
- Cloud-hosted PostgreSQL database on [Neon](https://neon.tech)
- Free tier: 0.5GB storage, 3GB data transfer/month
- Connection pooling enabled for better performance
- Used for both development and production

**Prisma Configuration (`prisma.config.ts`):**
- **Prisma 7** uses separate config file (not in schema.prisma)
- Database URL loaded from `.env` with `dotenv.config({ override: true })`
- Override flag required to replace any existing env vars
- Defines migrations path and datasource URL

**Database Client (`src/lib/db.ts`):**
- Singleton pattern to prevent multiple Prisma instances
- Reuses client in development mode via `global.prisma`
- Auto-disconnects in production

### Middleware (`src/middleware.ts`)

Protects routes requiring authentication using better-auth sessions:

- Runs on every request before page rendering
- Checks for better-auth session via `auth.api.getSession()`
- Reads session from `better-auth.session_token` cookie
- Attaches session to `context.locals.session` for use in pages
- Redirects unauthenticated users from protected routes (`/dashboard`, `/profile`)
- Works seamlessly with both email/password and OAuth logins

**Session Validation:**

```typescript
// In middleware
const session = await auth.api.getSession({
  headers: context.request.headers
});

// In pages
const session = Astro.locals.session;
if (!session) return Astro.redirect('/login');
const user = session.user;
```

**Type Definitions (`src/env.d.ts`):**

Defines TypeScript types for `Astro.locals.session` to provide IDE autocomplete and type checking.

### Authentication Pages

#### Login Page (`src/pages/login.astro`)

Beautiful, responsive login UI with:

- **OAuth buttons**: Google and GitHub with brand colors/logos
- **Email/Password form**: Standard credentials input
- **Divider**: "Or continue with email" separator
- **Links**: "Forgot password?" and "Sign up" navigation
- **Glass morphism design**: Matches site aesthetic
- **Server-rendered**: `export const prerender = false`

**Form Actions:**

- Google: Uses `authClient.signIn.social({ provider: 'google' })`
- GitHub: Uses `authClient.signIn.social({ provider: 'github' })`
- Email/Password: Uses `authClient.signIn.email({ email, password })`

**After Signin:**

- Session cookie is automatically set
- Client redirects to `/dashboard` on success
- Middleware validates session on protected routes

#### Signup Page (`src/pages/signup.astro`)
User registration with client-side validation:
- **Form fields**: Name, email, password, confirm password
- **Validation**: Password match check, minimum 8 characters
- **OAuth options**: Same as login page
- **API integration**: Posts to `/api/auth/signup`
- **Client-side script**: Validates before submission, shows errors

**Validation Rules:**
- All fields required
- Password ≥ 8 characters
- Password confirmation must match
- Terms & conditions checkbox required

#### Dashboard Page (`src/pages/dashboard.astro`)
Protected user dashboard with:
- **Session check**: Redirects if not authenticated
- **User greeting**: Displays user name or email
- **Stats grid**: Placeholder stats (study time, bookmarks, notes)
- **Account settings**: Profile info display
- **Logout button**: Form POST to `/api/auth/signout`
- **Download CTA**: Link back to homepage

**Protected by:**
1. Middleware check (redirects before page loads)
2. In-page session check (double protection)

### API Endpoints

#### User Registration (`src/pages/api/auth/signup.ts`)
Handles new user creation:
1. **Validates input**: Checks for missing fields, password length
2. **Checks duplicates**: Queries database for existing email
3. **Hashes password**: bcrypt with 10 salt rounds
4. **Creates user**: Prisma insert into User table
5. **Returns response**: User data (without password) or error

**Response Codes:**
- `201`: Account created successfully
- `400`: Missing fields or invalid password
- `409`: User already exists
- `500`: Internal server error

**Security:**
- SQL injection protected (Prisma parameterized queries)
- Password never returned in response
- Passwords hashed before storage
- Email uniqueness enforced at DB level

### Session Management

Handled automatically by better-auth:

- **Session tokens**: Stored in HTTP-only `better-auth.session_token` cookie
- **Session duration**: 30-day expiration configured in `src/lib/auth.ts`
- **Automatic refresh**: Session renewed on activity
- **Secure cookies**: HTTPS required in production

### Security Features
1. **Password Hashing**: bcrypt with 10 salt rounds
2. **SQL Injection Protection**: Prisma ORM parameterized queries
3. **XSS Protection**: Input sanitization via Astro's template escaping
4. **CSRF Protection**: Built into Auth.js
5. **Secure Cookies**: HTTP-only, secure flag in production
6. **Input Validation**: Email format, password length checks
7. **Route Protection**: Middleware prevents unauthorized access

## Key Implementation Details

### Homepage (`index.astro`)
Compact single-page design with **dynamic authentication status**:
- **Server-rendered**: `export const prerender = false` for session access
- **Session check**: Shows "Dashboard" button if logged in, "Login" if not
- Navigation updates based on authentication state
Compact single-page design with sections:
1. **Sticky Navigation**: Links to features, download, feedback, GitHub
2. **Hero Section**: App icon, title, tagline, CTA buttons, stats
3. **Features Grid**: 6 key features in 2x3 grid layout
4. **Download Section**: Platform cards (Windows, macOS, Linux, Android)
5. **Tech Stack**: Horizontal cards showing Rust, Dioxus, Tailwind, Tokio
6. **Footer**: Links and branding

**Design Patterns:**
- Gradient text: `bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent`
- Hover effects: `hover:shadow-xl transition-all`
- Decorative animated blobs with `animate-blob` custom animation

### Feedback Page (`feedback.astro`)
GitHub Issues-inspired interactive interface with client-side JavaScript.

**Architecture:**
- **Server-side**: Astro component renders initial HTML structure
- **Client-side**: `<script is:inline>` contains all interactive logic
  - Mock data stored in `issues` array
  - Dynamic rendering via `renderIssues()` and `renderIssueList()`
  - Event handlers for tabs, forms, modals

**Key Features:**
1. **Issue List View**:
   - Open/Closed tabs with counters
   - Issues rendered with labels, metadata, comment counts
   - Click to open detail modal

2. **Issue Creation**:
   - Form with title, description, label selection
   - Submits to in-memory array (demo only)
   - Form validation and reset on submit

3. **Issue Detail Modal**:
   - Full overlay with scrollable content
   - Displays title, description, status, labels
   - Shows existing comments
   - Comment input (UI only, not functional)

**Important JavaScript Patterns:**
- Uses `getAttribute('data-*')` instead of TypeScript-style `dataset` for compatibility
- All DOM queries check for `null` before manipulation
- Modal management with `hidden` class and `overflow` style
- Uses `is:inline` directive to prevent Astro from bundling/transforming script

### Data Flow in Feedback Page
```
User Action → Event Listener → Update Data Array → Re-render DOM
```
Example: Creating a new issue:
1. User fills form and submits
2. `issueForm` submit handler captures data
3. Creates new issue object with auto-incrementing ID
4. Adds to `issues` array with `unshift()`
5. Calls `renderIssues()` to update UI
6. Resets form and shows alert

## Configuration Files

### `astro.config.mjs`
- Integrates Tailwind CSS via `@astrojs/tailwind`
- Integrates Auth.js via `auth-astro`
- Output mode: `'hybrid'` (SSR for auth pages, SSG for static content)

### `tailwind.config.mjs`
- **Tailwind CSS v3** (v4 not yet compatible with `@astrojs/tailwind`)
- Content paths: All `.astro` files in `src/`
- Extended theme with custom primary colors and fonts

### `tsconfig.json`
- Extends Astro's strict TypeScript config
- JSX support configured for React (future-proofing)

### `src/lib/auth.ts`

- Better-auth provider configuration (Google, GitHub, email/password)
- Prisma adapter wrapper with field name transformations
- Session configuration with 30-day expiration
- Trusted origins for development and production

### `prisma/schema.prisma`
- Database schema with Auth.js-required models
- **PostgreSQL** provider (Neon cloud database)
- User model with password field for credentials auth
- Cascade deletes for referential integrity

### `prisma.config.ts`
- **Prisma 7** configuration file (separate from schema)
- Loads environment variables with `dotenv.config({ override: true })`
- Defines datasource URL and migrations path
- Override flag prevents cached env vars from interfering

### `.env` & `.env.example`
- Environment variables for OAuth secrets, database URL, auth secret
- **DATABASE_URL**: Neon PostgreSQL connection string
- `.env` is gitignored for security
- `.env.example` provides template with Neon format

## Development Patterns

### Adding New Pages
1. Create `.astro` file in `src/pages/`
2. Import and use `Layout` component
3. File name becomes route (e.g., `about.astro` → `/about`)
4. Add `export const prerender = false` if page needs server-side rendering (e.g., for sessions)

### Adding Protected Routes

1. Create page in `src/pages/` (e.g., `profile.astro`)
2. Add `export const prerender = false` for SSR
3. Add route path to `protectedRoutes` array in `src/middleware.ts`
4. Add session check in page frontmatter:
   ```typescript
   const session = Astro.locals.session;
   if (!session) return Astro.redirect('/login');
   ```

### Testing Authentication

Test scripts are organized in the `tests/` folder:

- `tests/test-db.js` - Database connectivity and schema validation
- `tests/test-users.js` - User management operations
- `tests/test-password.js` - Password hashing and verification

**Running Tests:**

```bash
node tests/test-db.js      # Test database connection
node tests/test-users.js   # Test user CRUD operations
node tests/test-password.js # Test password functions
```

### Working with Database
**Using Prisma Client:**
```typescript
import { db } from '../lib/db';

// Query user
const user = await db.user.findUnique({ where: { email } });

// Create user
const newUser = await db.user.create({ data: { name, email, password } });

// Update user
await db.user.update({ where: { id }, data: { name: 'New Name' } });
```

**After schema changes:**
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate` to update client

### Adding OAuth Providers

1. Add provider configuration in `src/lib/auth.ts` under `socialProviders`
2. Add environment variables to `.env` and `.env.example`:
   - `PROVIDER_CLIENT_ID`
   - `PROVIDER_CLIENT_SECRET`
3. Update login/signup pages with new OAuth button
4. Configure OAuth app redirect URI: `http://localhost:4321/api/auth/callback/provider`
5. Better-auth automatically handles the callback and session creation

**Example Provider Addition:**

```typescript
// In src/lib/auth.ts
socialProviders: {
  google: { ... },
  github: { ... },
  // Add new provider here with clientId and clientSecret
}
```

### Working with Feedback Page JavaScript
**Important**: The feedback page uses inline JavaScript (`<script is:inline>`) to avoid Astro's bundling.

**When modifying:**
- Avoid TypeScript syntax (type assertions, interfaces)
- Use plain JavaScript with null checks
- Access data attributes via `getAttribute('data-*')`
- Test form reset with `issueForm.reset` check before calling

**To add new issue fields:**
1. Update issue object structure in data array
2. Modify `renderIssueList()` template string
3. Update `openIssueModal()` to display new fields
4. Add form inputs in "New Issue Form" section
5. Capture new values in form submit handler

### Navigation Pattern
Navigation varies by page and authentication state:
- **Homepage**: Dynamic login/dashboard button based on session
- **Dashboard**: Shows user name and logout button
- Homepage links use anchor tags (`#features`, `#download`)
- Cross-page links use relative paths (`/feedback`, `/login`)
- External links use `target="_blank"` for GitHub

### Environment Setup
**Required for authentication:**
1. **Create Neon PostgreSQL database**: Sign up at https://neon.tech and create a project
2. Copy `.env.example` to `.env`
3. Add your **Neon connection string** to `DATABASE_URL` in `.env`
4. Generate `AUTH_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
5. Set up OAuth providers (see `SETUP_AUTH.md` for detailed instructions)
6. Install dotenv: `npm install --save-dev dotenv`
7. Run `npx prisma generate` to create Prisma client
8. Run `npx prisma migrate dev` to initialize database

**Important Notes:**
- Database uses **PostgreSQL** (Neon cloud) for both development and production
- Prisma 7 requires `dotenv` package to load `.env` file
- `prisma.config.ts` uses `override: true` to prevent env var caching issues

**See `SETUP_AUTH.md` for complete setup instructions.**

## Related Projects

This website showcases **StudyBible**, a Rust+Dioxus Bible study application:
- Repository: https://github.com/SujithChristopher/StudyBible
- Local path: `D:\personal_projects\StudyBible`
- Key features: 1000+ translations, parallel view, bookmarks, search
- Platforms: Windows, macOS, Linux, Android (in development)

## Build Output

Running `npm run build` generates:
- Static HTML files in `dist/` for SSG pages
- Server-side rendered pages for authentication routes
- Optimized CSS and JS bundles
- All assets copied from `public/`
- Ready for deployment to SSR-capable hosts

**Recommended Deployment: Vercel (FREE)**

1. **Install Vercel adapter:**
   ```bash
   npm install @astrojs/vercel
   ```

2. **Update `astro.config.mjs`:**
   ```javascript
   import vercel from '@astrojs/vercel/serverless';

   export default defineConfig({
     integrations: [tailwind(), auth()],
     output: 'server',
     adapter: vercel(), // Change from node()
   });
   ```

3. **Deploy:**
   ```bash
   npx vercel deploy
   ```

4. **Add environment variables in Vercel dashboard:**
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `AUTH_SECRET` - Your auth secret from `.env`
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (when configured)
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` (when configured)

**Alternative Platforms:**
- **Railway** (~$5/month) - Simple all-in-one platform
- **Render** (FREE tier with cold starts) - Good for getting started

**Deployment Requirements:**
- Node.js runtime for SSR pages
- Environment variables configured on host
- **Neon PostgreSQL database** accessible from deployment (same DB for dev & prod)
- OAuth redirect URIs updated for production domain
- Update OAuth callback URLs to production domain

## Additional Documentation

- **`SETUP_AUTH.md`**: Complete authentication setup guide with OAuth configuration, troubleshooting, and production deployment instructions
