# Dependency Injection & Integration Patterns

## Payload Local API Pattern

Payload CMS provides a **Local API** for server-side operations that bypasses HTTP overhead. This is the primary method for fetching data in Next.js Server Components and API routes.

### Core Injection Pattern

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Get Payload instance (cached per request)
const payload = await getPayload({ config: configPromise })

// Use Local API methods
const pages = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  depth: 2,
})
```

**Key Characteristics**:
- **Server-Only**: Never expose to client-side code
- **No Authentication Required**: Bypasses access control (use sparingly)
- **Direct Database Access**: No HTTP serialization overhead
- **Type-Safe**: Returns typed documents based on `payload-types.ts`

---

## Next.js Server Component Integration

### Pattern 1: Cached Document Fetching

**Implementation** (`src/utilities/getDocument.ts`):

```typescript
import type { Config } from 'src/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection,
    depth,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs[0]
}

// Cached version with automatic invalidation
export const getCachedDocument = (collection: Collection, slug: string) =>
  unstable_cache(
    async () => getDocument(collection, slug),
    [collection, slug],  // Cache key
    { tags: [`${collection}_${slug}`] }  // Invalidation tag
  )
```

**Usage in Server Component**:

```typescript
// app/(frontend)/[slug]/page.tsx
import { getCachedDocument } from '@/utilities/getDocument'

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await getCachedDocument('pages', params.slug)()

  if (!page) {
    notFound()
  }

  return <PageTemplate data={page} />
}
```

**Cache Invalidation**: Automatically triggered by `revalidateTag('pages_about')` in hooks.

---

### Pattern 2: Global Data Fetching

**Implementation** (`src/utilities/getGlobals.ts`):

```typescript
import type { GlobalSlug } from 'payload'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export async function getGlobal(slug: GlobalSlug, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

export const getCachedGlobal = (slug: GlobalSlug, depth = 0) =>
  unstable_cache(
    async () => getGlobal(slug, depth),
    [slug],
    { tags: [slug] }
  )
```

**Usage**:

```typescript
// app/(frontend)/layout.tsx
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const header = await getCachedGlobal('header', 1)()
  const footer = await getCachedGlobal('footer', 1)()

  return (
    <html>
      <body>
        <Header data={header} />
        {children}
        <Footer data={footer} />
      </body>
    </html>
  )
}
```

---

## Access Control Integration

### Respecting Access Control with Local API

By default, Local API **bypasses access control**. To enforce access control server-side:

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'

async function getDocumentWithAuth(slug: string) {
  const payload = await getPayload({ config: configPromise })

  // Create request context with authentication
  const cookieStore = cookies()
  const token = cookieStore.get('payload-token')?.value

  // Verify token and get user
  const { user } = token
    ? await payload.auth.verifyEmail({
        collection: 'users',
        token,
      })
    : { user: null }

  // Find with access control enforced
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    user,  // Enforce access control based on user
  })

  return result.docs[0]
}
```

**When to Use**:
- Draft preview routes (must respect user permissions)
- User-specific data (e.g., "my posts")
- Admin API routes that should honor access control

**When to Skip**:
- Public pages with `authenticatedOrPublished` access (already public)
- Server-side rendering where access control is guaranteed by route

---

## Hook Integration Patterns

### Lifecycle Hooks for Revalidation

**Pattern**: Trigger Next.js revalidation after content changes.

**Implementation** (`src/collections/Pages/hooks/revalidatePage.ts`):

```typescript
import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidatePage: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only revalidate if document is published
  if (doc._status === 'published') {
    const path = `/${doc.slug}`

    // Revalidate specific page
    revalidatePath(path)

    // Revalidate cache tag for this document
    revalidateTag(`pages_${doc.slug}`)

    req.payload.logger.info(`Revalidated: ${path}`)
  }

  // If slug changed, revalidate old path
  if (
    operation === 'update' &&
    previousDoc.slug !== doc.slug &&
    previousDoc._status === 'published'
  ) {
    const oldPath = `/${previousDoc.slug}`
    revalidatePath(oldPath)
    revalidateTag(`pages_${previousDoc.slug}`)

    req.payload.logger.info(`Revalidated old path: ${oldPath}`)
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  const path = `/${doc.slug}`
  revalidatePath(path)
  revalidateTag(`pages_${doc.slug}`)

  req.payload.logger.info(`Revalidated after delete: ${path}`)

  return doc
}
```

**Registration** (`src/collections/Pages/index.ts`):

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  // ... other config
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
}
```

---

### Auto-Population Hooks

**Pattern**: Automatically set field values during lifecycle events.

**Implementation** (`src/hooks/populatePublishedAt.ts`):

```typescript
import type { CollectionBeforeChangeHook } from 'payload'

export const populatePublishedAt: CollectionBeforeChangeHook = ({
  data,
  operation,
  req,
}) => {
  if (operation === 'create' || operation === 'update') {
    // Set publishedAt if not already set
    if (req.data && !req.data.publishedAt) {
      const now = new Date()
      return {
        ...data,
        publishedAt: now,
      }
    }
  }

  return data
}
```

**Usage**:

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  // ...
}
```

---

## Plugin Integration

### Configuring Plugins with Dependencies

**Implementation** (`src/plugins/index.ts`):

```typescript
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website` : 'Payload Website'
}

const generateURL = ({ doc }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  // SEO Plugin - adds meta fields to collections
  seoPlugin({
    generateTitle,
    generateURL,
  }),

  // Redirects Plugin - URL redirect management
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      hooks: {
        afterChange: [revalidateRedirects],  // Revalidate on redirect change
      },
    },
  }),

  // Search Plugin - full-text search
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,  // Custom indexing logic
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...customSearchFields]
      },
    },
  }),

  // Form Builder Plugin
  formBuilderPlugin({
    fields: { payment: false },
    formOverrides: {
      fields: ({ defaultFields }) => {
        // Customize form fields
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return { ...field, editor: customLexicalEditor }
          }
          return field
        })
      },
    },
  }),

  // Nested Docs Plugin - hierarchical categories
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
]
```

---

## Next.js API Route Integration

### REST API Handler Pattern

**Generated Handler** (`src/app/(payload)/api/[...slug]/route.ts`):

```typescript
import config from '@payload-config'
import {
  REST_DELETE,
  REST_GET,
  REST_PATCH,
  REST_POST,
  REST_PUT,
  REST_OPTIONS,
} from '@payloadcms/next/routes'

// Payload handles all HTTP methods
export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

**Custom Endpoint** (`src/endpoints/seed/index.ts`):

```typescript
import type { PayloadHandler } from 'payload'

export const seedHandler: PayloadHandler = async (req, res) => {
  const { payload, user } = req

  // Require authentication
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Use Local API within endpoint
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Seeded Page',
        slug: 'seeded-page',
      },
    })

    return res.status(200).json({ message: 'Database seeded' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
```

---

## Decision History & Trade-offs

### Why Payload Local API vs. REST API?

**Decision**: Use Local API for server-side data fetching, REST API for admin UI.

**Rationale**:
- **Performance**: Local API eliminates HTTP overhead (~50-100ms savings)
- **Type Safety**: Direct access to typed Payload instance
- **Simplicity**: No need to manage authentication tokens server-side
- **Security**: Keeps database credentials server-only

**Trade-offs**:
- Local API bypasses access control (must be intentional)
- Cannot use Local API in client components
- Requires understanding of both APIs

**Mitigation**:
- Document when to use each API
- Provide utility wrappers with access control
- Generate types for both APIs

### Why `unstable_cache` vs. React `cache`?

**Decision**: Use Next.js `unstable_cache` for Payload data fetching.

**Rationale**:
- **Cache Tags**: Enable granular invalidation via `revalidateTag()`
- **Persistence**: Cache persists across requests (not just render)
- **Revalidation**: Integrates with Next.js revalidation system

**Trade-offs**:
- API marked "unstable" (may change in future Next.js versions)
- More complex than simple React `cache()`
- Requires careful tag management

**Mitigation**:
- Abstract caching in utility functions
- Centralize cache tag naming convention
- Monitor Next.js updates for API changes

---

## Testing Patterns

### Mocking Payload Local API

```typescript
// vitest.setup.ts
import { vi } from 'vitest'

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [] }),
    findGlobal: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
  }),
}))
```

### Integration Test Example

```typescript
// tests/int/getDocument.int.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getDocument } from '@/utilities/getDocument'

describe('getDocument', () => {
  it('should fetch document by slug', async () => {
    const page = await getDocument('pages', 'home')

    expect(page).toBeDefined()
    expect(page.slug).toBe('home')
  })

  it('should return undefined for non-existent slug', async () => {
    const page = await getDocument('pages', 'does-not-exist')

    expect(page).toBeUndefined()
  })
})
```

---

## Next Steps

- Review [Patterns](./patterns.md) for error handling and code organization
- See [API Examples](../api/examples.md) for client-side integration patterns
- Review [Database Models](../database/models.md) for collection schemas
