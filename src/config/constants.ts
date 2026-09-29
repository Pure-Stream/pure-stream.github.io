export const APP_CONFIG = {
  NAME: 'StudyBible',
  DEVELOPER: 'PureStream',
  GITHUB_URL: 'https://github.com/Pure-Stream/StudyBible-Releases',
  RELEASES_URL: 'https://github.com/Pure-Stream/StudyBible-Releases/releases/latest',
} as const;

export const NAV_ITEMS = [
  { label: 'Overview', href: '/', id: 'home' },
  { label: 'Features', href: '/guide/', id: 'guide' },
  { label: 'About', href: '/about/', id: 'about' },
  { label: 'Feedback', href: '/feedback/', id: 'feedback' },
] as const;

export const FEATURES = [
  { number: '01', title: 'A quieter reading space', description: 'Read scripture in a focused layout with themes and type settings that stay out of the way.' },
  { number: '02', title: 'Study across translations', description: 'Switch translations, compare passages side by side, and keep reference close to the text.' },
  { number: '03', title: 'Keep your place', description: 'Save bookmarks, highlight verses, and add notes that remain available offline.' },
  { number: '04', title: 'Sync when you want to', description: 'Sign in to carry bookmarks, highlights, and notes between supported devices.' },
] as const;

export const PLATFORMS = [
  { name: 'Windows', detail: 'Desktop build', available: true },
  { name: 'Linux', detail: 'Desktop build', available: true },
  { name: 'Android', detail: 'Mobile build', available: true },
  { name: 'macOS', detail: 'In development', available: false },
  { name: 'iPhone & iPad', detail: 'In development', available: false },
] as const;
