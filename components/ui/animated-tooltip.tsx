"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number
    name: string
    designation: string
    image: string
  }[]
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-row items-center justify-center py-4">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            className={cn(
              "relative h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 transition-all duration-300",
              idx !== 0 && "-ml-3",
            )}
          >
            <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
          </div>
          {hoveredIndex === idx && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 10,
                },
              }}
              exit={{ opacity: 0, y: 20, scale: 0.6 }}
              className="absolute -top-16 left-0 z-50 flex flex-col items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-xl px-4 py-2"
            >
              <div className="absolute -bottom-1 left-5 h-2 w-2 bg-white dark:bg-slate-800 rotate-45 transform" />
              <div className="flex flex-col items-center justify-center">
                <p className="font-bold text-sm text-black dark:text-white">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.designation}</p>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}
