'use client'

import React, { useEffect } from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileNavProps {
  data: HeaderType
  isOpen: boolean
  onClose: () => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ data, isOpen, onClose }) => {
  const navItems = data?.navItems || []

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slideout Panel */}
      <nav
        className={`fixed top-0 right-0 h-full w-[280px] bg-black/95 backdrop-blur-lg border-l border-border/40 transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        data-theme="dark"
      >
        {/* Close button aligned with header */}
        <div className="flex h-20 items-center justify-end px-6 border-b border-border/40">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close mobile menu"
            className="text-foreground"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation items */}
        <div className="flex flex-col gap-6 p-6">
          {navItems.map(({ link }, i) => (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className="text-base font-medium text-foreground/80 hover:text-primary transition-colors"
            />
          ))}
        </div>
      </nav>
    </>
  )
}
