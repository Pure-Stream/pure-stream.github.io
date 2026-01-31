/**
 * Application-wide constants and configuration values
 * Centralized location for magic strings and configuration
 */

// Route paths
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  GUIDE: '/guide',
  FEEDBACK: '/feedback',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const;

// Application metadata
export const APP_CONFIG = {
  NAME: 'PureStream\'s StudyBible',
  PLATFORM_NAME: 'PureStream',
  APP_NAME: 'StudyBible',
  DESCRIPTION: 'A modern, fast, and offline Bible study application built with Rust and Dioxus.',
  TAGLINE: 'Deepen your study with a modern native experience.',
  VERSION: '0.1.0-alpha',
  STATUS: 'Coming Soon',
  ICON: '📖',
  GITHUB_URL: 'https://github.com/Pure-Stream/StudyBible-Releases',
  RELEASES_URL: 'https://github.com/Pure-Stream/StudyBible-Releases/releases/latest',
  EVALUATION_NOTICE: '⚠️ These files are for evaluation purposes only. The application is currently in active development and has not been officially launched.',
} as const;

// Stats displayed on homepage
export const APP_STATS = {
  TRANSLATIONS: '1000+',
  LANGUAGES: '100+',
  PLATFORMS: '5',
} as const;

// Supported platforms
export const PLATFORMS = [
  { name: 'Windows x86_64', icon: '🪟', requirement: '.zip archive', status: 'Available', downloadUrl: 'https://github.com/Pure-Stream/StudyBible-Releases/releases/latest' },
  { name: 'Linux x86_64', icon: '🐧', requirement: '.tar.gz archive', status: 'Available', downloadUrl: 'https://github.com/Pure-Stream/StudyBible-Releases/releases/latest' },
  { name: 'Android', icon: '🤖', requirement: '.apk package', status: 'Available', downloadUrl: 'https://github.com/Pure-Stream/StudyBible-Releases/releases/latest' },
  { name: 'macOS', icon: '🍎', requirement: 'macOS 10.15+', status: 'Coming Soon' },
  { name: 'iPhone & iPad', icon: '📱', requirement: 'iOS / iPadOS', status: 'Coming Soon' },
  { name: 'Linux ARM64', icon: '🐧', requirement: 'ARM architecture', status: 'Coming Soon' },
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
