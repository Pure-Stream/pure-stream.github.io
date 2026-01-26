# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
WordWeb is a hybrid (SSR + SSG) marketing/showcase website for the StudyBible application (https://github.com/SujithChristopher/StudyBible). Built with Astro 5.16.6 and Tailwind CSS, it features a compact homepage, an interactive GitHub-style feedback system, and a complete authentication system powered by Supabase Auth. The site includes real-time feedback tracking and is designed to be clean, modern, and responsive.

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
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client initialization
│   │   └── api-utils.ts         # API authentication & response helpers
│   ├── middleware.ts            # Route protection middleware (Supabase Auth)
│   ├── layouts/
│   │   └── Layout.astro         # Base layout with meta tags, fonts, global styles
│   ├── pages/
│   │   ├── api/
│   │   │   └── feedback/
│   │   │       ├── list.ts                 # List all feedback
│   │   │       ├── create.ts               # Create new feedback
│   │   │       ├── [id].ts                 # Get feedback details
│   │   │       ├── [id]/comments/create.ts # Create comment on feedback
│   │   │       └── labels/list.ts          # List available labels
│   │   ├── index.astro          # Homepage (/) - SSR for session
│   │   ├── feedback.astro       # Feedback/Issues page (/feedback) - real-time data
│   │   ├── login.astro          # Login page (Supabase Auth)
│   │   ├── signup.astro         # User registration page (Supabase Auth)
│   │   ├── dashboard.astro      # Protected user dashboard
│   │   └── check-email.astro    # Email verification confirmation page
│   ├── components/
│   │   └── Navigation.astro     # Main navigation with auth state
│   └── config/
│       └── constants.ts         # App configuration & routes
└── .env                         # Environment variables (gitignored)
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

Complete authentication system built with **Supabase Auth** and **PostgreSQL**.

**Supported Authentication Methods:**

1. **Email/Password** - Credential-based authentication via Supabase (fully working)
2. **Google OAuth** - Sign in with Google account (optional, requires configuration)
3. **GitHub OAuth** - Sign in with GitHub account (optional, requires configuration)

### Supabase Auth Architecture

#### Authentication Flow

1. **Signup**: `supabase.auth.signUp()` creates user account with email and password
2. **Signin**: `supabase.auth.signInWithPassword()` validates credentials and creates session
3. **Session Management**: HTTP-only cookies store `sb-access-token` and `sb-refresh-token`
4. **Middleware Protection**: Validates session on protected routes
5. **Logout**: `supabase.auth.signOut()` clears session

#### Key Features

- **Automatic Token Management**: Supabase handles token refresh automatically
- **Email Verification**: Built-in email verification system (configurable in Supabase dashboard)
- **User Metadata**: Store user info (name, avatar) in `user_metadata` field
- **Row-Level Security**: Database-level access control via RLS policies
- **PKCE Flow**: Secure OAuth flow for browser-based authentication

#### Supabase Client (`src/lib/supabase.ts`)

Singleton Supabase client instance:
- Initialized with `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Used across all API routes and client-side code
- Manages authentication tokens automatically

**Dependencies:**

- `@supabase/supabase-js`: Official Supabase JavaScript client

### Database (`Supabase PostgreSQL`)

**Database Provider: PostgreSQL (Supabase)**
- Cloud-hosted PostgreSQL database via [Supabase](https://supabase.com)
- Free tier: 500MB storage, generous bandwidth
- Built-in authentication via `auth.users` table
- No migration files needed (managed via Supabase dashboard or direct SQL)

**Tables:**

1. **auth.users** (managed by Supabase Auth)
   - Built-in user management
   - Email, password (hashed), user_metadata, app_metadata
   - Email verification tracking

2. **WordWeb_feedback**
   - id (UUID, PK)
   - title (TEXT, ≥5 chars)
   - description (TEXT, ≥10 chars)
   - status (open/closed)
   - author_id (FK → auth.users)
   - created_at, updated_at, closed_at
   - Indexes on status, author_id, created_at

3. **WordWeb_comment**
   - id (UUID, PK)
   - feedback_id (FK → WordWeb_feedback)
   - author_id (FK → auth.users)
   - text (TEXT, 1-2000 chars)
   - created_at, updated_at

4. **WordWeb_label**
   - id (UUID, PK)
   - name (TEXT, UNIQUE)
   - color (Tailwind classes)
   - 8 predefined labels: bug, enhancement, feature, translations, export, ui, android, question

5. **WordWeb_feedback_label** (junction table)
   - feedback_id FK → WordWeb_feedback
   - label_id FK → WordWeb_label
   - Primary key: (feedback_id, label_id)

**Row Level Security (RLS)**

All tables have RLS enabled with policies:
- **WordWeb_feedback**: Anyone can SELECT, authenticated users can INSERT own feedback
- **WordWeb_comment**: Anyone can SELECT, authenticated users can INSERT own comments
- **WordWeb_label**: Anyone can SELECT (read-only)
- **WordWeb_feedback_label**: Anyone can SELECT, authors can INSERT for their feedback

### Middleware (`src/middleware.ts`)

Protects routes requiring authentication using Supabase Auth:

- Runs on every request before page rendering
- Checks for Supabase access token in `sb-access-token` cookie
- Calls `supabase.auth.getUser(accessToken)` to validate session
- Attaches user object to `context.locals.user` for use in pages
- Redirects unauthenticated users from protected routes (`/dashboard`, `/profile`)
- Works seamlessly with email/password and OAuth logins

**Session Validation:**

```typescript
// In middleware
const accessToken = context.cookies.get('sb-access-token')?.value;
const { data: { user } } = await supabase.auth.getUser(accessToken);

// In pages
const user = Astro.locals.user;
if (!user) return Astro.redirect('/login');
// Access user: user.email, user.user_metadata.name
```

**Type Definitions (`src/env.d.ts`):**

Defines TypeScript types for `Astro.locals.user` to provide IDE autocomplete and type checking.

### Authentication Pages

#### Login Page (`src/pages/login.astro`)

Beautiful, responsive login UI with:

- **Email/Password form**: Standard credentials input
- **Links**: "Forgot password?" and "Sign up" navigation
- **Glass morphism design**: Matches site aesthetic
- **Server-rendered**: `export const prerender = false`

**Form Actions:**

- Email/Password: Uses `supabase.auth.signInWithPassword({ email, password })`

**After Signin:**

- Session cookies automatically set by Supabase
- Client redirects to `/dashboard` on success
- Middleware validates session on protected routes

#### Signup Page (`src/pages/signup.astro`)
User registration with client-side validation:
- **Form fields**: Name, email, password, confirm password
- **Validation**: Password match check, minimum 8 characters
- **Client-side script**: Validates before submission, shows errors

**Validation Rules:**
- All fields required
- Password ≥ 8 characters
- Password confirmation must match
- Terms & conditions checkbox required

**Flow:**
1. User enters name, email, password
2. Calls `supabase.auth.signUp()` with email and password
3. Stores name in `user_metadata`
4. Redirects to `/check-email` page for confirmation

#### Dashboard Page (`src/pages/dashboard.astro`)
Protected user dashboard with:
- **Auth check**: Redirects if not authenticated
- **User greeting**: Displays user name or email from metadata
- **Stats grid**: Placeholder stats (study time, bookmarks, notes)
- **Account settings**: Profile info display (read-only)
- **Logout button**: Calls `supabase.auth.signOut()`
- **Download CTA**: Link back to homepage

**Protected by:**
1. Middleware check (redirects before page loads)
2. In-page auth check (double protection)

### Feedback System API

#### List Feedback (`/api/feedback/list?status=open&limit=50`)
GET endpoint to fetch all feedback with optional filtering:
- **Parameters**: `status` (open/closed), `limit` (default 50)
- **Returns**: Array of feedback with labels and comment count
- **Response**: `{ data: Feedback[] }`

#### Create Feedback (`/api/feedback/create`)
POST endpoint - **REQUIRES AUTHENTICATION**
- **Body**: `{ title, description, labelIds: string[] }`
- **Validation**: Title ≥5 chars, description ≥10 chars
- **Returns**: Created feedback object
- **Response codes**: 201 (success), 400 (validation), 401 (unauthorized), 500 (error)

#### Get Feedback Detail (`/api/feedback/[id]`)
GET endpoint to fetch single feedback with full details:
- **Returns**: Feedback object with comments array and label details
- **Response codes**: 200 (success), 404 (not found)

#### Create Comment (`/api/feedback/[id]/comments/create`)
POST endpoint - **REQUIRES AUTHENTICATION**
- **Body**: `{ text }`
- **Validation**: Text 1-2000 characters
- **Returns**: Created comment object
- **Response codes**: 201 (success), 400 (validation), 401 (unauthorized), 500 (error)

#### List Labels (`/api/feedback/labels/list`)
GET endpoint to fetch all available labels:
- **Returns**: Array of label objects with name and color
- **Used by**: Feedback creation form for label selection

### Session Management

Handled automatically by Supabase Auth:

- **Session tokens**: Stored in HTTP-only `sb-access-token` cookie
- **Refresh token**: Stored in `sb-refresh-token` cookie
- **Token refresh**: Automatic when near expiration
- **Session validation**: Called via middleware on every request
- **Secure cookies**: HTTPS required in production

### Security Features
1. **Password Hashing**: Handled by Supabase Auth (bcrypt)
2. **SQL Injection Protection**: Supabase ORM parameterized queries
3. **XSS Protection**: Input sanitization via Astro's template escaping
4. **Row Level Security**: Database-level access control via RLS policies
5. **Secure Cookies**: HTTP-only, secure flag in production
6. **Input Validation**: Supabase-level constraints (length, required fields)
7. **Route Protection**: Middleware prevents unauthorized access
8. **PKCE Flow**: Used for OAuth authentication

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
GitHub Issues-inspired interactive interface backed by real Supabase data.

**Architecture:**
- **Server-side**: Astro component renders initial HTML structure with auth check
- **Client-side**: `<script is:inline>` contains all interactive logic
  - Data loaded from `/api/feedback/*` endpoints
  - Dynamic rendering via `renderIssues()` and `renderIssueList()`
  - Event handlers for tabs, forms, modals, API calls

**Key Features:**
1. **Issue List View**:
   - Open/Closed tabs with live counters
   - Issues rendered with labels, metadata, comment counts
   - Click to open detail modal with full comments section

2. **Issue Creation** (requires login):
   - Form with title, description, label selection
   - Submits to `/api/feedback/create` API
   - Form validation (title ≥5 chars, description ≥10 chars)
   - Reloads data on success and shows confirmation

3. **Issue Detail Modal**:
   - Full overlay with scrollable content
   - Displays title, description, status, labels
   - Shows existing comments with author and timestamp
   - Comment input (requires authentication)

4. **Label Management**:
   - Labels loaded from database on page load
   - 8 predefined labels with Tailwind color classes
   - Label buttons generated dynamically from API data
   - Selection tracked in `selectedLabels` Set during form submission

**Important JavaScript Patterns:**
- Uses `getAttribute('data-*')` for data attributes
- All DOM queries check for `null` before manipulation
- Modal management with `hidden` class and `overflow` style
- Uses `is:inline` directive to prevent Astro from bundling/transforming script
- `async/await` for API calls with proper error handling

### Data Flow in Feedback Page
```
Page Load → loadData() → Fetch from APIs → renderIssues() → Display

User Action → Event Handler → API Call → loadData() → Re-render
```
Example: Creating a new issue:
1. User fills form (title, description, labels) and submits
2. Form submit handler calls `/api/feedback/create` with POST
3. Server validates and creates feedback + label associations
4. Client calls `loadData()` to refresh from server
5. Issues list re-renders with new feedback at top
6. Form resets and shows success alert

**Authentication Integration:**
- Unauthenticated users see "Login to Create Issue" button
- Login button links to `/login` page
- Authenticated users see "New Issue" button
- API endpoints check auth via middleware before allowing creation
- Comments require authentication (enforced via RLS policy)

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
3. Add route path to `protectedRoutes` array in `src/config/constants.ts`
4. Add auth check in page frontmatter:
   ```typescript
   const user = Astro.locals.user;
   if (!user) return Astro.redirect(ROUTES.LOGIN);
   ```

### Working with Database

**Using Supabase Client:**
```typescript
import { supabase } from '../lib/supabase';

// Query feedback
const { data, error } = await supabase
  .from('WordWeb_feedback')
  .select('*')
  .eq('status', 'open');

// Create feedback (authenticated)
const { data: newFeedback, error } = await supabase
  .from('WordWeb_feedback')
  .insert({ title, description, author_id: user.id })
  .select()
  .single();

// Update feedback
await supabase
  .from('WordWeb_feedback')
  .update({ status: 'closed' })
  .eq('id', feedbackId);
```

**Adding Database Tables:**
1. Go to Supabase dashboard → SQL Editor
2. Create migration with table schema
3. Enable Row Level Security (RLS) for access control
4. Create RLS policies for authenticated users
5. Add indexes for query performance

### Adding OAuth Providers

1. Go to Supabase dashboard → Authentication → Providers
2. Enable provider (Google, GitHub, etc.)
3. Add OAuth app credentials from provider console
4. Configure redirect URIs:
   - Development: `http://localhost:4321/auth/v1/callback`
   - Production: `https://your-domain.com/auth/v1/callback`
5. Test login flow via `/login` page

**OAuth Redirect URIs:**
- Supabase handles OAuth callbacks automatically
- Redirect URIs should point to `{SUPABASE_URL}/auth/v1/callback`
- Tokens set automatically in cookies after successful auth

### Working with Feedback Page JavaScript
**Important**: The feedback page uses inline JavaScript (`<script is:inline>`) to avoid Astro's bundling.

**When modifying:**
- Avoid TypeScript syntax (type assertions, interfaces)
- Use plain JavaScript with null checks
- Access data attributes via `getAttribute('data-*')`
- Use `async/await` for API calls with proper error handling
- Test form reset with `issueForm.reset` check before calling

**To add new feedback fields:**
1. Update API request body in form submit handler
2. Add form input in "New Issue Form" section
3. Capture new values in form submit handler
4. Include in API POST to `/api/feedback/create`
5. Update API endpoint to accept and validate new fields

**To modify displayed data:**
1. Update `renderIssueList()` template string for list view
2. Update `openIssueModal()` to display in modal view
3. Ensure API response includes the data (may need to update API endpoint)

**API Call Pattern:**
```javascript
const response = await fetch('/api/feedback/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title, description, labelIds })
});

if (!response.ok) {
  const error = await response.json();
  alert(error.error || 'Failed');
  return;
}

await loadData(); // Refresh from server
```

### Navigation Pattern
Navigation varies by page and authentication state:
- **Homepage**: Dynamic login/dashboard button based on session
- **Dashboard**: Shows user name and logout button
- Homepage links use anchor tags (`#features`, `#download`)
- Cross-page links use relative paths (`/feedback`, `/login`)
- External links use `target="_blank"` for GitHub

### Environment Setup
**Required for authentication:**
1. **Create Supabase Project**: Sign up at https://supabase.com and create a new project
2. Copy `.env.example` to `.env`
3. Add your **Supabase URL** to `SUPABASE_URL` in `.env`
4. Add your **Supabase Anon Key** to `SUPABASE_ANON_KEY` in `.env`
5. (Optional) Set up OAuth providers in Supabase dashboard:
   - Enable Google OAuth: Add credentials from Google Cloud Console
   - Enable GitHub OAuth: Add credentials from GitHub Developer Settings
   - Configure redirect URIs to your app domain
6. Run `npm install` to install dependencies
7. Run `npm run dev` to start development server

**Database Tables:**
- Supabase automatically creates `auth.users` table
- Run SQL migrations in Supabase dashboard to create feedback tables:
  ```sql
  -- Tables created via migration in Supabase dashboard
  -- See CLAUDE.md Database section for schema
  ```

**Important Notes:**
- Database uses **PostgreSQL** (Supabase cloud) for both development and production
- Auth tokens stored in HTTP-only cookies: `sb-access-token`, `sb-refresh-token`
- Supabase automatically handles token refresh
- Row Level Security (RLS) policies provide database-level access control

**Alternative: Use Existing Supabase Project**
- Project ID: `nfvfptldjwqzojrajuux` (StudyBible project)
- Tables already created with migrations and RLS policies
- Just add credentials to `.env` file

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

1. **Connect GitHub repository to Vercel** - Automatic deployments on push

2. **Add environment variables in Vercel dashboard:**
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (when configured)
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` (when configured)

3. **Configure OAuth redirect URIs:**
   - In Supabase dashboard → Authentication → Providers
   - Update redirect URI to: `https://your-domain.com/auth/v1/callback`

**Alternative Platforms:**
- **Railway** (~$5/month) - Simple all-in-one platform
- **Render** (FREE tier with cold starts) - Good for getting started
- **Netlify** (with Serverless Functions) - Good for edge functions

**Deployment Requirements:**
- Node.js runtime for SSR pages
- Environment variables configured on host
- **Supabase PostgreSQL database** accessible from deployment (same DB for dev & prod)
- OAuth redirect URIs updated for production domain
- Ensure SUPABASE_URL is accessible from the deployment region

**Post-Deployment Checklist:**
- [ ] Verify Supabase database connection from deployed app
- [ ] Test email/password authentication flow
- [ ] Test OAuth providers (if configured)
- [ ] Verify feedback creation and commenting work
- [ ] Check error logs for auth failures
- [ ] Test session persistence across page refreshes
