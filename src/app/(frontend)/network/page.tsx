import type { Metadata } from 'next'
import React, { cache } from 'react'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { generateMeta } from '@/utilities/generateMeta'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { OrbitalNetwork } from '@/components/OrbitalNetwork/OrbitalNetwork'

export const dynamic = 'force-static'

export default async function NetworkPage() {
  const url = '/network'

  const page = await queryPageBySlug({
    slug: 'network',
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { networkContent } = page

  if (!networkContent) {
    return (
      <div className="container py-24">
        <p>No content available. Please add content through the admin panel.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <div className="container py-24">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-12">
            {/* Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{networkContent.headline}</h1>
              <div className="text-lg text-muted-foreground">
                <RichText data={networkContent.description} enableGutter={false} />
              </div>
            </div>

            {/* LinkedIn CTA */}
            {networkContent.ctaSection && (
              <div className="border border-border rounded-2xl p-8 bg-card/70 backdrop-blur-sm relative">
                {/* Decorative gradient blur */}
                <div
                  className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10"
                  aria-hidden="true"
                />

                <h2 className="text-2xl font-bold mb-3">{networkContent.ctaSection.title}</h2>
                <p className="text-muted-foreground mb-6">{networkContent.ctaSection.description}</p>
                <div className="flex flex-wrap gap-4">
                  {networkContent.ctaSection.linkedInLinks?.map((link, index) => (
                    <Button key={index} asChild size="lg">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        Connect with {link.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Orbital Visualization */}
          <div className="relative flex justify-center w-full bg-black/90 rounded-lg">
            {/* Background gradient blur */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10 w-full">
              <OrbitalNetwork />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryPageBySlug({
    slug: 'network',
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
