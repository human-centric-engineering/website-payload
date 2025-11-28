import type { Metadata } from 'next/types'
import type { Project } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'

type ProjectCardData = Pick<Project, 'id' | 'title' | 'slug' | 'projectType' | 'projectStatus' | 'excerpt' | 'heroImage'>

export const dynamic = 'force-static'
export const revalidate = 600

export default async function ProjectsPage() {
  const payload = await getPayload({ config: configPromise })

  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      projectType: true,
      projectStatus: true,
      excerpt: true,
      heroImage: true,
    },
  })

  const ventureProjects = projects.docs.filter((p) => p.projectType === 'venture')
  const agencyProjects = projects.docs.filter((p) => p.projectType === 'agency')

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Projects</h1>
          <p className="text-lg">
            Explore our portfolio of ventures and client work, showcasing the intersection of
            human-centric values and cutting-edge technology.
          </p>
        </div>
      </div>

      {/* Venture Studio Projects */}
      {ventureProjects.length > 0 && (
        <div className="container mb-16">
          <h2 className="text-3xl font-bold mb-8">Venture Studio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ventureProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Agency Projects */}
      {agencyProjects.length > 0 && (
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Agency Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agencyProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {projects.docs.length === 0 && (
        <div className="container">
          <p className="text-center text-muted-foreground">No projects yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
    >
      {project.heroImage && typeof project.heroImage === 'object' && (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Media resource={project.heroImage} className="object-cover" fill />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        {project.excerpt && <p className="text-muted-foreground line-clamp-3">{project.excerpt}</p>}
        {project.projectStatus && (
          <span className="inline-block mt-4 text-sm text-muted-foreground capitalize">
            {project.projectStatus.replace('-', ' ')}
          </span>
        )}
      </div>
    </Link>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Projects | HCE Venture Studio',
    description:
      'Explore our portfolio of ventures and client work, showcasing innovation at the intersection of AI and human-centric values.',
  }
}
