'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

interface FeedbackPoint {
  city: string
  lat: number
  lng: number
  sentiment: number
  intensity: number
}

interface GeoMapEnhancedWrapperProps {
  feedback: FeedbackPoint[]
  onViewChange?: (view: 'feedback' | 'outage') => void
}

// Dynamically import GeoHeatmapEnhanced with SSR disabled (Leaflet requires browser APIs)
const GeoHeatmapEnhanced = dynamic(
  () => import('@/components/dashboard/geo-heatmap-enhanced').then((mod) => ({ default: mod.GeoHeatmapEnhanced })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center bg-tmobile-gray-50 rounded-2xl border border-tmobile-gray-200">
        <div className="text-center">
          <p className="text-tmobile-gray-600 text-lg">Loading map...</p>
        </div>
      </div>
    )
  }
)

export function GeoMapEnhancedWrapper({ feedback, onViewChange }: GeoMapEnhancedWrapperProps) {
  return <GeoHeatmapEnhanced feedback={feedback} onViewChange={onViewChange} />
}
