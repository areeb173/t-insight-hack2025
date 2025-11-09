/**
 * Number Formatting Utilities
 *
 * Consistent number formatting across the application for better readability
 */

/**
 * Format number with commas for thousands
 * @param num - Number to format
 * @returns Formatted string (e.g., 1,234)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format number with compact notation (K, M, B)
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format number intelligently - compact for large numbers, normal for small
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatSmart(num: number): string {
  if (num >= 10000) {
    return formatCompactNumber(num)
  }
  return formatNumber(num)
}

/**
 * Format percentage
 * @param num - Number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., 45.2%)
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100)
}

/**
 * Format currency
 * @param num - Number to format as currency
 * @param currency - Currency code (default: USD)
 * @returns Formatted string (e.g., $1,234.56)
 */
export function formatCurrency(num: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num)
}

/**
 * Format decimal number
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., 3.14)
 */
export function formatDecimal(num: number, decimals: number = 2): string {
  return num.toFixed(decimals)
}

/**
 * Format change/delta with sign
 * @param num - Change value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with +/- sign (e.g., +5.2, -3.1)
 */
export function formatChange(num: number, decimals: number = 1): string {
  const formatted = Math.abs(num).toFixed(decimals)
  return num >= 0 ? `+${formatted}` : `-${formatted}`
}

/**
 * Format file size
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., 1.5 MB)
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Format duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "2h 30m", "45m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }

  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}

/**
 * Format metric with automatic K/M/B suffix
 * Good for dashboard metrics
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatMetric(num: number): string {
  if (num === 0) return '0'
  if (num < 1000) return formatNumber(num)
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
  return `${(num / 1000000000).toFixed(1)}B`
}
