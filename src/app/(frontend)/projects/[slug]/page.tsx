import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return projects.docs.map(({ slug }) => ({
    slug,
  }))
}

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: {
        equals: decodedSlug,
      },
    },
  })

  const project = result.docs[0]

  if (!project) {
    return notFound()
  }

  return (
    <article className="pt-24 pb-24">
      {/* Hero Image */}
      {project.heroImage && typeof project.heroImage === 'object' && (
        <div className="relative w-full h-[400px] mb-12">
          <Media resource={project.heroImage} className="object-cover" fill priority />
        </div>
      )}

      {/* Header */}
      <div className="container mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
              {project.projectType === 'venture' ? 'Venture Studio' : 'Agency Work'}
            </span>
            {project.projectStatus && (
              <span className="capitalize">{project.projectStatus.replace('-', ' ')}</span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>
          {project.excerpt && <p className="text-xl text-muted-foreground">{project.excerpt}</p>}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="container mb-12">
          <div className="max-w-4xl mx-auto prose dark:prose-invert">
            <RichText data={project.description} enableGutter={false} />
          </div>
        </div>
      )}

      {/* Technologies */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="container mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((item, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-muted text-sm font-medium"
                >
                  {item.tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Links */}
      {project.links && (
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Project Links</h2>
            <div className="flex flex-wrap gap-4">
              {project.links.website && (
                <a
                  href={project.links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Visit Website
                </a>
              )}
              {project.links.caseStudy && (
                <a
                  href={project.links.caseStudy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-muted transition-colors"
                >
                  Read Case Study
                </a>
              )}
              {project.links.repository && (
                <a
                  href={project.links.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-muted transition-colors"
                >
                  View Repository
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: {
        equals: decodedSlug,
      },
    },
  })

  const project = result.docs[0]

  if (!project) {
    return {
      title: 'Project Not Found',
    }
  }

  const ogImage =
    project.meta?.image && typeof project.meta.image === 'object'
      ? project.meta.image.url
      : undefined

  return {
    title: project.meta?.title || project.title,
    description: project.meta?.description || project.excerpt,
    openGraph: ogImage
      ? {
          images: [
            {
              url: ogImage,
            },
          ],
        }
      : undefined,
  }
}
