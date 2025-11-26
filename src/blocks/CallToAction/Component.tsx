import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { ScrollReveal } from '@/components/ScrollReveal'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <ScrollReveal className="container my-16">
      <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 rounded-2xl border border-border/50 p-8 md:p-12">
        {/* Decorative gradient blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-0" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
          <div className="max-w-2xl">
            {richText && (
              <RichText
                className="mb-0 [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-bold [&_h2]:mb-4 [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-bold [&_h3]:mb-4 [&_p]:text-base [&_p]:md:text-lg [&_p]:text-foreground/80"
                data={richText}
                enableGutter={false}
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-4 shrink-0">
            {(links || []).map(({ link }, i) => {
              return <CMSLink key={i} size="lg" {...link} />
            })}
          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}
