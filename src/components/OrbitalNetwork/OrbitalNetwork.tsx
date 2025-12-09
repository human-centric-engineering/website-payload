'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { Dot, ConnectionSet, OrbitConfig } from './types'
import styles from './styles.module.css'

// Configuration
const CENTER_X = 400
const CENTER_Y = 400
const ORBITS: OrbitConfig[] = [
  { radius: 100, dotCount: 4 },
  { radius: 180, dotCount: 7 },
  { radius: 260, dotCount: 11 },
  { radius: 340, dotCount: 15 },
]
const DOT_RADIUS = 6
const NUCLEUS_RADIUS = 24
const ORBIT_DURATIONS = [20, 36, 52, 68] // seconds per orbit
const ELLIPSE_RATIO = 0.6 // ry = rx * 0.6 for ~40° perspective

// Automatic activation timing
const ACTIVATION_INTERVAL = 1500 // ms between activations
const FADE_IN_DURATION = 450 // ms
const HOLD_DURATION = 900 // ms
const FADE_OUT_DURATION = 1000 // ms
const TOTAL_DURATION = FADE_IN_DURATION + HOLD_DURATION + FADE_OUT_DURATION // 1950ms

// Utility functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function calculateDotPositions(orbitConfig: OrbitConfig, orbitIndex: number): Dot[] {
  const { radius, dotCount } = orbitConfig
  const rx = radius
  const ry = radius * ELLIPSE_RATIO
  const angleStep = (2 * Math.PI) / dotCount
  const dots: Dot[] = []

  for (let i = 0; i < dotCount; i++) {
    const angle = i * angleStep
    dots.push({
      id: `orbit-${orbitIndex}-dot-${i}`,
      x: CENTER_X + rx * Math.cos(angle),
      y: CENTER_Y + ry * Math.sin(angle),
      angle: angle * (180 / Math.PI),
      orbitIndex,
    })
  }

  return dots
}

function selectConnectionTargets(hoveredDot: Dot, allDots: Dot[]): Dot[] {
  // Exclude dots on same orbit as hovered dot
  const eligible = allDots.filter(
    (d) => d.orbitIndex !== hoveredDot.orbitIndex && d.id !== hoveredDot.id,
  )

  // Randomly select 2-4 dots
  const count = Math.floor(Math.random() * 3) + 2 // 2-4
  return shuffleArray(eligible).slice(0, count)
}

function getDotPosition(dot: Dot, elapsedMs: number): { x: number; y: number } {
  const orbit = ORBITS[dot.orbitIndex]
  const duration = ORBIT_DURATIONS[dot.orbitIndex] * 1000 // ms
  const progress = (elapsedMs % duration) / duration // 0-1
  const currentAngle = dot.angle * (Math.PI / 180) + progress * 2 * Math.PI

  const rx = orbit.radius
  const ry = orbit.radius * ELLIPSE_RATIO

  return {
    x: CENTER_X + rx * Math.cos(currentAngle),
    y: CENTER_Y + ry * Math.sin(currentAngle),
  }
}

function getConnectionOpacity(createdAt: number): number {
  const age = Date.now() - createdAt

  if (age < FADE_IN_DURATION) {
    // Fade in
    return (age / FADE_IN_DURATION) * 0.6
  } else if (age < FADE_IN_DURATION + HOLD_DURATION) {
    // Hold at full opacity
    return 0.6
  } else if (age < TOTAL_DURATION) {
    // Fade out
    const fadeOutProgress = (age - FADE_IN_DURATION - HOLD_DURATION) / FADE_OUT_DURATION
    return 0.6 * (1 - fadeOutProgress)
  }

  return 0
}

export function OrbitalNetwork() {
  const [connectionSets, setConnectionSets] = useState<ConnectionSet[]>([])
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isMounted, setIsMounted] = useState(false)
  const animationStartTime = useRef<number>(Date.now())
  const animationFrameRef = useRef<number | undefined>(undefined)
  const activationIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Pre-calculate all dot positions
  const allDots = useMemo(() => {
    return ORBITS.flatMap((orbit, index) => calculateDotPositions(orbit, index))
  }, [])

  // Set mounted flag after initial render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Animation loop
  useEffect(() => {
    if (!isMounted) return

    const animate = () => {
      setCurrentTime(Date.now() - animationStartTime.current)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMounted])

  // Automatic activation effect
  useEffect(() => {
    if (!isMounted) return

    const activateDot = () => {
      // Calculate current elapsed time fresh (not from stale closure)
      const elapsed = Date.now() - animationStartTime.current

      // Randomly select a dot
      const randomDot = allDots[Math.floor(Math.random() * allDots.length)]

      // Get current position of the selected dot
      const fromPos = getDotPosition(randomDot, elapsed)

      // Select random target dots
      const targets = selectConnectionTargets(randomDot, allDots)

      // Create connections with current positions
      const connections = targets.map((target) => {
        const toPos = getDotPosition(target, elapsed)
        return {
          from: { ...randomDot, x: fromPos.x, y: fromPos.y },
          to: { ...target, x: toPos.x, y: toPos.y },
        }
      })

      // Add new connection set
      const newSet: ConnectionSet = {
        id: `conn-${Date.now()}-${Math.random()}`,
        createdAt: Date.now(),
        connections,
      }

      setConnectionSets((prev) => [...prev, newSet])
    }

    // Start activation interval
    activationIntervalRef.current = setInterval(activateDot, ACTIVATION_INTERVAL)

    return () => {
      if (activationIntervalRef.current) {
        clearInterval(activationIntervalRef.current)
      }
    }
  }, [isMounted, allDots])

  // Cleanup expired connection sets
  useEffect(() => {
    const now = Date.now()
    setConnectionSets((prev) => prev.filter((set) => now - set.createdAt < TOTAL_DURATION))
  }, [currentTime])

  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        viewBox="0 0 800 800"
        role="img"
        aria-labelledby="network-title"
        aria-describedby="network-desc"
      >
        {/* <title id="network-title">
          Interactive visualization of HCE Venture Studio&apos;s multi-tiered network
        </title> */}
        <desc id="network-desc">
          Four concentric circles with dots representing network members. Hover or focus on dots to
          see connections between members.
        </desc>

        {/* Orbital paths (decorative ellipses) */}
        <g className="orbits" aria-hidden="true">
          {ORBITS.map((orbit, index) => (
            <ellipse
              key={`orbit-path-${index}`}
              className={styles.orbitPath}
              cx={CENTER_X}
              cy={CENTER_Y}
              rx={orbit.radius}
              ry={orbit.radius * ELLIPSE_RATIO}
            />
          ))}
        </g>

        {/* Central nucleus */}
        <circle
          className={styles.nucleus}
          cx={CENTER_X}
          cy={CENTER_Y}
          r={NUCLEUS_RADIUS}
          aria-label="Network core"
        />

        {/* Connection lines */}
        <g className="connections">
          {connectionSets.map((set) => {
            const opacity = getConnectionOpacity(set.createdAt)

            return set.connections.map((conn, index) => {
              // Calculate current positions of connected dots
              const fromPos = getDotPosition(conn.from, currentTime)
              const toPos = getDotPosition(conn.to, currentTime)

              return (
                <line
                  key={`${set.id}-${index}`}
                  className={styles.connection}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  style={{ opacity }}
                  aria-hidden="true"
                />
              )
            })
          })}
        </g>

        {/* Animated dots */}
        <g className="dots">
          {allDots.map((dot) => {
            // Use static positions until mounted to avoid hydration mismatch
            const pos = isMounted ? getDotPosition(dot, currentTime) : { x: dot.x, y: dot.y }
            const orbitClass = styles[`dot${dot.orbitIndex}` as keyof typeof styles] || ''

            return (
              <circle
                key={dot.id}
                className={`${styles.dot} ${orbitClass}`}
                cx={pos.x}
                cy={pos.y}
                r={DOT_RADIUS}
                suppressHydrationWarning
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
