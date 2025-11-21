/**
 * Application-wide constants and configuration values
 * Centralized location for magic strings and configuration
 */

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  FEEDBACK: '/feedback',
  PROFILE: '/profile',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const;

// API endpoints
export const API_ROUTES = {
  SIGNUP: '/api/auth/signup',
  SIGNIN: '/api/auth/signin',
  SIGNOUT: '/api/auth/signout',
  GOOGLE_SIGNIN: '/api/auth/signin/google',
  GITHUB_SIGNIN: '/api/auth/signin/github',
  CALLBACK_CREDENTIALS: '/api/auth/callback/credentials',
} as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
] as const;

// Authentication configuration
export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
} as const;

// Application metadata
export const APP_CONFIG = {
  NAME: 'StudyBible',
  DESCRIPTION: 'Native Bible study application built with Rust',
  TAGLINE: '1000+ translations · Parallel view · Fast & offline',
  ICON: '📖',
  GITHUB_URL: 'https://github.com/SujithChristopher/StudyBible',
} as const;

// Stats displayed on homepage
export const APP_STATS = {
  TRANSLATIONS: '1000+',
  BOOKS: '66',
  PLATFORMS: '4',
  FREE_PERCENTAGE: '100%',
} as const;

// Supported platforms
export const PLATFORMS = [
  { name: 'Windows', icon: '🪟', requirement: 'Windows 10+' },
  { name: 'macOS', icon: '🍎', requirement: 'macOS 10.15+' },
  { name: 'Linux', icon: '🐧', requirement: 'All distributions' },
  { name: 'Android', icon: '🤖', requirement: 'Coming Soon' },
] as const;

// Technology stack
export const TECH_STACK = [
  { name: 'Rust', icon: '🦀', description: 'Performance & Safety', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  { name: 'Dioxus', icon: 'Dx', description: 'Reactive UI', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  { name: 'Tailwind', icon: '🎨', description: 'Modern Styling', bgColor: 'bg-sky-100 dark:bg-sky-900/30' },
  { name: 'Tokio', icon: '⚡', description: 'Async Runtime', bgColor: 'bg-green-100 dark:bg-green-900/30' },
] as const;

// Feature list for homepage
export const FEATURES = [
  {
    icon: '🌍',
    title: '1000+ Translations',
    description: '100+ languages with offline support',
  },
  {
    icon: '↔️',
    title: 'Parallel View',
    description: 'Compare translations side-by-side',
  },
  {
    icon: '🔍',
    title: 'Smart Search',
    description: 'Find verses instantly across translations',
  },
  {
    icon: '🔖',
    title: 'Bookmarks & Notes',
    description: 'Save verses with personal annotations',
  },
  {
    icon: '🎨',
    title: 'Dark Mode',
    description: 'Beautiful themes for any lighting',
  },
  {
    icon: '⚡',
    title: 'Native Performance',
    description: 'Built with Rust for blazing speed',
  },
] as const;

// Theme configuration
export const THEME_CONFIG = {
  STORAGE_KEY: 'theme',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Type exports for better TypeScript support
export type RouteKey = keyof typeof ROUTES;
export type Route = typeof ROUTES[RouteKey];
export type ProtectedRoute = typeof PROTECTED_ROUTES[number];
