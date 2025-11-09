import { cn } from '@/lib/utils'

/**
 * Button Hierarchy System
 *
 * Primary (Magenta) - Main action only, max 1 per section
 * Secondary (Outline) - Supporting actions
 * Tertiary (Ghost) - Less important actions
 * Destructive (Red) - Dangerous/delete actions
 */

export const buttonVariants = {
  // PRIMARY - Bold magenta, only for main CTA
  primary: cn(
    "bg-[#E8258E] hover:bg-[#D01A7A] active:bg-[#C4006D]",
    "text-white font-semibold",
    "shadow-lg hover:shadow-xl",
    "transition-all duration-200",
    "active:scale-95"
  ),

  // SECONDARY - Outline style for supporting actions
  secondary: cn(
    "border-2 border-[#E8258E]/30 hover:border-[#E8258E]/50",
    "text-[#E8258E] hover:text-[#D01A7A]",
    "bg-transparent hover:bg-[#E8258E]/5",
    "font-medium",
    "transition-all duration-200",
    "active:scale-95"
  ),

  // TERTIARY - Ghost style for tertiary actions
  tertiary: cn(
    "text-tmobile-gray-700 hover:text-tmobile-gray-900",
    "bg-transparent hover:bg-tmobile-gray-100",
    "font-medium",
    "transition-all duration-200",
    "active:scale-95"
  ),

  // DESTRUCTIVE - Red for delete/dangerous actions
  destructive: cn(
    "bg-red-600 hover:bg-red-700 active:bg-red-800",
    "text-white font-semibold",
    "shadow-lg hover:shadow-xl",
    "transition-all duration-200",
    "active:scale-95"
  ),

  // DESTRUCTIVE OUTLINE - Less aggressive destructive
  destructiveOutline: cn(
    "border-2 border-red-500/30 hover:border-red-500/50",
    "text-red-600 hover:text-red-700",
    "bg-transparent hover:bg-red-50",
    "font-medium",
    "transition-all duration-200",
    "active:scale-95"
  ),
}

export const buttonSizes = {
  xs: "px-2.5 py-1.5 text-xs rounded-md",
  sm: "px-3 py-2 text-sm rounded-lg",
  md: "px-4 py-2.5 text-base rounded-lg",
  lg: "px-6 py-3 text-lg rounded-xl",
}

/**
 * Helper to combine variant and size
 */
export function getButtonClass(
  variant: keyof typeof buttonVariants = 'primary',
  size: keyof typeof buttonSizes = 'md',
  additionalClasses?: string
) {
  return cn(
    buttonVariants[variant],
    buttonSizes[size],
    additionalClasses
  )
}
