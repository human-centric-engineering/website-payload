export interface Dot {
  id: string
  x: number
  y: number
  angle: number
  orbitIndex: number
}

export interface Connection {
  from: Dot
  to: Dot
}

export interface OrbitConfig {
  radius: number
  dotCount: number
}
