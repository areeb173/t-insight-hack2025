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

interface OutageSummary {
  totalReports: number
  affectedCities: number
  criticalCount: number
  highCount: number
  mediumCount?: number
  lowCount?: number
  status: string
}

interface OutageData {
  data: unknown[]
  summary: OutageSummary
}

interface DashboardContentProps {
  overallCHI: number
  productAreas: ProductArea[]
  emergingIssues: Issue[]
  sentimentData: DataPoint[]
  sourceData: SourceData[]
  outageData?: OutageData
}

export function DashboardContent({
  overallCHI,
  productAreas,
  emergingIssues,
  sentimentData,
  sourceData,
  outageData,
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
          <h2 className="text-3xl font-bold text-[#E8258E] mb-2">
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

      {/* Outage Metrics Section */}
      {outageData && outageData.summary.totalReports > 0 && (
        <section className="bg-white rounded-2xl shadow-xl p-6 border border-tmobile-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#E8258E] mb-1">
                Network Status
              </h2>
              <p className="text-sm text-tmobile-gray-600">
                Real-time outage reports from DownDetector and Outage.Report
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                outageData.summary.status === 'Major Outage'
                  ? 'bg-red-100 text-red-800'
                  : outageData.summary.status === 'Widespread Issues'
                  ? 'bg-orange-100 text-orange-800'
                  : outageData.summary.status === 'Service Degradation'
                  ? 'bg-yellow-100 text-yellow-800'
                  : outageData.summary.status === 'Minor Issues'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {outageData.summary.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-tmobile-magenta/5 to-purple-50 rounded-xl p-4 border border-tmobile-gray-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">Total Reports</div>
              <div className="text-2xl font-bold text-[#E8258E]">
                {outageData.summary.totalReports.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">Affected Cities</div>
              <div className="text-2xl font-bold text-blue-600">
                {outageData.summary.affectedCities}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">Critical</div>
              <div className="text-2xl font-bold text-red-600">
                {outageData.summary.criticalCount}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">High</div>
              <div className="text-2xl font-bold text-orange-600">
                {outageData.summary.highCount}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">View Map</div>
              <a
                href="/dashboard/geo"
                className="inline-flex items-center text-sm font-semibold text-[#E8258E] hover:text-[#C4006D] transition-colors"
              >
                Go to GeoMap →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Product Area Cards Grid */}
      <section>
        <h2 className="text-2xl font-bold text-[#E8258E] mb-6">
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
        <h2 className="text-2xl font-bold text-[#E8258E] mb-6">
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
