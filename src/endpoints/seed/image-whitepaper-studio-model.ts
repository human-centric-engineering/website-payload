import type { Media } from '@/payload-types'

export const imageWhitepaperStudioModel: Omit<Media, 'id' | 'createdAt' | 'updatedAt'> = {
  alt: 'Visualisation of the flow within the HCE Venture Studio model',
}
