'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface SourceData {
  name: string
  value: number
}

interface SourceBreakdownProps {
  data: SourceData[]
}

const COLORS = [
  '#E8258E', // T-Mobile Magenta
  '#7C3E93', // Purple
  '#00A19C', // Teal
  '#F58220', // Orange
  '#4F46E5', // Indigo
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
]

export function SourceBreakdown({ data }: SourceBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
  }))

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: '600' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="relative w-full h-[300px] overflow-hidden bg-gradient-to-br from-white to-gray-50/30 border-0 rounded-2xl shadow-xl p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-tmobile-magenta/5" />
      <h3 className="relative text-lg font-bold text-[#E8258E] mb-4">
        Source Breakdown
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} signals (${props.payload.percentage}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
