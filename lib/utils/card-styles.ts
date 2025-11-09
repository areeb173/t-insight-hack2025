import { cn } from '@/lib/utils'

/**
 * Standardized card styles for consistent visual design
 * Use these classes to ensure all cards follow the same patterns
 */

// Base card classes - glass morphism effect
export const baseCard = cn(
  'bg-white/95 backdrop-blur-sm',
  'border border-tmobile-gray-200',
  'shadow-xl',
  'rounded-xl',
  'transition-all duration-300'
)

// Card variants
export const cardVariants = {
  // Default glass card - most common
  default: baseCard,

  // Elevated card - for important sections
  elevated: cn(
    baseCard,
    'shadow-2xl border-2'
  ),

  // Interactive card - with hover effects
  interactive: cn(
    baseCard,
    'cursor-pointer hover-lift active-press',
    'hover:shadow-2xl hover:border-tmobile-gray-300'
  ),

  // Gradient card - with subtle gradient overlay
  gradient: cn(
    baseCard,
    'relative overflow-hidden'
  ),

  // Metric card - for stats and numbers
  metric: cn(
    'bg-white/80 backdrop-blur-sm',
    'rounded-xl p-4',
    'border border-tmobile-gray-200',
    'hover:shadow-lg transition-shadow'
  ),

  // Section card - for grouping content
  section: cn(
    'bg-gradient-to-br from-white via-white to-tmobile-magenta/5',
    'border-0 rounded-2xl shadow-2xl',
    'relative overflow-hidden'
  ),
}

// Card padding variants
export const cardPadding = {
  none: '',
  sm: 'p-4',
  default: 'p-6',
  lg: 'p-8',
}

// Gradient overlays for cards (use with gradient variant)
export const gradientOverlay = {
  magenta: 'absolute inset-0 bg-gradient-to-br from-transparent via-tmobile-magenta/5 to-purple-500/5 pointer-events-none',
  subtle: 'absolute inset-0 bg-gradient-to-br from-tmobile-magenta/5 via-transparent to-purple-500/5',
  hero: 'absolute inset-0 bg-gradient-to-br from-tmobile-magenta/5 via-transparent to-purple-500/5',
}

// Product area accent (colored left border)
export function getProductAreaAccent(color: string) {
  return {
    borderLeftWidth: '6px',
    borderLeftColor: color,
  }
}

// Helper function to build card classes
export function buildCardClasses(
  variant: keyof typeof cardVariants = 'default',
  padding: keyof typeof cardPadding = 'default',
  className?: string
) {
  return cn(
    cardVariants[variant],
    cardPadding[padding],
    className
  )
}
