'use client'

import { useState } from 'react'
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
import { ChevronDown } from 'lucide-react'

interface DataPoint {
  timestamp: Date
  network: number
  mobileApp: number
  billing: number
  homeInternet: number
}

type TimeRange = '24h' | '7d' | '30d'

interface SentimentTimelineProps {
  data: DataPoint[]
  singleLine?: string // If provided, only show this product area
  color?: string // Color for single line
  onTimeRangeChange?: (range: TimeRange) => void
  timeRange?: TimeRange
}

export function SentimentTimeline({ 
  data, 
  singleLine, 
  color,
  onTimeRangeChange,
  timeRange: externalTimeRange
}: SentimentTimelineProps) {
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>('24h')
  const [isOpen, setIsOpen] = useState(false)
  
  const timeRange = externalTimeRange || internalTimeRange
  
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ]

  const handleTimeRangeChange = (range: TimeRange) => {
    if (externalTimeRange) {
      onTimeRangeChange?.(range)
    } else {
      setInternalTimeRange(range)
      onTimeRangeChange?.(range)
    }
    setIsOpen(false)
  }

  // Transform data for Recharts with appropriate time formatting
  const getTimeFormat = () => {
    switch (timeRange) {
      case '24h':
        return (date: Date) => format(date, 'HH:mm')
      case '7d':
        return (date: Date) => format(date, 'MMM dd')
      case '30d':
        return (date: Date) => format(date, 'MMM dd')
      default:
        return (date: Date) => format(date, 'HH:mm')
    }
  }

  const timeFormatter = getTimeFormat()
  const chartData = data && data.length > 0 ? data.map((point) => ({
    time: timeFormatter(point.timestamp),
    Network: point.network,
    'Mobile App': point.mobileApp,
    Billing: point.billing,
    'Home Internet': point.homeInternet,
    ...point, // Include any other fields for single line mode
  })) : []

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

  const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange)

  return (
    <div className="relative w-full h-[300px] overflow-hidden bg-gradient-to-br from-white to-gray-50/30 border-0 rounded-2xl shadow-xl p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-tmobile-magenta/5 to-purple-500/5" />
      <div className="relative flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#E8258E]">
          Sentiment Timeline
        </h3>
        
        {/* Animated Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/80 hover:bg-white border border-tmobile-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#E8258E]/30 group"
          >
            <span className="text-sm font-medium text-tmobile-black">
              {selectedOption?.label}
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-tmobile-gray-600 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              } group-hover:text-[#E8258E]`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div className="absolute right-0 mt-2 w-36 bg-white border border-tmobile-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeRangeChange(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                      timeRange === option.value
                        ? 'bg-[#E8258E]/10 text-[#E8258E] font-semibold'
                        : 'text-tmobile-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {/* Click outside to close dropdown */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
            </>
          )}
        </div>
      </div>
      <div className="relative" style={{ height: '220px' }}>
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
    </div>
  )
}
