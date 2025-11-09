'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { GeoMapEnhancedWrapper } from '@/components/dashboard/geo-map-enhanced-wrapper'
import { formatDistanceToNow } from 'date-fns'
import { InsertSampleDataButton } from '@/components/dashboard/insert-sample-data-button'

interface FeedbackData {
  city: string;
  lat: number;
  lng: number;
  sentiment: number;
  intensity: number;
}

type MapView = 'feedback' | 'outage';

interface User {
  email?: string;
}

export default function GeoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [feedback, setFeedback] = useState<FeedbackData[]>([])
  const [loading, setLoading] = useState(true)
  const [mapView, setMapView] = useState<MapView>('feedback')
  const lastUpdated = new Date()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch feedback data
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('city, lat, lng, sentiment, intensity')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .limit(1000)

        if (!error && data) {
          setFeedback(data)
        }
      } catch (error) {
        console.error('Error fetching feedback:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8258E] mx-auto mb-4"></div>
          <p className="text-tmobile-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const getHeaderTitle = () => {
    if (mapView === 'outage') {
      return 'Network Outage Map'
    }
    return 'Geographic Pain Point Heatmap'
  }

  const getHeaderDescription = () => {
    if (mapView === 'outage') {
      return 'Real-time outage reports from DownDetector and Outage.Report across the United States'
    }
    return 'Visualize customer feedback and issues by location across the United States'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50">
      {/* Header */}
      <header className="bg-[#E8258E] sticky top-0 z-[100] shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
              <Image
                src="/navbar-logo.png"
                alt="T-Insight Logo"
                width={150}
                height={70}
                className="relative"
              />
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-white hover:text-white/80 transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
              >
                Dashboard
              </a>
              <span className="text-sm text-white/90 px-3 py-2">
                {user.email}
              </span>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/40 transition-all"
                >
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#E8258E] mb-2">
                {getHeaderTitle()}
              </h2>
              <p className="text-tmobile-gray-600">
                {getHeaderDescription()}
              </p>
            </div>
            {feedback.length === 0 && mapView === 'feedback' && (
              <InsertSampleDataButton />
            )}
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-tmobile-gray-200 relative z-0">
            <GeoMapEnhancedWrapper
              feedback={feedback}
              onViewChange={setMapView}
            />
            <div className="text-sm text-tmobile-gray-500 mt-4 text-right">
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-tmobile-gray-200 p-6 shadow-sm">
              <div className="text-sm text-tmobile-gray-600 mb-1">Total Feedback Points</div>
              <div className="text-3xl font-bold text-[#E8258E]">{feedback.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-tmobile-gray-200 p-6 shadow-sm">
              <div className="text-sm text-tmobile-gray-600 mb-1">Unique Cities</div>
              <div className="text-3xl font-bold text-[#E8258E]">
                {new Set(feedback.map((f: FeedbackData) => f.city)).size}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-tmobile-gray-200 p-6 shadow-sm">
              <div className="text-sm text-tmobile-gray-600 mb-1">Avg. Intensity</div>
              <div className="text-3xl font-bold text-[#E8258E]">
                {feedback.length > 0
                  ? Math.round(
                      feedback.reduce((sum: number, f: FeedbackData) => sum + (f.intensity || 0), 0) /
                        feedback.length
                    )
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
