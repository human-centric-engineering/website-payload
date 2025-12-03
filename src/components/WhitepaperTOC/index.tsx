'use client'

import React, { useEffect, useState } from 'react'
import type { HeadingNode } from '@/utilities/extractHeadings'
import { cn } from '@/utilities/ui'

interface WhitepaperTOCProps {
  headings: HeadingNode[]
}

export function WhitepaperTOC({ headings }: WhitepaperTOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Get all heading elements
    const headingElements = headings.flatMap((h2) => {
      const h2Element = document.getElementById(h2.id)
      const h3Elements = h2.children?.map((h3) => document.getElementById(h3.id)).filter(Boolean) || []
      return [h2Element, ...h3Elements].filter(Boolean) as HTMLElement[]
    })

    if (headingElements.length === 0) return

    const observerOptions = {
      rootMargin: '-100px 0px -66%',
      threshold: 0,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }, observerOptions)

    headingElements.forEach((element) => {
      observer.observe(element)
    })

    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element)
      })
    }
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      // Update URL without triggering navigation
      window.history.pushState(null, '', `#${id}`)
      setActiveId(id)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="sticky top-24 h-fit hidden lg:block">
      <div className="border-l-2 border-border pl-4">
        <h3 className="text-sm font-semibold mb-4 text-foreground">Contents</h3>
        <ul className="space-y-2 text-sm">
          {headings.map((h2) => (
            <li key={h2.id}>
              <a
                href={`#${h2.id}`}
                onClick={(e) => handleClick(e, h2.id)}
                className={cn(
                  'block py-1 transition-colors hover:text-foreground',
                  activeId === h2.id
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {h2.text}
              </a>
              {h2.children && h2.children.length > 0 && (
                <ul className="ml-4 mt-2 space-y-2">
                  {h2.children.map((h3) => (
                    <li key={h3.id}>
                      <a
                        href={`#${h3.id}`}
                        onClick={(e) => handleClick(e, h3.id)}
                        className={cn(
                          'block py-1 text-xs transition-colors hover:text-foreground',
                          activeId === h3.id
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground',
                        )}
                      >
                        {h3.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
