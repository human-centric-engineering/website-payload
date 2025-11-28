import type { Media } from '@/payload-types'

export const profileSimonHolmes: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  alt: 'Simon Holmes - Profile Photo',
}
