import type { Media } from '@/payload-types'

export const imageWhitepaperMindDashboard: Omit<Media, 'id' | 'createdAt' | 'updatedAt'> = {
  alt: 'Visualisation of the MIND Dashboard from The Last Economy; Material Capital, Intellectual Capital, Network Capital, Diversity Capital',
  caption: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Source: The Last Economy; Emad Mostaque',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
}
