import type { Media } from '@/payload-types'

export const profileJohnDurrant: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  alt: 'John Durrant - Profile Photo',
}
