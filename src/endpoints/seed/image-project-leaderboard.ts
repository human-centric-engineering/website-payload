import type { Media } from '@/payload-types'

export const imageProjectLeaderboard: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  alt: 'Golf tournament leaderboard display',
}
