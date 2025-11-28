import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { joinForm as joinFormData } from './join-form'
import { home } from './home'
import { aboutPage } from './about-page'
import { joinPage } from './join-page'
import { whitepaperPage } from './whitepaper-page'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { profileSimonHolmes } from './profile-simon-holmes'
import { profileJohnDurrant } from './profile-john-durrant'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { ventureProject1, agencyProject1, agencyProject2 } from './project-seed-data'
import {
  networkMember1,
  networkMember2,
  networkMember3,
  simonHolmes,
  johnDurrant,
} from './network-seed-data'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'projects',
  'network',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [
    image1Buffer,
    image2Buffer,
    image3Buffer,
    hero1Buffer,
    profileSimonBuffer,
    profileJohnBuffer,
  ] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
    fetchFileByURL('profile-simon-holmes.webp'),
    fetchFileByURL('profile-john-durrant.webp'),
  ])

  const [
    demoAuthor,
    image1Doc,
    image2Doc,
    image3Doc,
    imageHomeDoc,
    profileSimonDoc,
    profileJohnDoc,
  ] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
      },
    }),
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: profileSimonHolmes,
      file: profileSimonBuffer,
    }),
    payload.create({
      collection: 'media',
      data: profileJohnDurrant,
      file: profileJohnBuffer,
    }),
    categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: {
          title: category,
          slug: category,
        },
      }),
    ),
  ])

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
  })

  payload.logger.info(`— Seeding forms...`)

  const [contactForm, joinForm] = await Promise.all([
    payload.create({
      collection: 'forms',
      depth: 0,
      data: contactFormData,
    }),
    payload.create({
      collection: 'forms',
      depth: 0,
      data: joinFormData,
    }),
  ])

  payload.logger.info(`— Seeding pages...`)

  const [_homePage, _aboutPageDoc, contactPage, _joinPageDoc, _whitepaperPageDoc] =
    await Promise.all([
      payload.create({
        collection: 'pages',
        depth: 0,
        data: home({ heroImage: imageHomeDoc }),
      }),
      payload.create({
        collection: 'pages',
        depth: 0,
        data: aboutPage({ heroImage: imageHomeDoc }),
      }),
      payload.create({
        collection: 'pages',
        depth: 0,
        data: contactPageData({ contactForm: contactForm }),
      }),
      payload.create({
        collection: 'pages',
        depth: 0,
        data: joinPage({ joinForm: joinForm }),
      }),
      payload.create({
        collection: 'pages',
        depth: 0,
        data: whitepaperPage({ heroImage: imageHomeDoc }),
      }),
    ])

  payload.logger.info(`— Seeding projects...`)

  await Promise.all([
    payload.create({
      collection: 'projects',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: ventureProject1({ heroImageID: imageHomeDoc.id }) as any,
    }),
    payload.create({
      collection: 'projects',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: agencyProject1({ heroImageID: image1Doc.id }) as any,
    }),
    payload.create({
      collection: 'projects',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: agencyProject2({ heroImageID: image2Doc.id }) as any,
    }),
  ])

  payload.logger.info(`— Seeding network...`)

  // Do not create network members with `Promise.all` because we want them to be created in order
  // This way we can sort them by `createdAt` and they will be in the expected order
  await payload.create({
    collection: 'network',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: simonHolmes({ profileImageID: profileSimonDoc.id }),
  })

  await payload.create({
    collection: 'network',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: johnDurrant({ profileImageID: profileJohnDoc.id }),
  })

  await payload.create({
    collection: 'network',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: networkMember1({ profileImageID: image1Doc.id }),
  })

  await payload.create({
    collection: 'network',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: networkMember2({ profileImageID: image2Doc.id }),
  })

  await payload.create({
    collection: 'network',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: networkMember3({ profileImageID: image3Doc.id }),
  })

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'About',
              url: '/about',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Projects',
              url: '/projects',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Whitepaper',
              url: '/whitepaper',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Network',
              url: '/network',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'About',
              url: '/about',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Projects',
              url: '/projects',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Whitepaper',
              url: '/whitepaper',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Join Us',
              url: '/join',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(urlOrPath: string): Promise<File> {
  // If it's a local file (doesn't start with http), read from filesystem
  if (!urlOrPath.startsWith('http')) {
    // Use process.cwd() to get project root, then navigate to src/endpoints/seed
    const filePath = resolve(process.cwd(), 'src/endpoints/seed', urlOrPath)
    const buffer = readFileSync(filePath)
    const name = urlOrPath.split('/').pop() || `file-${Date.now()}`
    const ext = name.split('.').pop()

    return {
      name,
      data: buffer,
      mimetype: `image/${ext}`,
      size: buffer.byteLength,
    }
  }

  // Otherwise, fetch from URL (existing logic)
  const res = await fetch(urlOrPath, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${urlOrPath}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: urlOrPath.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${urlOrPath.split('.').pop()}`,
    size: data.byteLength,
  }
}
