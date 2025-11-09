'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { formatRecoveryMetrics, type CloseLoopData } from '@/lib/utils/close-loop'

interface RecoveryChartProps {
  closeLoopData: CloseLoopData
  markedDoneAt: string
  baselineSentiment: number
  className?: string
}

export function RecoveryChart({
  closeLoopData,
  markedDoneAt,
  baselineSentiment,
  className = '',
}: RecoveryChartProps) {
  const { timeline, recoveryMetrics } = closeLoopData

  // Format timeline data for chart
  const chartData = timeline
    ? timeline.map((point) => ({
        timestamp: new Date(point.timestamp).getTime(),
        sentiment: point.sentiment,
        formattedTime: format(new Date(point.timestamp), 'MMM d, h:mm a'),
      }))
    : []

  // Add baseline point at deployment time
  const deploymentTime = new Date(markedDoneAt).getTime()
  const dataWithBaseline = [
    {
      timestamp: deploymentTime,
      sentiment: baselineSentiment,
      formattedTime: format(new Date(markedDoneAt), 'MMM d, h:mm a'),
      isDeployment: true,
    },
    ...chartData,
  ].sort((a, b) => a.timestamp - b.timestamp)

  // Get formatted metrics
  const metrics = formatRecoveryMetrics(recoveryMetrics)

  if (dataWithBaseline.length === 0) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-xl p-6 shadow-xl ${className}`}>
        <h4 className="text-lg font-semibold text-[#E8258E] mb-4">
          Sentiment Recovery Timeline
        </h4>
        <p className="text-sm text-tmobile-gray-600">
          No recovery data available yet. Data will appear as new signals are collected.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-xl p-6 shadow-xl ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-[#E8258E] mb-2">
          Sentiment Recovery Timeline
        </h4>
        <p className="text-sm text-tmobile-gray-600">
          Tracking customer sentiment before and after solution deployment
        </p>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-200">
          <div className="text-xs text-blue-600 font-medium mb-1">Sentiment Change</div>
          <div className="text-xl font-bold text-blue-700">{metrics.sentimentText}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-3 border border-purple-200">
          <div className="text-xs text-purple-600 font-medium mb-1">Intensity Change</div>
          <div className="text-xl font-bold text-purple-700">{metrics.intensityText}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-3 border border-green-200">
          <div className="text-xs text-green-600 font-medium mb-1">Signal Change</div>
          <div className="text-xl font-bold text-green-700">{metrics.signalText}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dataWithBaseline}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#00A19C"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#00A19C"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={[-1, 1]}
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-lg p-3 shadow-xl">
                      <p className="text-xs font-semibold text-tmobile-gray-800 mb-1">
                        {data.formattedTime}
                      </p>
                      <p className="text-sm text-tmobile-gray-600">
                        Sentiment: <span className="font-bold">{data.sentiment.toFixed(2)}</span>
                      </p>
                      {data.isDeployment && (
                        <p className="text-xs text-[#E8258E] font-semibold mt-1">
                          ✓ Solution Deployed
                        </p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              content={() => (
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00A19C]" />
                    <span className="text-xs text-tmobile-gray-600">Sentiment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-[#E8258E] border-dashed" />
                    <span className="text-xs text-tmobile-gray-600">Deployment</span>
                  </div>
                </div>
              )}
            />
            {/* Deployment line */}
            <ReferenceLine
              x={deploymentTime}
              stroke="#E8258E"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Solution Deployed',
                position: 'top',
                fill: '#E8258E',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            />
            {/* Zero sentiment line */}
            <ReferenceLine
              y={0}
              stroke="#6B7280"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#00A19C"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#sentimentGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Explanation */}
      <div className="mt-4 text-xs text-tmobile-gray-500 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Positive sentiment (&gt;0)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Negative sentiment (&lt;0)</span>
        </div>
      </div>
    </div>
  )
}
