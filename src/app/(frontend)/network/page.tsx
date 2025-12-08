import type { Metadata } from 'next/types'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrbitalNetwork } from '@/components/OrbitalNetwork/OrbitalNetwork'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function NetworkPage() {
  return (
    <div className="min-h-screen">
      <PageClient />
      <div className="container py-24">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-12">
            {/* Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Building Our Network</h1>
              <p className="text-lg text-muted-foreground">
                We&apos;re assembling a multi-tiered network of collaborators, each bringing unique
                expertise and experience to help us deliver the HCE Studio vision.
              </p>
            </div>

            {/* LinkedIn CTA */}
            <div className="border border-border rounded-2xl p-8 bg-card/70 backdrop-blur-sm relative">
              {/* Decorative gradient blur */}
              <div
                className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10"
                aria-hidden="true"
              />

              <h2 className="text-2xl font-bold mb-3">Connect With Us</h2>
              <p className="text-muted-foreground mb-6">
                If you&apos;re interested in what we&apos;re building, let&apos;s connect on
                LinkedIn.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <a
                    href="https://www.linkedin.com/in/simondholmes/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Connect with Simon
                  </a>
                </Button>
                <Button asChild size="lg">
                  <a
                    href="https://www.linkedin.com/in/johndurrant/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Connect with John
                  </a>
                </Button>
              </div>
            </div>
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

export function generateMetadata(): Metadata {
  return {
    title: 'Network | HCE Venture Studio',
    description:
      'Building a multi-tiered network of collaborators to redefine entrepreneurship in the AI age.',
  }
}
