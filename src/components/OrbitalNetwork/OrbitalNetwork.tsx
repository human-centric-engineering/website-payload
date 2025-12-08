'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import type { Dot, Connection, OrbitConfig } from './types'
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

function getRotatedPosition(
  dot: Dot,
  orbitIndex: number,
  startTime: number | null,
  totalPausedTime: number,
): { x: number; y: number } {
  if (startTime === null) {
    return { x: dot.x, y: dot.y }
  }

  // Calculate elapsed time and current rotation angle (excluding paused time)
  const now = Date.now()
  const elapsed = (now - startTime - totalPausedTime) / 1000 // seconds
  const duration = ORBIT_DURATIONS[orbitIndex]
  const progress = (elapsed % duration) / duration // 0-1

  // Add the dot's initial angle to the rotation progress
  const currentAngle = dot.angle * (Math.PI / 180) + progress * 2 * Math.PI

  const orbit = ORBITS[orbitIndex]
  const rx = orbit.radius
  const ry = orbit.radius * ELLIPSE_RATIO

  // Calculate position on ellipse at current angle
  const rotatedX = CENTER_X + rx * Math.cos(currentAngle)
  const rotatedY = CENTER_Y + ry * Math.sin(currentAngle)

  return { x: rotatedX, y: rotatedY }
}

export function OrbitalNetwork() {
  const [hoveredDotId, setHoveredDotId] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isMounted, setIsMounted] = useState(false)
  const animationStartTime = useRef<number>(Date.now())
  const pauseStartTime = useRef<number | null>(null)
  const totalPausedTime = useRef<number>(0)
  const animationFrameRef = useRef<number>()

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
    if (!isMounted || isPaused) return

    const animate = () => {
      setCurrentTime(Date.now() - animationStartTime.current - totalPausedTime.current)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMounted, isPaused])

  const handleDotEnter = useCallback(
    (dot: Dot) => {
      // Record pause start time
      pauseStartTime.current = Date.now()

      setHoveredDotId(dot.id)
      setIsPaused(true)

      // Get current rotated position of the hovered dot (accounting for total paused time)
      const hoveredPos = getRotatedPosition(
        dot,
        dot.orbitIndex,
        animationStartTime.current,
        totalPausedTime.current,
      )

      // Select random dots to connect to
      const targets = selectConnectionTargets(dot, allDots)
      const newConnections = targets.map((target) => {
        const targetPos = getRotatedPosition(
          target,
          target.orbitIndex,
          animationStartTime.current,
          totalPausedTime.current,
        )
        return {
          from: { ...dot, x: hoveredPos.x, y: hoveredPos.y },
          to: { ...target, x: targetPos.x, y: targetPos.y },
        }
      })
      setConnections(newConnections)
    },
    [allDots],
  )

  const handleDotLeave = useCallback(() => {
    // Track how long we were paused
    if (pauseStartTime.current !== null) {
      const pauseDuration = Date.now() - pauseStartTime.current
      totalPausedTime.current += pauseDuration
      pauseStartTime.current = null
    }

    setHoveredDotId(null)
    setIsPaused(false)
    setConnections([])
  }, [])

  const handleDotFocus = useCallback(
    (dot: Dot) => {
      handleDotEnter(dot)
    },
    [handleDotEnter],
  )

  const handleDotBlur = useCallback(() => {
    handleDotLeave()
  }, [handleDotLeave])

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

        {/* Connection lines (rendered when hovering) */}
        {connections.length > 0 && (
          <g className="connections">
            {connections.map((conn, index) => (
              <line
                key={`connection-${index}`}
                className={styles.connection}
                x1={conn.from.x}
                y1={conn.from.y}
                x2={conn.to.x}
                y2={conn.to.y}
                aria-hidden="true"
              />
            ))}
          </g>
        )}

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
                onMouseEnter={() => handleDotEnter(dot)}
                onMouseLeave={handleDotLeave}
                onFocus={() => handleDotFocus(dot)}
                onBlur={handleDotBlur}
                tabIndex={0}
                role="button"
                aria-label={`Network member on tier ${dot.orbitIndex + 1}`}
                aria-pressed={hoveredDotId === dot.id}
                suppressHydrationWarning
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
