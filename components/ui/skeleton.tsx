import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gradient-to-r from-tmobile-gray-100 via-tmobile-gray-200 to-tmobile-gray-100 bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

// Preset skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-tmobile-gray-200 shadow-lg space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function SkeletonMetricCard() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-10 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-32" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-tmobile-gray-200 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}
