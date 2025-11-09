import { Navbar } from '@/components/layout/navbar'
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function OpportunitiesLoading() {
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

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 shadow-lg space-y-2"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-16" />
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-tmobile-gray-200 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Epic Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
