import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  message?: string
  variant?: "default" | "gradient" | "dots"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
}

export function LoadingSpinner({
  size = "md",
  message,
  variant = "default",
}: LoadingSpinnerProps) {
  if (variant === "gradient") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div
            className={cn(
              "rounded-full border-4 border-tmobile-gray-200",
              sizeClasses[size]
            )}
          />
          {/* Spinning gradient */}
          <div
            className={cn(
              "absolute inset-0 rounded-full border-4 border-transparent border-t-[#E8258E] border-r-[#D01A7A] animate-spin",
              sizeClasses[size]
            )}
          />
        </div>
        {message && (
          <p className="text-sm text-tmobile-gray-600 animate-pulse font-medium">
            {message}
          </p>
        )}
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E8258E] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-3 h-3 rounded-full bg-[#E8258E] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-3 h-3 rounded-full bg-[#E8258E] animate-bounce" />
        </div>
        {message && (
          <p className="text-sm text-tmobile-gray-600 font-medium">{message}</p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2
        className={cn(
          "animate-spin text-[#E8258E]",
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-sm text-tmobile-gray-600 animate-pulse font-medium">
          {message}
        </p>
      )}
    </div>
  )
}

// Full-page loading overlay
export function LoadingOverlay({
  message = "Loading...",
  variant = "gradient",
}: {
  message?: string
  variant?: "default" | "gradient" | "dots"
}) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="xl" message={message} variant={variant} />
    </div>
  )
}

// Inline loading (for buttons, cards, etc.)
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin text-current", className)} />
  )
}
