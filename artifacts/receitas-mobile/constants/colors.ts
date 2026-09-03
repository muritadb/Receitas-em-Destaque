/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#19352d',
    tint: '#ef6b4d',

    // Core surfaces
    background: '#fcf9f2',
    foreground: '#19352d',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#19352d',

    // Primary action color (buttons, links, active states)
    primary: '#ef6b4d',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#f3e8d7',
    secondaryForeground: '#19352d',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#eee8dc',
    mutedForeground: '#7f8177',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#dbe7d8',
    accentForeground: '#19352d',

    // Destructive actions (delete, error states)
    destructive: '#d84f43',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#e8e0d4',
    input: '#e8e0d4',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
