'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface DataPoint {
  timestamp: Date
  network: number
  mobileApp: number
  billing: number
  homeInternet: number
}

interface SentimentTimelineProps {
  data: DataPoint[]
  singleLine?: string // If provided, only show this product area
  color?: string // Color for single line
}

export function SentimentTimeline({ data, singleLine, color }: SentimentTimelineProps) {
  // Transform data for Recharts
  const chartData = data.map((point) => ({
    time: format(point.timestamp, 'HH:mm'),
    Network: point.network,
    'Mobile App': point.mobileApp,
    Billing: point.billing,
    'Home Internet': point.homeInternet,
    ...point, // Include any other fields for single line mode
  }))

  const allProductAreas = [
    { name: 'Network', color: '#E8258E', key: 'Network' },
    { name: 'Mobile App', color: '#7C3E93', key: 'Mobile App' },
    { name: 'Billing', color: '#00A19C', key: 'Billing' },
    { name: 'Home Internet', color: '#F58220', key: 'Home Internet' },
  ]

  // If singleLine is specified, only show that line
  const productAreas = singleLine
    ? [{ name: singleLine, color: color || '#E8258E', key: singleLine }]
    : allProductAreas

  return (
    <div className="relative w-full h-[300px] overflow-hidden bg-gradient-to-br from-white to-gray-50/30 border-0 rounded-2xl shadow-xl p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-tmobile-magenta/5 to-purple-500/5" />
      <h3 className="relative text-lg font-bold text-[#E8258E] mb-4">
        Sentiment Timeline (24h)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="time"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={[-1, 1]}
            ticks={[-1, -0.5, 0, 0.5, 1]}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
            }}
            formatter={(value: number) => value.toFixed(2)}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          {productAreas.map((area) => (
            <Line
              key={area.key}
              type="monotone"
              dataKey={area.key}
              stroke={area.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: area.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
