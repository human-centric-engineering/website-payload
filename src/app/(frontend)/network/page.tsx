import type { Metadata } from 'next/types'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrbitalNetwork } from '@/components/OrbitalNetwork/OrbitalNetwork'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function NetworkPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Orbital Visualization */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
        {/* Background gradient blur */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Orbital Animation */}
        <div className="relative z-10 w-full px-4 py-24">
          <OrbitalNetwork />
        </div>
      </section>

      {/* Content Section */}
      <section className="container py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Building Our Network</h1>
          <p className="text-lg text-muted-foreground mb-12">
            We&apos;re assembling a multi-tiered network of collaborators, each bringing unique
            expertise and vision to redefine entrepreneurship in the AI age.
          </p>

          {/* Network Tiers Explanation */}
          <div className="space-y-8 mb-16">
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Tier 1: Core Team</h3>
              <p className="text-muted-foreground">
                Founders and strategic partners working at the heart of the venture studio,
                defining vision and driving execution.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Tier 2: Strategic Advisors</h3>
              <p className="text-muted-foreground">
                Experienced mentors and domain experts providing guidance on key strategic
                decisions and industry connections.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Tier 3: Active Contributors</h3>
              <p className="text-muted-foreground">
                Specialists and collaborators actively working on projects, bringing technical
                expertise and creative solutions.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Tier 4: Extended Network</h3>
              <p className="text-muted-foreground">
                A broader ecosystem of partners, supporters, and innovators who contribute ideas,
                feedback, and connections.
              </p>
            </div>
          </div>

          {/* LinkedIn CTA */}
          <div className="border border-border rounded-2xl p-12 bg-card/30 backdrop-blur-sm">
            {/* Decorative gradient blur */}
            <div
              className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10"
              aria-hidden="true"
            />

            <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
            <p className="text-muted-foreground mb-8">
              Interested in what we&apos;re building? Let&apos;s connect on LinkedIn. We&apos;re
              always looking to meet builders, strategists, and innovators who share our vision.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <a
                  href="https://www.linkedin.com/in/simonrholmes/"
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
              <Button asChild size="lg" variant="outline">
                <a
                  href="https://www.linkedin.com/in/john-durrant/"
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
      </section>
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
