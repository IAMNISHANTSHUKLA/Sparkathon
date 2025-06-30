"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export const TextGenerateEffect = ({ words }: { words: string }) => {
  const [renderedText, setRenderedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (renderedText.length < words.length) {
        setRenderedText(words.slice(0, renderedText.length + 1))
      } else {
        setIsComplete(true)
      }
    }, 10)

    return () => clearTimeout(timeout)
  }, [renderedText, words])

  return (
    <div className="font-normal">
      <div className="mt-4">
        <div className="text-sm leading-relaxed">
          {renderedText}
          {!isComplete && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
              className="inline-block ml-1 h-4 w-0.5 bg-primary"
            />
          )}
        </div>
      </div>
    </div>
  )
}
