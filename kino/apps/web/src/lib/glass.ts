/**
 * Shared "glass" material: dark, blurred and contrast-fixed.
 *
 * - `dark` scopes the dark theme tokens to the element and its children, so text,
 *   muted text, outline buttons, etc. stay readable in BOTH light and dark mode.
 * - The `dark:` duplicates make sure shadcn variants (e.g. `dark:bg-input/30`)
 *   can't override the material when the app itself is in dark mode.
 *
 * Tailwind picks these classes up because this file lives under `src/`.
 */
export const glass =
  "dark border-white/10 bg-black/45 text-foreground backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-black/45";

/** Same material, with a hover state for buttons and other interactive elements. */
export const glassInteractive = `${glass} hover:bg-black/60 dark:hover:bg-black/60 aria-expanded:bg-black/60`;