import type { Media } from '@/payload-types'

export const imageProjectShotTracer: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  alt: 'Dynamic golf shot tracer visualization',
}
