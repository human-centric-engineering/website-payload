'use client'

import React, { useState, useMemo, useCallback } from 'react'
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
const NUCLEUS_RADIUS = 12

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
  const angleStep = (2 * Math.PI) / dotCount
  const dots: Dot[] = []

  for (let i = 0; i < dotCount; i++) {
    const angle = i * angleStep
    dots.push({
      id: `orbit-${orbitIndex}-dot-${i}`,
      x: CENTER_X + radius * Math.cos(angle),
      y: CENTER_Y + radius * Math.sin(angle),
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

export function OrbitalNetwork() {
  const [hoveredDotId, setHoveredDotId] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [isPaused, setIsPaused] = useState(false)

  // Pre-calculate all dot positions
  const allDots = useMemo(() => {
    return ORBITS.flatMap((orbit, index) => calculateDotPositions(orbit, index))
  }, [])

  const handleDotEnter = useCallback(
    (dot: Dot) => {
      setHoveredDotId(dot.id)
      setIsPaused(true)

      // Select random dots to connect to
      const targets = selectConnectionTargets(dot, allDots)
      const newConnections = targets.map((target) => ({
        from: dot,
        to: target,
      }))
      setConnections(newConnections)
    },
    [allDots],
  )

  const handleDotLeave = useCallback(() => {
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
        <title id="network-title">
          Interactive visualization of HCE Venture Studio&apos;s multi-tiered network
        </title>
        <desc id="network-desc">
          Four concentric circles with dots representing network members. Hover or focus on dots to
          see connections between members.
        </desc>

        {/* Orbital paths (decorative circles) */}
        <g className="orbits" aria-hidden="true">
          {ORBITS.map((orbit, index) => (
            <circle
              key={`orbit-path-${index}`}
              className={styles.orbitPath}
              cx={CENTER_X}
              cy={CENTER_Y}
              r={orbit.radius}
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

        {/* Animated dots grouped by orbit */}
        {ORBITS.map((orbit, orbitIndex) => {
          const orbitDots = allDots.filter((d) => d.orbitIndex === orbitIndex)
          const orbitClass = styles[`orbit${orbitIndex}` as keyof typeof styles] || ''

          return (
            <g
              key={`orbit-${orbitIndex}`}
              className={`${styles.orbit} ${orbitClass} ${isPaused ? styles.paused : ''}`}
            >
              {orbitDots.map((dot) => (
                <circle
                  key={dot.id}
                  className={styles.dot}
                  cx={dot.x}
                  cy={dot.y}
                  r={DOT_RADIUS}
                  onMouseEnter={() => handleDotEnter(dot)}
                  onMouseLeave={handleDotLeave}
                  onFocus={() => handleDotFocus(dot)}
                  onBlur={handleDotBlur}
                  tabIndex={0}
                  role="button"
                  aria-label={`Network member on tier ${orbitIndex + 1}`}
                  aria-pressed={hoveredDotId === dot.id}
                />
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
