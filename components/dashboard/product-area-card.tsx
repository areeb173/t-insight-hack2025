'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHIGauge } from './chi-gauge'
import { cardVariants, getProductAreaAccent } from '@/lib/utils/card-styles'
import { cn } from '@/lib/utils'

interface ProductAreaCardProps {
  name: string
  color: string
  chi: number
  trend: number // Positive = up, negative = down, 0 = flat
  signalCount: number
  onClick?: () => void
}

export function ProductAreaCard({
  name,
  color,
  chi,
  trend,
  signalCount,
  onClick,
}: ProductAreaCardProps) {
  const getTrendIcon = () => {
    if (trend > 0) return <ArrowUp className="h-4 w-4" />
    if (trend < 0) return <ArrowDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getTrendText = () => {
    if (trend === 0) return '0 pts'
    const sign = trend > 0 ? '+' : ''
    return `${sign}${trend} pts`
  }

  return (
    <Card
      className={cn(cardVariants.interactive, 'relative overflow-hidden')}
      style={getProductAreaAccent(color)}
      onClick={onClick}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
        }}
      />

      {/* Top Color Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <div className="relative">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-tmobile-black flex items-center justify-between">
            <span>{name}</span>
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
            />
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini CHI Gauge */}
        <div className="flex justify-center">
          <CHIGauge score={chi} size="sm" showLabel={false} />
        </div>

        {/* CHI with Trend */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-tmobile-gray-600">CHI Score</div>
            <div className="text-2xl font-bold" style={{ color }}>
              {Math.round(chi)}
            </div>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-semibold">{getTrendText()}</span>
          </div>
        </div>

        {/* Signal Count */}
        <div className="pt-3 border-t border-tmobile-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-tmobile-gray-600">Signals</span>
            <span className="text-sm font-semibold text-tmobile-black">
              {signalCount}
            </span>
          </div>
        </div>

        {/* Hover effect indicator */}
        <div className="text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
          Click to drill down →
        </div>
      </CardContent>
      </div>
    </Card>
  )
}
