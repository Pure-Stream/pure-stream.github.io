/**
 * Theme management utilities
 * Centralized theme toggle and initialization logic
 */

import { THEME_CONFIG } from '../config/constants';

type Theme = typeof THEME_CONFIG.LIGHT | typeof THEME_CONFIG.DARK;

/**
 * Get the current theme from localStorage or system preference
 */
export function getInitialTheme(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
  if (stored === THEME_CONFIG.DARK || stored === THEME_CONFIG.LIGHT) {
    return stored;
  }

  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEME_CONFIG.DARK;
  }

  return THEME_CONFIG.LIGHT;
}

/**
 * Apply theme to the document
 */
export function applyTheme(theme: Theme): void {
  const html = document.documentElement;

  if (theme === THEME_CONFIG.DARK) {
    html.classList.add(THEME_CONFIG.DARK);
  } else {
    html.classList.remove(THEME_CONFIG.DARK);
  }

  localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
}

/**
 * Initialize theme on page load
 * Should be called as early as possible to prevent flash
 */
export function initTheme(): void {
  const theme = getInitialTheme();
  applyTheme(theme);
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): void {
  const html = document.documentElement;
  const isDark = html.classList.contains(THEME_CONFIG.DARK);
  const newTheme = isDark ? THEME_CONFIG.LIGHT : THEME_CONFIG.DARK;

  applyTheme(newTheme);
}

/**
 * Get current active theme
 */
export function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains(THEME_CONFIG.DARK)
    ? THEME_CONFIG.DARK
    : THEME_CONFIG.LIGHT;
}

/**
 * Check if dark mode is active
 */
export function isDarkMode(): boolean {
  return getCurrentTheme() === THEME_CONFIG.DARK;
}

/**
 * Setup theme toggle button
 * Call this after DOM is loaded
 */
export function setupThemeToggle(buttonId: string = 'themeToggle'): void {
  const button = document.getElementById(buttonId);

  if (button) {
    button.addEventListener('click', toggleTheme);
  }
}
