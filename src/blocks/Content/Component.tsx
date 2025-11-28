import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { ScrollReveal } from '@/components/ScrollReveal'
import { Media } from '@/components/Media'
import * as LucideIcons from 'lucide-react'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { blockStyle = 'default', columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const isFeatured = blockStyle === 'featured'
  const hasDivider = blockStyle === 'withDivider'

  return (
    <div
      className={cn('my-20', {
        'my-24': isFeatured || hasDivider,
      })}
    >
      {hasDivider && (
        <div className="container mb-16">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      )}
      <div
        className={cn({
          'bg-card border-y border-border/40 py-16 md:py-20': isFeatured,
        })}
      >
        <div className="container">
          <div className="grid grid-cols-4 lg:grid-cols-12 gap-8">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, icon, link, media, richText, size } = col
            const isFullWidth = size === 'full'
            const isTwoThirds = size === 'twoThirds'
            const isOneThird = size === 'oneThird'

            // Dynamically get the icon component
            const IconComponent = icon && icon in LucideIcons
              ? (LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string; strokeWidth?: number }>)
              : null

            // Check if this is an image-only column (oneThird with media but no richText)
            const isImageColumn = isOneThird && media && !richText

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full' && size !== 'twoThirds',
                  'md:col-span-4': size === 'twoThirds',
                })}
                key={index}
              >
                <ScrollReveal delay={isFullWidth || isTwoThirds ? 0 : index * 100}>
                  {isImageColumn ? (
                    // Image-only column
                    <div className="h-full rounded-xl overflow-hidden">
                      {media && typeof media === 'object' && (
                        <Media
                          resource={media}
                          className="w-full h-full object-cover"
                          imgClassName="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ) : isFullWidth || isTwoThirds ? (
                    // Full width or two-thirds header/content style
                    <div className={cn('mb-12', { 'mx-auto': isTwoThirds })}>
                      {richText && (
                        <RichText
                          className="[&_h2]:text-4xl [&_h2]:md:text-5xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:text-center [&_p]:text-base [&_p]:md:text-lg [&_p]:text-foreground/80 [&_p]:leading-relaxed [&_p]:text-center [&_quote]:border-l-4 [&_quote]:border-primary [&_quote]:pl-6 [&_quote]:italic [&_quote]:text-foreground/90 [&_quote]:my-6"
                          data={richText}
                          enableGutter={false}
                        />
                      )}
                    </div>
                  ) : (
                    // Card style for columns
                    <div className="group h-full flex flex-col p-6 md:p-8 rounded-xl bg-card/30 border border-border/30 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden">
                      {IconComponent && (
                        <div className="absolute -top-4 -right-4 opacity-[0.14] pointer-events-none">
                          <IconComponent className="w-32 h-32 text-primary" strokeWidth={1.5} />
                        </div>
                      )}
                      {richText && (
                        <RichText
                          className="flex-1 relative z-10 [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:text-gradient [&_p]:text-foreground/80 [&_p]:text-sm [&_p]:md:text-base [&_p]:leading-relaxed"
                          data={richText}
                          enableGutter={false}
                        />
                      )}
                      {enableLink && (
                        <div className="mt-4 relative z-10">
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
      </div>
    </div>
  )
}
