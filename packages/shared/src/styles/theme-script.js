/**
 * Theme initialization script for Next.js layouts.
 * This script runs before React hydration to prevent flash of unstyled content.
 * It checks localStorage for a saved theme preference and falls back to system preference.
 */
export const themeScript = `
  (function() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
`
