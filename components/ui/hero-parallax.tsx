"use client"

import { useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string
    link: string
    thumbnail: string
  }[]
}) => {
  const firstRow = products.slice(0, 3)
  const secondRow = products.slice(3, 6)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const translateY1 = useTransform(scrollYProgress, [0, 1], [0, 400])
  const translateY2 = useTransform(scrollYProgress, [0, 1], [0, -400])

  return (
    <div
      ref={ref}
      className="h-[120vh] md:h-[140vh] flex flex-col items-center justify-start overflow-hidden bg-slate-50 dark:bg-slate-950 py-10 md:py-20"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Explore OpsPilot Features</h2>
      <div className="flex flex-col gap-16 w-full">
        <motion.div style={{ y: translateY1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
          {firstRow.map((product) => (
            <Link
              href={product.link}
              key={product.title}
              className="group relative rounded-xl overflow-hidden bg-background hover:shadow-xl transition-all duration-300"
            >
              <div className="h-64 w-full relative">
                <Image
                  src={product.thumbnail || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-xl font-bold">{product.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
        <motion.div style={{ y: translateY2 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
          {secondRow.map((product) => (
            <Link
              href={product.link}
              key={product.title}
              className="group relative rounded-xl overflow-hidden bg-background hover:shadow-xl transition-all duration-300"
            >
              <div className="h-64 w-full relative">
                <Image
                  src={product.thumbnail || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-xl font-bold">{product.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
