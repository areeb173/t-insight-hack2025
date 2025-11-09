import { Navbar } from '@/components/layout/navbar'
import { Skeleton, SkeletonChart, SkeletonMetricCard } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50">
      {/* Header */}
      <Navbar userEmail="" />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>

        {/* Product Areas Grid Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-tmobile-gray-200 shadow-lg space-y-4"
              >
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 gap-6">
          <SkeletonChart />
        </div>
      </main>
    </div>
  )
}
