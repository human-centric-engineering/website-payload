'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-8 items-center">
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          />
        )
      })}
      <Link
        href="/search"
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-card transition-colors"
      >
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-foreground/60 hover:text-primary transition-colors" />
      </Link>
    </nav>
  )
}
