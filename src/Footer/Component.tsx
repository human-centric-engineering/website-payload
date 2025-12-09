import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border/40 bg-black/75" data-theme="dark">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div className="flex flex-col gap-4">
            <Link className="flex items-center transition-transform hover:scale-105" href="/">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Human-Centric Engineering Venture Studio
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            <nav className="flex flex-col gap-3">
              {navItems.map(({ link }, i) => {
                return (
                  <CMSLink
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                    key={i}
                    {...link}
                  />
                )
              })}
            </nav>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-white/60">Theme</span>
              <div className="text-white [&_button]:text-white [&_svg]:text-white/50">
                <ThemeSelector />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Human-Centric Engineering. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
