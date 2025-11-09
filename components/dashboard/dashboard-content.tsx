'use client'

import { useState } from 'react'
import { CHIGauge } from './chi-gauge'
import { ProductAreaCard } from './product-area-card'
import { EmergingIssuesTable } from './emerging-issues-table'
import { SentimentTimeline } from './sentiment-timeline'
import { SourceBreakdown } from './source-breakdown'
import { ProductAreaDetail } from './product-area-detail'

interface ProductArea {
  id: string
  name: string
  color: string
  chi: number
  trend: number
  signalCount: number
}

interface Issue {
  id: string
  topic: string
  intensity: number
  sentiment: number
  sourceCount: number
  productArea: string
}

interface DataPoint {
  timestamp: Date
  network: number
  mobileApp: number
  billing: number
  homeInternet: number
}

interface SourceData {
  name: string
  value: number
}

interface DashboardContentProps {
  overallCHI: number
  productAreas: ProductArea[]
  emergingIssues: Issue[]
  sentimentData: DataPoint[]
  sourceData: SourceData[]
}

export function DashboardContent({
  overallCHI,
  productAreas,
  emergingIssues,
  sentimentData,
  sourceData,
}: DashboardContentProps) {
  const [selectedProductArea, setSelectedProductArea] = useState<ProductArea | null>(null)

  const handleProductAreaClick = (areaName: string) => {
    const area = productAreas.find((a) => a.name === areaName)
    if (area) {
      setSelectedProductArea(area)
    }
  }

  const handleCreateOpportunity = (issueId: string) => {
    console.log(`Create opportunity for issue ${issueId}`)
    // TODO: Navigate to opportunity creation page or open modal
  }

  return (
    <div className="space-y-8">
      {/* Overall CHI Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-tmobile-magenta/5 border-0 rounded-2xl shadow-2xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-tmobile-magenta/5 via-transparent to-purple-500/5" />
        <div className="relative text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-tmobile-magenta via-purple-600 to-tmobile-magenta bg-clip-text text-transparent mb-2">
            Customer Happiness Index
          </h2>
          <p className="text-sm text-tmobile-gray-600 mb-6">
            Overall sentiment score across all product areas
          </p>
          <div className="flex justify-center">
            <CHIGauge score={overallCHI} size="lg" />
          </div>
        </div>
      </section>

      {/* Product Area Cards Grid */}
      <section>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent mb-6">
          Product Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productAreas.map((area) => (
            <ProductAreaCard
              key={area.id}
              name={area.name}
              color={area.color}
              chi={area.chi}
              trend={area.trend}
              signalCount={area.signalCount}
              onClick={() => handleProductAreaClick(area.name)}
            />
          ))}
        </div>
      </section>

      {/* Emerging Issues Table */}
      <section>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent mb-6">
          Top Emerging Issues (Last Hour)
        </h2>
        <EmergingIssuesTable
          issues={emergingIssues}
          onCreateOpportunity={handleCreateOpportunity}
        />
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentTimeline data={sentimentData} />
        <SourceBreakdown data={sourceData} />
      </section>

      {/* Product Area Detail Sheet */}
      <ProductAreaDetail
        productArea={selectedProductArea}
        isOpen={!!selectedProductArea}
        onClose={() => setSelectedProductArea(null)}
      />
    </div>
  )
}
