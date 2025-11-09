'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import {
  getRecoveryColor,
  getRecoveryBadgeText,
  type CloseLoopData,
} from '@/lib/utils/close-loop'

interface RecoveryBadgeProps {
  closeLoopData: CloseLoopData
  markedDoneAt: string
  className?: string
}

export function RecoveryBadge({
  closeLoopData,
  markedDoneAt,
  className = '',
}: RecoveryBadgeProps) {
  const { status } = closeLoopData

  // Get styling and text
  const colorClass = getRecoveryColor(status)
  const badgeText = getRecoveryBadgeText(closeLoopData, markedDoneAt)

  // Get icon based on status
  const Icon = status === 'recovered'
    ? CheckCircle2
    : status === 'monitoring'
      ? Clock
      : AlertTriangle

  return (
    <Badge
      className={`${colorClass} border-2 shadow-md px-3 py-1.5 text-sm font-semibold flex items-center gap-2 backdrop-blur-sm ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span>{badgeText}</span>
    </Badge>
  )
}
