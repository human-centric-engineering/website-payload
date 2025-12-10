import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'HCE Studio - Craftsmanship at pace, where human ingenuity meets AI capability',
  images: [
    {
      url: `${getServerSideURL()}/hce-web-social-default.png`,
    },
  ],
  siteName: 'HCE Studio',
  title: 'HCE Studio',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
