# Code Organization & Error Handling Patterns

## Code Organization Principles

### 1. Collection-Centric Organization

Each Payload collection follows a consistent structure:

```
src/collections/
├── Pages/
│   ├── index.ts              # Collection configuration
│   ├── hooks/
│   │   └── revalidatePage.ts # Collection-specific hooks
│   └── access/               # Collection-specific access control (if complex)
│
├── Posts/
│   ├── index.ts
│   └── hooks/
│       └── revalidatePost.ts
│
├── Media.ts                  # Simple collections as single files
├── Categories.ts
└── Users/
    └── index.ts
```

**Pattern Rules**:
- **Simple collections**: Single file (e.g., `Media.ts`, `Categories.ts`)
- **Complex collections**: Directory with `index.ts` + subdirectories for hooks/access
- **Shared logic**: Extract to `src/access/` or `src/hooks/` for reuse

---

### 2. Block-Based Layout Architecture

Layout builder blocks are self-contained components:

```
src/blocks/
├── CallToAction/
│   ├── config.ts             # Payload block configuration
│   ├── Component.tsx         # React component for frontend
│   └── schema.ts             # (optional) Shared field definitions
│
├── Content/
│   ├── config.ts
│   └── Component.tsx
│
└── RenderBlocks.tsx          # Central block renderer
```

**Implementation** (`src/blocks/RenderBlocks.tsx`):

```typescript
import React, { Fragment } from 'react'
import type { Page, Post } from '@/payload-types'
import { ArchiveBlock } from './ArchiveBlock/Component'
import { CallToActionBlock } from './CallToAction/Component'
import { ContentBlock } from './Content/Component'
import { MediaBlock } from './MediaBlock/Component'
import { FormBlock } from './Form/Component'

const blockComponents = {
  archive: ArchiveBlock,
  cta: CallToActionBlock,
  content: ContentBlock,
  mediaBlock: MediaBlock,
  formBlock: FormBlock,
}

export const RenderBlocks: React.FC<{
  blocks: (Page['layout'][0] | Post['layout'][0])[]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div key={index} className="my-8">
                  <Block {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
```

**Block Configuration Example** (`src/blocks/CallToAction/config.ts`):

```typescript
import type { Block } from 'payload'

export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          name: 'link',
          type: 'group',
          fields: [
            {
              name: 'type',
              type: 'radio',
              options: [
                { label: 'Internal', value: 'reference' },
                { label: 'Custom URL', value: 'custom' },
              ],
              defaultValue: 'reference',
              admin: {
                layout: 'horizontal',
              },
            },
            {
              name: 'newTab',
              type: 'checkbox',
              label: 'Open in new tab',
            },
            {
              name: 'reference',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'reference',
              },
            },
            {
              name: 'url',
              type: 'text',
              label: 'Custom URL',
              required: true,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'custom',
              },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
```

---

### 3. Utility Function Organization

**Pattern**: Group utilities by concern, not by type.

```
src/utilities/
├── getDocument.ts            # Data fetching
├── getGlobals.ts
├── getMeUser.ts
├── getRedirects.ts
│
├── generateMeta.ts           # SEO & metadata
├── generatePreviewPath.ts
├── mergeOpenGraph.ts
│
├── formatDateTime.ts         # Formatting & transformation
├── formatAuthors.ts
├── toKebabCase.ts
│
├── deepMerge.ts              # Data manipulation
├── canUseDOM.ts              # Environment detection
│
└── useClickableCard.ts       # React hooks
    useDebounce.ts
```

**Naming Convention**:
- `get*` - Data fetching functions (async)
- `generate*` - Computed value functions
- `format*` - Data formatting/transformation
- `use*` - React hooks

---

## Error Handling Patterns

### 1. Graceful Degradation for Missing Content

**Pattern**: Use `notFound()` for missing pages, fallback for missing blocks.

```typescript
// app/(frontend)/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getCachedDocument } from '@/utilities/getDocument'

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await getCachedDocument('pages', params.slug)()

  // Return 404 if page doesn't exist
  if (!page) {
    notFound()
  }

  // Return 404 if page is draft and user not authenticated
  if (page._status === 'draft') {
    // Would need to check user auth here
    notFound()
  }

  return <PageTemplate data={page} />
}
```

**Not Found Page** (`app/(frontend)/not-found.tsx`):

```typescript
import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container py-28">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        Return to Home
      </Link>
    </div>
  )
}
```

---

### 2. Try-Catch with Logging for API Operations

**Pattern**: Catch errors, log details, return user-friendly messages.

```typescript
// app/(frontend)/next/seed/route.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Attempt seed operation
    await seed({ payload })

    return NextResponse.json(
      { message: 'Database seeded successfully' },
      { status: 200 }
    )
  } catch (error) {
    // Log full error for debugging
    console.error('Seed error:', error)

    // Return sanitized error to client
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

**Logging Best Practices**:
- Use `payload.logger` for Payload-related logs
- Use `console.error` for application errors
- Include context (collection, operation, document ID)
- Never log sensitive data (passwords, tokens)

---

### 3. Validation Error Handling

**Pattern**: Let Payload handle validation, catch for custom logic.

```typescript
// Collection hook example
import type { CollectionBeforeChangeHook } from 'payload'
import { ValidationError } from 'payload'

export const validateSlugUniqueness: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === 'create' || operation === 'update') {
    const { slug } = data

    // Check if slug already exists
    const existing = await req.payload.find({
      collection: 'pages',
      where: {
        slug: { equals: slug },
        id: { not_equals: data.id },  // Exclude current document
      },
    })

    if (existing.docs.length > 0) {
      throw new ValidationError({
        errors: [
          {
            field: 'slug',
            message: `A page with slug "${slug}" already exists`,
          },
        ],
      })
    }
  }

  return data
}
```

**Frontend Validation Display**:

```typescript
// Form component
const handleSubmit = async (data) => {
  try {
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()

      // Display validation errors
      if (errorData.errors) {
        errorData.errors.forEach((err) => {
          setError(err.field, { message: err.message })
        })
      }

      return
    }

    // Success handling
    router.push('/success')
  } catch (error) {
    console.error('Form submission error:', error)
    setError('root', { message: 'An unexpected error occurred' })
  }
}
```

---

### 4. Revalidation Error Handling

**Pattern**: Log revalidation failures but don't block operations.

```typescript
import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidatePage: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  if (doc._status === 'published') {
    const path = `/${doc.slug}`

    try {
      // Attempt revalidation
      revalidatePath(path)
      revalidateTag(`pages_${doc.slug}`)

      req.payload.logger.info(`✓ Revalidated: ${path}`)
    } catch (error) {
      // Log error but don't throw (don't block save operation)
      req.payload.logger.error(`✗ Revalidation failed for ${path}:`, error)

      // Optionally queue for retry
      // await queueRevalidation(path)
    }
  }

  return doc
}
```

**Why Non-Blocking**:
- Revalidation failures shouldn't prevent content saves
- Cache will eventually be invalidated by TTL
- Users can manually trigger rebuild if needed

---

## Revalidation Strategies

### Cache Tag Naming Convention

**Pattern**: Use consistent, hierarchical cache tags.

```typescript
// Format: {collection}_{identifier}
revalidateTag('pages_home')           // Specific page
revalidateTag('pages_all')            // All pages collection
revalidateTag('posts_123')            // Specific post by ID
revalidateTag('global_header')        // Global data

// Hierarchical tags for complex invalidation
revalidateTag('category_tech')        // All posts in category
revalidateTag('author_456')           // All posts by author
```

**Implementation**:

```typescript
// src/utilities/getDocument.ts
export const getCachedDocument = (collection: Collection, slug: string) =>
  unstable_cache(
    async () => getDocument(collection, slug),
    [collection, slug],
    {
      tags: [
        `${collection}_${slug}`,    // Specific document
        `${collection}_all`,        // All documents in collection
      ],
    }
  )

// Revalidate specific document
revalidateTag('pages_about')

// Revalidate entire collection (e.g., when adding new page to archive)
revalidateTag('pages_all')
```

---

### On-Demand vs. Time-Based Revalidation

**Current Strategy**: **On-Demand Only** (no time-based revalidation)

**Rationale**:
- Content changes are explicit (editor publishes)
- Unnecessary to check for updates on interval
- Reduces database load

**Implementation**:

```typescript
// ✅ On-demand revalidation (current pattern)
export const revalidate = false  // Never revalidate based on time

// Cache until explicitly invalidated
export default async function Page({ params }) {
  const page = await getCachedDocument('pages', params.slug)()
  return <PageTemplate data={page} />
}
```

**Alternative for Frequently Updated Content**:

```typescript
// ⚠️ Time-based revalidation (use sparingly)
export const revalidate = 3600  // Revalidate every hour

export default async function PostsPage() {
  const posts = await getCachedPosts()()
  return <PostsList posts={posts} />
}
```

---

## Access Control Patterns

### Declarative Access Control

**Pattern**: Define access rules in collection config, not in route handlers.

```typescript
// src/collections/Pages/index.ts
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: authenticated,                    // Only logged-in users
    read: authenticatedOrPublished,           // Public sees published, users see all
    update: authenticated,
    delete: authenticated,
    admin: authenticated,                     // Who can access in admin UI
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: {
        read: authenticated,                  // Field-level access control
        update: authenticated,
      },
    },
  ],
}
```

**Access Control Functions** (`src/access/authenticatedOrPublished.ts`):

```typescript
import type { Access } from 'payload'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  // Authenticated users see everything
  if (user) {
    return true
  }

  // Public sees only published documents
  return {
    _status: {
      equals: 'published',
    },
  }
}
```

---

### Dynamic Access Control

**Pattern**: Use functions for complex access logic.

```typescript
// Only allow users to edit their own posts
export const isAuthorOrAdmin: Access = ({ req: { user } }) => {
  // Admins see everything
  if (user?.role === 'admin') {
    return true
  }

  // Regular users see only their own posts
  if (user) {
    return {
      author: {
        equals: user.id,
      },
    }
  }

  // Public sees only published
  return {
    _status: {
      equals: 'published',
    },
  }
}
```

---

## Performance Optimization Patterns

### 1. Depth Control for Relationships

**Pattern**: Limit `depth` parameter to prevent over-fetching.

```typescript
// ❌ BAD: Deep population (many queries)
const post = await payload.find({
  collection: 'posts',
  where: { slug: { equals: 'my-post' } },
  depth: 5,  // Will populate 5 levels of relationships
})

// ✅ GOOD: Shallow population (fewer queries)
const post = await payload.find({
  collection: 'posts',
  where: { slug: { equals: 'my-post' } },
  depth: 1,  // Only populate first level (e.g., author, hero image)
})
```

**Selective Population**:

```typescript
// Fetch post with only specific fields from relationships
const post = await payload.find({
  collection: 'posts',
  where: { slug: { equals: 'my-post' } },
  depth: 0,  // Don't populate relationships
})

// Manually fetch related data if needed
if (post.author) {
  const author = await payload.findByID({
    collection: 'users',
    id: post.author,
    depth: 0,
  })
}
```

---

### 2. Parallel Data Fetching

**Pattern**: Use `Promise.all` for independent queries.

```typescript
// ✅ GOOD: Parallel fetching
export default async function Page({ params }) {
  const [page, header, footer, relatedPosts] = await Promise.all([
    getCachedDocument('pages', params.slug)(),
    getCachedGlobal('header', 1)(),
    getCachedGlobal('footer', 1)(),
    getRelatedPosts(params.slug),
  ])

  return <PageTemplate page={page} header={header} footer={footer} relatedPosts={relatedPosts} />
}

// ❌ BAD: Sequential fetching (slower)
export default async function Page({ params }) {
  const page = await getCachedDocument('pages', params.slug)()
  const header = await getCachedGlobal('header', 1)()
  const footer = await getCachedGlobal('footer', 1)()
  const relatedPosts = await getRelatedPosts(params.slug)

  return <PageTemplate page={page} header={header} footer={footer} relatedPosts={relatedPosts} />
}
```

---

### 3. Selective Field Projection

**Pattern**: Fetch only needed fields to reduce payload size.

```typescript
// Fetch only title and slug for archive pages
const posts = await payload.find({
  collection: 'posts',
  limit: 20,
  depth: 0,
  select: {
    title: true,
    slug: true,
    publishedAt: true,
    meta: {
      image: true,
    },
  },
})
```

---

## Testing Patterns

### Unit Testing Utilities

```typescript
// tests/int/utilities/formatDateTime.int.spec.ts
import { describe, it, expect } from 'vitest'
import { formatDateTime } from '@/utilities/formatDateTime'

describe('formatDateTime', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-15T10:30:00Z')
    const formatted = formatDateTime(date)

    expect(formatted).toBe('January 15, 2025')
  })

  it('should handle invalid dates', () => {
    const formatted = formatDateTime(null)

    expect(formatted).toBe('')
  })
})
```

### Integration Testing with Payload

```typescript
// tests/int/collections/pages.int.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

describe('Pages Collection', () => {
  let payload

  beforeEach(async () => {
    payload = await getPayload({ config: configPromise })
  })

  it('should create a page', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Test Page',
        slug: 'test-page',
        layout: [],
      },
    })

    expect(page.id).toBeDefined()
    expect(page.title).toBe('Test Page')
  })

  it('should enforce access control', async () => {
    const result = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'draft' } },
      user: null,  // No authenticated user
    })

    expect(result.docs.length).toBe(0)  // Should not return drafts
  })
})
```

---

## Decision History & Trade-offs

### Why Collection-Centric Organization?

**Decision**: Organize code by Payload collections rather than by layer (models/controllers/views).

**Rationale**:
- **Cohesion**: Related code (config, hooks, access) stays together
- **Scalability**: Easy to add new collections without touching many directories
- **Mental Model**: Matches Payload's collection-based architecture

**Trade-offs**:
- Shared logic requires extraction to top-level directories
- Slightly more complex for developers used to MVC

**Mitigation**:
- Clear naming for shared directories (`src/access/`, `src/hooks/`)
- Documentation of organization principles

### Why On-Demand Revalidation Only?

**Decision**: Disable time-based revalidation, use only on-demand.

**Rationale**:
- **Predictability**: Content updates only when editor publishes
- **Performance**: No unnecessary database queries
- **Cost**: Reduced server load in production

**Trade-offs**:
- Must ensure revalidation hooks trigger correctly
- No automatic recovery if revalidation fails

**Mitigation**:
- Comprehensive error logging for revalidation failures
- Manual rebuild option in admin panel
- Monitoring for cache freshness

---

## Next Steps

- Review [Authentication Overview](../auth/overview.md) for user authentication patterns
- See [API Endpoints](../api/endpoints.md) for REST API structure
- Review [Guidelines](../guidelines.md) for development workflow
