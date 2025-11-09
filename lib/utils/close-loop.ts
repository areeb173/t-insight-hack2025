/**
 * Close-the-Loop Utilities
 * Functions for calculating and formatting sentiment recovery metrics
 */

export interface RecoveryMetrics {
  beforeSentiment: number
  afterSentiment?: number
  sentimentChange?: number
  beforeIntensity: number
  afterIntensity?: number
  intensityChange?: number
  signalCountBefore: number
  signalCountAfter?: number
}

export interface CloseLoopData {
  status: 'recovered' | 'monitoring' | 'not-recovered'
  monitoredAt: string
  recoveryMetrics: RecoveryMetrics
  timeline?: Array<{ timestamp: string; sentiment: number; intensity: number }>
}

/**
 * Calculate recovery status based on sentiment and intensity changes
 * @param baselineSentiment - Sentiment when marked done
 * @param currentSentiment - Current average sentiment
 * @param baselineIntensity - Intensity when marked done
 * @param currentIntensity - Current total intensity
 * @param markedDoneAt - Timestamp when marked done
 * @returns Recovery status
 */
export function calculateRecoveryStatus(
  baselineSentiment: number,
  currentSentiment: number,
  baselineIntensity: number,
  currentIntensity: number,
  markedDoneAt: string
): 'recovered' | 'monitoring' | 'not-recovered' {
  const daysSince = getDaysSinceDeployment(markedDoneAt)

  // Calculate changes
  const sentimentChange = currentSentiment - baselineSentiment
  const intensityChangePercent = baselineIntensity > 0
    ? ((baselineIntensity - currentIntensity) / baselineIntensity) * 100
    : 0

  // Recovery criteria: sentiment improved by ≥0.2 OR intensity dropped by ≥50%
  const sentimentImproved = sentimentChange >= 0.2
  const intensityDropped = intensityChangePercent >= 50

  if (sentimentImproved || intensityDropped) {
    return 'recovered'
  }

  // If within 72h window, still monitoring
  if (daysSince <= 3) {
    return 'monitoring'
  }

  // After 72h with no improvement
  return 'not-recovered'
}

/**
 * Calculate days since deployment (marked as done)
 * @param markedDoneAt - ISO timestamp
 * @returns Number of days since deployment
 */
export function getDaysSinceDeployment(markedDoneAt: string): number {
  const doneDate = new Date(markedDoneAt)
  const now = new Date()
  const diffMs = now.getTime() - doneDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Get hours remaining in monitoring window (72 hours)
 * @param markedDoneAt - ISO timestamp
 * @returns Hours remaining, or 0 if window expired
 */
export function getHoursRemaining(markedDoneAt: string): number {
  const doneDate = new Date(markedDoneAt)
  const now = new Date()
  const diffMs = now.getTime() - doneDate.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const hoursRemaining = Math.max(0, 72 - diffHours)
  return Math.floor(hoursRemaining)
}

/**
 * Format recovery metrics for display
 * @param metrics - Recovery metrics object
 * @returns Formatted string
 */
export function formatRecoveryMetrics(metrics: RecoveryMetrics): {
  sentimentText: string
  intensityText: string
  signalText: string
} {
  const sentimentChange = metrics.afterSentiment
    ? metrics.afterSentiment - metrics.beforeSentiment
    : 0

  const intensityChange = metrics.afterIntensity !== undefined
    ? metrics.beforeIntensity - metrics.afterIntensity
    : 0

  const intensityPercent = metrics.beforeIntensity > 0
    ? (intensityChange / metrics.beforeIntensity) * 100
    : 0

  const signalChange = metrics.signalCountAfter !== undefined
    ? metrics.signalCountBefore - metrics.signalCountAfter
    : 0

  return {
    sentimentText: sentimentChange >= 0
      ? `+${sentimentChange.toFixed(2)}`
      : sentimentChange.toFixed(2),
    intensityText: `${intensityPercent >= 0 ? '-' : '+'}${Math.abs(intensityPercent).toFixed(0)}%`,
    signalText: signalChange >= 0
      ? `-${signalChange} signals`
      : `+${Math.abs(signalChange)} signals`,
  }
}

/**
 * Get color class for recovery status badge
 * @param status - Recovery status
 * @returns Tailwind color classes
 */
export function getRecoveryColor(status: 'recovered' | 'monitoring' | 'not-recovered'): string {
  const colors = {
    'recovered': 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-700',
    'monitoring': 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700',
    'not-recovered': 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-700',
  }
  return colors[status]
}

/**
 * Get icon name for recovery status
 * @param status - Recovery status
 * @returns Icon name (lucide-react)
 */
export function getRecoveryIcon(status: 'recovered' | 'monitoring' | 'not-recovered'): string {
  const icons = {
    'recovered': 'CheckCircle2',
    'monitoring': 'Clock',
    'not-recovered': 'AlertTriangle',
  }
  return icons[status]
}

/**
 * Format recovery status for display
 * @param status - Recovery status
 * @returns Formatted status text
 */
export function formatRecoveryStatus(status: 'recovered' | 'monitoring' | 'not-recovered'): string {
  const formatted = {
    'recovered': 'Recovered',
    'monitoring': 'Monitoring',
    'not-recovered': 'Not Recovered',
  }
  return formatted[status]
}

/**
 * Get recovery badge text with metrics
 * @param closeLoopData - Close loop data object
 * @param markedDoneAt - Timestamp when marked done
 * @returns Badge display text
 */
export function getRecoveryBadgeText(
  closeLoopData: CloseLoopData,
  markedDoneAt: string
): string {
  const { status, recoveryMetrics } = closeLoopData

  switch (status) {
    case 'recovered': {
      const sentimentChange = recoveryMetrics.afterSentiment
        ? recoveryMetrics.afterSentiment - recoveryMetrics.beforeSentiment
        : 0
      return `✓ Recovered (${sentimentChange >= 0 ? '+' : ''}${sentimentChange.toFixed(2)} sentiment)`
    }
    case 'monitoring': {
      const hoursLeft = getHoursRemaining(markedDoneAt)
      const daysLeft = Math.ceil(hoursLeft / 24)
      return `⚠ Monitoring (${daysLeft}d remaining)`
    }
    case 'not-recovered': {
      return '❌ No Recovery'
    }
    default:
      return 'Unknown Status'
  }
}
