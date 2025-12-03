import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { extractHeadings } from '@/utilities/extractHeadings'
import { WhitepaperTOC } from '@/components/WhitepaperTOC'
import { DownloadPDFButton } from '@/components/DownloadPDFButton'

export default async function WhitepaperPage() {
  const { isEnabled: draft } = await draftMode()
  const url = '/whitepaper'

  const page = await queryPageBySlug({
    slug: 'whitepaper',
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, whitepaperContent } = page

  // Extract headings for table of contents
  const headings = extractHeadings(whitepaperContent)

  return (
    <article className="pb-24">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />

      <div className="container mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content - 8 columns */}
          <div className="lg:col-span-8">
            {whitepaperContent ? (
              <>
                <RichText data={whitepaperContent} enableGutter={false} />
                <div className="mt-12">
                  <DownloadPDFButton />
                </div>
              </>
            ) : (
              <div className="prose dark:prose-invert">
                <p>No content available. Please add content through the admin panel.</p>
              </div>
            )}
          </div>

          {/* Sidebar - 4 columns */}
          <aside className="lg:col-span-4">
            <WhitepaperTOC headings={headings} />
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryPageBySlug({
    slug: 'whitepaper',
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
