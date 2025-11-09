import { cn } from '@/lib/utils'

/**
 * Unified Badge System
 *
 * Consistent styling for all badges across the application
 */

// Base badge styles
const baseBadge = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors"

// Severity badges (for opportunities/epics)
export const severityBadges = {
  critical: cn(
    baseBadge,
    "bg-red-100 text-red-800 border-red-300"
  ),
  high: cn(
    baseBadge,
    "bg-orange-100 text-orange-800 border-orange-300"
  ),
  medium: cn(
    baseBadge,
    "bg-yellow-100 text-yellow-800 border-yellow-300"
  ),
  low: cn(
    baseBadge,
    "bg-blue-100 text-blue-800 border-blue-300"
  ),
}

// Status badges (for epic/opportunity status)
export const statusBadges = {
  new: cn(
    baseBadge,
    "bg-blue-100 text-blue-700 border-blue-200"
  ),
  'in-progress': cn(
    baseBadge,
    "bg-yellow-100 text-yellow-700 border-yellow-200"
  ),
  done: cn(
    baseBadge,
    "bg-green-100 text-green-700 border-green-200"
  ),
}

// Sentiment badges (for signals/feedback)
export const sentimentBadges = {
  positive: cn(
    baseBadge,
    "bg-emerald-100 text-emerald-800 border-emerald-300"
  ),
  neutral: cn(
    baseBadge,
    "bg-slate-100 text-slate-700 border-slate-300"
  ),
  negative: cn(
    baseBadge,
    "bg-rose-100 text-rose-800 border-rose-300"
  ),
}

// Priority badges (for user stories)
export const priorityBadges = {
  Critical: cn(
    baseBadge,
    "bg-red-100 text-red-800 border-red-300"
  ),
  High: cn(
    baseBadge,
    "bg-orange-100 text-orange-800 border-orange-300"
  ),
  Medium: cn(
    baseBadge,
    "bg-yellow-100 text-yellow-800 border-yellow-300"
  ),
  Low: cn(
    baseBadge,
    "bg-blue-100 text-blue-800 border-blue-300"
  ),
}

// Helper functions
export function getSeverityBadge(severity: 'low' | 'medium' | 'high' | 'critical') {
  return severityBadges[severity]
}

export function getStatusBadge(status: 'new' | 'in-progress' | 'done') {
  return statusBadges[status]
}

export function getSentimentBadge(sentiment: number) {
  if (sentiment >= 0.3) return sentimentBadges.positive
  if (sentiment >= -0.3) return sentimentBadges.neutral
  return sentimentBadges.negative
}

export function getSentimentLabel(sentiment: number) {
  if (sentiment >= 0.3) return 'Positive'
  if (sentiment >= -0.3) return 'Neutral'
  return 'Negative'
}

export function getPriorityBadge(priority: 'Low' | 'Medium' | 'High' | 'Critical') {
  return priorityBadges[priority]
}

export function formatStatus(status: 'new' | 'in-progress' | 'done') {
  const statusMap = {
    'new': 'New',
    'in-progress': 'In Progress',
    'done': 'Done',
  }
  return statusMap[status]
}

// RICE score color coding
export function getRICEColor(score: number) {
  if (score >= 100) return cn(baseBadge, "bg-green-100 text-green-800 border-green-300")
  if (score >= 50) return cn(baseBadge, "bg-blue-100 text-blue-800 border-blue-300")
  if (score >= 20) return cn(baseBadge, "bg-yellow-100 text-yellow-800 border-yellow-300")
  return cn(baseBadge, "bg-gray-100 text-gray-800 border-gray-300")
}
