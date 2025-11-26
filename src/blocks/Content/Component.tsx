import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { ScrollReveal } from '@/components/ScrollReveal'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-20">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-8">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col
            const isFullWidth = size === 'full'

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                <ScrollReveal delay={isFullWidth ? 0 : index * 100}>
                  {isFullWidth ? (
                    // Full width header style
                    <div className="mb-12">
                      {richText && (
                        <RichText
                          className="[&_h2]:text-4xl [&_h2]:md:text-5xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:text-center"
                          data={richText}
                          enableGutter={false}
                        />
                      )}
                    </div>
                  ) : (
                    // Card style for columns
                    <div className="group h-full flex flex-col p-6 md:p-8 rounded-xl bg-card/30 border border-border/30 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                      {richText && (
                        <RichText
                          className="flex-1 [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:text-gradient [&_p]:text-foreground/80 [&_p]:text-sm [&_p]:md:text-base [&_p]:leading-relaxed"
                          data={richText}
                          enableGutter={false}
                        />
                      )}
                      {enableLink && (
                        <div className="mt-4">
                          <CMSLink {...link} />
                        </div>
                      )}
                    </div>
                  )}
                </ScrollReveal>
              </div>
            )
          })}
      </div>
    </div>
  )
}
