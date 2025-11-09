/**
 * Standardized Icon Sizes
 *
 * Consistent icon sizing across the application for better visual harmony
 */

export const iconSizes = {
  xs: "h-3 w-3",      // Tiny icons (in badges, very small buttons)
  sm: "h-4 w-4",      // Small icons (in buttons, labels)
  md: "h-5 w-5",      // Medium icons (default for most UI)
  lg: "h-6 w-6",      // Large icons (section headers, emphasis)
  xl: "h-8 w-8",      // Extra large (hero sections, empty states)
  "2xl": "h-10 w-10", // Very large (loading states, major icons)
} as const

export type IconSize = keyof typeof iconSizes

/**
 * Get icon size class
 * @param size - Icon size key
 * @returns Tailwind size class
 */
export function getIconSize(size: IconSize = 'md'): string {
  return iconSizes[size]
}

/**
 * Standard icon usage guidelines:
 *
 * xs (h-3 w-3): Inside badges, very compact UI
 * sm (h-4 w-4): Button icons, dropdown icons, inline icons
 * md (h-5 w-5): Default for navigation, cards, tables
 * lg (h-6 w-6): Section headers, card titles, emphasis
 * xl (h-8 w-8): Empty states, modals, major UI elements
 * 2xl (h-10 w-10): Loading spinners, hero sections
 */
