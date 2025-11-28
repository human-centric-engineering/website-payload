'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[5rem] flex items-center justify-center text-white overflow-hidden"
      data-theme="dark"
    >
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-[1]" />

      {/* Subtle animated gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] z-[0] animate-pulse" />

      <div className="container py-32 md:py-40 z-10 relative flex items-center justify-center">
        <div className="max-w-4xl md:text-center">
          <div className="animate-fade-in-up">
            {richText && (
              <RichText
                className="mb-8 [&_h1]:text-5xl [&_h1]:md:text-7xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-6 [&_p]:text-lg [&_p]:md:text-xl [&_p]:text-white/90 [&_p]:leading-relaxed"
                data={richText}
                enableGutter={false}
              />
            )}
          </div>
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-col sm:flex-row md:justify-center gap-4 animate-fade-in-up [animation-delay:200ms]" style={{ animationDelay: '200ms' }}>
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink size="lg" {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="absolute inset-0 -z-10 select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover opacity-40" priority resource={media} />
        )}
      </div>
    </div>
  )
}
