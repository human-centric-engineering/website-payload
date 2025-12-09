'use client'

import React from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileMenuButtonProps {
  isOpen: boolean
  onToggle: () => void
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden text-foreground"
      onClick={onToggle}
      aria-label="Toggle mobile menu"
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  )
}
