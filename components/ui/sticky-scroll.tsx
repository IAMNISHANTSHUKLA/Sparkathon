"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useMotionValueEvent, useScroll } from "framer-motion"
import { cn } from "@/lib/utils"

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string
    description: string
    content?: React.ReactNode
  }[]
  contentClassName?: string
}) => {
  const [activeCard, setActiveCard] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const cardLength = content.length

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength)
    const closestBreakpointIndex = cardsBreakpoints.reduce((acc, breakpoint, index) => {
      const distance = Math.abs(latest - breakpoint)
      if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
        return index
      }
      return acc
    }, 0)
    setActiveCard(closestBreakpointIndex)
  })

  return (
    <div ref={ref} className="flex flex-col md:flex-row w-full">
      <div className="w-full md:w-1/2 sticky top-0 h-screen flex items-center">
        <div className="w-full">
          {content[activeCard].content || (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">{content[activeCard].title}</h2>
              <p className="text-muted-foreground">{content[activeCard].description}</p>
            </div>
          )}
        </div>
      </div>
      <div className="w-full md:w-1/2">
        {content.map((item, index) => (
          <div key={index} className="h-screen flex items-center p-4">
            <div
              className={cn(
                "bg-background rounded-lg p-6 w-full",
                activeCard === index ? "border-2 border-primary" : "border border-border",
                contentClassName,
              )}
            >
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
