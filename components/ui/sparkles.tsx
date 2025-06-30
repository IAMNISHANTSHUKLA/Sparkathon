"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export const SparklesCore = ({
  id,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  className,
  particleDensity,
}: {
  id?: string
  background?: string
  minSize?: number
  maxSize?: number
  speed?: number
  particleColor?: string
  className?: string
  particleDensity?: number
}) => {
  const [particles, setParticles] = useState<Array<any>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const particlesCount = particleDensity || 50
    const newParticles = []

    for (let i = 0; i < particlesCount; i++) {
      const particle = {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (maxSize || 2 - (minSize || 0.5)) + (minSize || 0.5),
        speed: (speed || 1) * (Math.random() * 0.5 + 0.5),
        opacity: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
      }
      newParticles.push(particle)
    }

    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles((currentParticles) =>
        currentParticles.map((particle) => {
          const newY = particle.y - 0.1 * particle.speed
          const newOpacity = particle.opacity - 0.002

          if (newY < 0 || newOpacity < 0) {
            return {
              ...particle,
              y: Math.random() * 100 + 100,
              x: Math.random() * 100,
              opacity: 1,
            }
          }

          return {
            ...particle,
            y: newY,
            opacity: newOpacity,
          }
        }),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [mounted, maxSize, minSize, particleDensity, speed])

  if (!mounted) return null

  return (
    <div
      className={cn("h-full w-full", className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        background: background || "transparent",
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particleColor || "#4f46e5",
            opacity: particle.opacity,
            transform: `translateX(${particle.direction * particle.speed}px)`,
          }}
        />
      ))}
    </div>
  )
}
