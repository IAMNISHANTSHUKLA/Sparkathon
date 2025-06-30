"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function BackgroundBeams({
  className,
}: {
  className?: string
}) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        })
      }
    }

    const element = ref.current
    if (element) {
      element.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (element) {
        element.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
        className,
      )}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="radial-gradient" cx="50%" cy="50%" r="50%" fx={mousePosition.x} fy={mousePosition.y}>
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.3)" />
            <stop offset="100%" stopColor="rgba(79, 70, 229, 0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#radial-gradient)" />
      </svg>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=30&width=30')] bg-center [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-20"></div>
      <div className="absolute inset-0 opacity-50 mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-transparent to-emerald-900 opacity-30"></div>
      </div>
    </div>
  )
}
