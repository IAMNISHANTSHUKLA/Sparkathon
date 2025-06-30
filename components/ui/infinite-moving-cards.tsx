"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: React.ReactNode[]
  direction?: "left" | "right"
  speed?: "fast" | "normal" | "slow"
  pauseOnHover?: boolean
  className?: string
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLUListElement>(null)

  const [start, setStart] = useState(false)

  useEffect(() => {
    setStart(true)
  }, [])

  const getSpeed = () => {
    switch (speed) {
      case "fast":
        return "20s"
      case "normal":
        return "30s"
      case "slow":
        return "40s"
      default:
        return "20s"
    }
  }

  const getClassName = () => {
    return cn(
      "flex min-w-full shrink-0 gap-4 py-4",
      start && "animate-scroll",
      pauseOnHover && "hover:[animation-play-state:paused]",
      direction === "right" ? "flex-row-reverse" : "flex-row",
      className,
    )
  }

  return (
    <div
      ref={containerRef}
      className="group relative flex overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <ul
        ref={scrollerRef}
        className={getClassName()}
        style={{
          animationDuration: getSpeed(),
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {items.map((item, idx) => (
          <li key={idx} className="flex w-[350px] max-w-full shrink-0 items-center justify-center">
            {item}
          </li>
        ))}
      </ul>
      <ul
        className={getClassName()}
        style={{
          animationDuration: getSpeed(),
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
        aria-hidden="true"
      >
        {items.map((item, idx) => (
          <li key={idx} className="flex w-[350px] max-w-full shrink-0 items-center justify-center">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
