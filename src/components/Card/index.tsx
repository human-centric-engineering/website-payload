'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Project } from '@/payload-types'

import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import { getProjectTypeLabel, getProjectStatusLabel } from '@/utilities/projectLabels'

export type CardPostData =
  | Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>
  | Pick<Project, 'slug' | 'meta' | 'title' | 'projectType' | 'projectStatus'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts' | 'projects'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, meta, title } = doc || {}
  const categories = doc && 'categories' in doc ? doc.categories : undefined
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        'flex flex-col',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-[16/9] bg-muted">
        {!metaImage && <div className="flex items-center justify-center h-full text-muted-foreground">No image</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} imgClassName="object-cover" fill />}
      </div>
      <div className="p-4 flex flex-col flex-1">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}

        {/* Project Tags - bottom aligned */}
        {relationTo === 'projects' && doc && 'projectType' in doc && (
          <div className="flex flex-wrap gap-2 mt-auto pt-4">
            <Badge variant="default">{getProjectTypeLabel(doc.projectType)}</Badge>
            {doc.projectStatus && (
              <Badge variant="secondary">{getProjectStatusLabel(doc.projectStatus)}</Badge>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
