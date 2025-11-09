'use client'

import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CHIGauge } from './chi-gauge'
import { SentimentTimeline } from './sentiment-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductArea {
  id: string
  name: string
  color: string
  chi: number
  trend: number
  signalCount: number
}

interface ProductAreaDetailProps {
  productArea: ProductArea | null
  isOpen: boolean
  onClose: () => void
}

export function ProductAreaDetail({
  productArea,
  isOpen,
  onClose,
}: ProductAreaDetailProps) {
  if (!productArea) return null

  // Generate mock sentiment data specific to this product area
  const now = new Date()
  const areasentimentData = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
    const baseValue = (productArea.chi - 50) / 100 // Convert CHI to sentiment scale
    return {
      timestamp,
      [productArea.name]: baseValue + (Math.random() - 0.5) * 0.3,
    }
  })

  const getTrendIcon = () => {
    if (productArea.trend > 0)
      return <TrendingUp className="h-5 w-5 text-green-600" />
    if (productArea.trend < 0)
      return <TrendingDown className="h-5 w-5 text-red-600" />
    return <Minus className="h-5 w-5 text-gray-600" />
  }

  const getTrendText = () => {
    if (productArea.trend > 0) return `+${productArea.trend}% vs last hour`
    if (productArea.trend < 0) return `${productArea.trend}% vs last hour`
    return 'No change vs last hour'
  }

  // Mock metrics
  const metrics = [
    {
      label: 'Active Signals',
      value: productArea.signalCount,
      change: productArea.trend,
      icon: AlertCircle,
    },
    {
      label: 'Resolved Issues',
      value: Math.floor(productArea.signalCount * 0.6),
      change: 12,
      icon: CheckCircle2,
    },
    {
      label: 'Avg Response Time',
      value: '2.3h',
      change: -15,
      icon: TrendingDown,
    },
  ]

  // Mock top issues for this area
  const topIssues = [
    {
      topic: `${productArea.name} connectivity issues`,
      intensity: 85,
      sentiment: -0.7,
    },
    {
      topic: `Slow ${productArea.name.toLowerCase()} performance`,
      intensity: 67,
      sentiment: -0.5,
    },
    {
      topic: `${productArea.name} feature requests`,
      intensity: 45,
      sentiment: 0.2,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 gap-0 border-0 shadow-2xl rounded-2xl">
        {/* Colored top border */}
        <div
          className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl"
          style={{ backgroundColor: productArea.color }}
        />

        {/* Header with gradient */}
        <div
          className="relative px-8 pt-8 pb-6 overflow-hidden mt-2"
          style={{
            background: `linear-gradient(135deg, ${productArea.color}10 0%, ${productArea.color}05 50%, transparent 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent backdrop-blur-sm" />
          <DialogHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{
                      backgroundColor: productArea.color,
                      boxShadow: `0 0 20px ${productArea.color}60`
                    }}
                  />
                  <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-tmobile-black to-tmobile-gray-700 bg-clip-text text-transparent">
                    {productArea.name}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 ml-7">
                  {getTrendIcon()}
                  <span className="text-sm font-semibold text-tmobile-gray-700">
                    {getTrendText()}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] px-8 py-6 space-y-6 bg-gradient-to-b from-transparent to-gray-50/30">
          {/* CHI Score and Key Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHI Score Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent">
                  Customer Happiness Index
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <CHIGauge score={productArea.chi} size="md" />
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50/50 hover:shadow-xl transition-all hover:scale-105"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-3 rounded-xl shadow-md"
                        style={{
                          backgroundColor: `${productArea.color}15`,
                        }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: productArea.color }}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-tmobile-gray-600">
                          {metric.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-tmobile-black">
                            {metric.value}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              metric.change > 0
                                ? 'text-green-600 border-green-200 bg-green-50'
                                : metric.change < 0
                                ? 'text-red-600 border-red-200 bg-red-50'
                                : 'text-gray-600 border-gray-200 bg-gray-50'
                            }
                          >
                            {metric.change > 0 ? '+' : ''}
                            {metric.change}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            </div>
          </div>

          {/* Sentiment Timeline - Single Line */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30 overflow-hidden">
            <div
              className="h-1 w-full"
              style={{ backgroundColor: productArea.color }}
            />
            <CardHeader>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent">
                Sentiment Trend (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <SentimentTimeline
                  data={areasentimentData as any}
                  singleLine={productArea.name}
                  color={productArea.color}
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Issues */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/50 overflow-hidden">
            <div
              className="h-1 w-full"
              style={{ backgroundColor: productArea.color }}
            />
            <CardHeader>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent">
                Top Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topIssues.map((issue, index) => (
                  <div
                    key={index}
                    className="relative p-5 rounded-xl bg-gradient-to-r from-white via-gray-50/50 to-white border-l-4 shadow-md hover:shadow-lg transition-all hover:translate-x-1"
                    style={{ borderLeftColor: productArea.color }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-tmobile-black flex-1">
                        {issue.topic}
                      </h4>
                      <Badge
                        variant="outline"
                        className="font-bold"
                        style={{
                          borderColor: productArea.color,
                          color: productArea.color,
                          backgroundColor: `${productArea.color}10`,
                        }}
                      >
                        Intensity: {issue.intensity}
                      </Badge>
                    </div>
                    <Badge
                      className={
                        issue.sentiment >= 0
                          ? 'text-green-700 bg-green-50 border border-green-200'
                          : 'text-red-700 bg-red-50 border border-red-200'
                      }
                    >
                      Sentiment: {issue.sentiment.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="border-0 shadow-xl overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(135deg, ${productArea.color} 0%, transparent 100%)`,
              }}
            />
            <div
              className="h-1 w-full"
              style={{ backgroundColor: productArea.color }}
            />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent">
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center mt-0.5 shadow-md"
                    style={{
                      backgroundColor: productArea.color,
                      boxShadow: `0 0 15px ${productArea.color}40`
                    }}
                  >
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="text-sm font-medium text-tmobile-gray-800 flex-1">
                    Investigate top emerging issue with highest intensity
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center mt-0.5 shadow-md"
                    style={{
                      backgroundColor: productArea.color,
                      boxShadow: `0 0 15px ${productArea.color}40`
                    }}
                  >
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span className="text-sm font-medium text-tmobile-gray-800 flex-1">
                    Create opportunity to address connectivity concerns
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center mt-0.5 shadow-md"
                    style={{
                      backgroundColor: productArea.color,
                      boxShadow: `0 0 15px ${productArea.color}40`
                    }}
                  >
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span className="text-sm font-medium text-tmobile-gray-800 flex-1">
                    Review feature requests for potential quick wins
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
