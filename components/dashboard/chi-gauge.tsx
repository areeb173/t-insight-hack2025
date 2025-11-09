'use client'

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

interface CHIGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function CHIGauge({ score, size = 'lg', showLabel = true }: CHIGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score))

  // Determine color based on score
  const getColor = (value: number) => {
    if (value < 40) return '#C4262E' // Red - Critical
    if (value < 70) return '#F59E0B' // Yellow - Warning
    return '#00A19C' // Teal - Good
  }

  const color = getColor(clampedScore)

  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 120, barSize: 12, fontSize: 'text-xl' },
    md: { width: 180, height: 180, barSize: 18, fontSize: 'text-3xl' },
    lg: { width: 240, height: 240, barSize: 24, fontSize: 'text-5xl' },
  }

  const config = sizeConfig[size]

  const data = [
    {
      name: 'CHI',
      value: clampedScore,
      fill: color,
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <RadialBarChart
          width={config.width}
          height={config.height}
          cx={config.width / 2}
          cy={config.height / 2}
          innerRadius={size === 'lg' ? 80 : size === 'md' ? 60 : 40}
          outerRadius={size === 'lg' ? 110 : size === 'md' ? 80 : 55}
          barSize={config.barSize}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#E5E7EB' }}
            clockWise
            dataKey="value"
            cornerRadius={size === 'lg' ? 10 : size === 'md' ? 8 : 6}
          />
        </RadialBarChart>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${config.fontSize}`} style={{ color }}>
            {Math.round(clampedScore)}
          </div>
          {showLabel && size !== 'sm' && (
            <div className="text-sm text-tmobile-gray-600 font-medium mt-1">
              CHI Score
            </div>
          )}
        </div>
      </div>

      {/* Status label */}
      {showLabel && (
        <div className="mt-3 text-center">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {clampedScore < 40 ? 'Critical' : clampedScore < 70 ? 'Warning' : 'Good'}
          </span>
        </div>
      )}
    </div>
  )
}
