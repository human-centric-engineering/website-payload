import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Project } from '../../../payload-types'

export const revalidateProject: CollectionAfterChangeHook<Project> = ({
  doc,
  previousDoc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/projects/${doc.slug}`

      payload.logger.info(`Revalidating project at path: ${path}`)

      revalidatePath(path)
      revalidateTag('projects-collection')
    }

    // If the project was previously published, but is now in draft status, revalidate the path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const path = `/projects/${doc.slug}`

      payload.logger.info(`Revalidating project at path: ${path}`)

      revalidatePath(path)
      revalidateTag('projects-collection')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Project> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    const path = `/projects/${doc?.slug}`

    payload.logger.info(`Revalidating project at path: ${path}`)

    revalidatePath(path)
    revalidateTag('projects-collection')
  }

  return doc
}
