"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, useTransform, useScroll, useVelocity, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const contentRef = useRef<HTMLDivElement>(null)
  const [svgHeight, setSvgHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight)
    }
  }, [])

  const y1 = useTransform(scrollYProgress, [0, 0.5, 1], [0, svgHeight / 2, svgHeight])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, svgHeight])

  const yVelocity = useVelocity(y1)
  const smoothVelocity = useSpring(yVelocity, {
    damping: 50,
    stiffness: 400,
  })

  const opacity = useTransform(smoothVelocity, [-1000, 0, 1000], [0, 1, 0])

  return (
    <motion.div ref={ref} className={cn("relative", className)}>
      <div className="absolute -left-4 md:-left-20 top-3">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            height: svgHeight,
          }}
          className="relative h-full w-20 flex items-center justify-center"
        >
          <svg viewBox={`0 0 20 ${svgHeight}`} width="20" height={svgHeight} className="block" aria-hidden="true">
            <motion.path
              d={`M 1 0 V ${svgHeight}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              className="text-gray-300 dark:text-gray-600"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <motion.path
              d={`M 1 ${y1} L 1 ${y2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
              style={{ opacity }}
            />
            <motion.path
              d={`M 1 ${y1} L 1 ${y1}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-primary"
              style={{ opacity }}
            />
          </svg>
        </motion.div>
      </div>
      <div ref={contentRef} className="pt-10 pb-10">
        {children}
      </div>
    </motion.div>
  )
}
