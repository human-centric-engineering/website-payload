# Database Models & Validation

## Generated Types

All database models are auto-generated from Payload collection configs:

```bash
pnpm generate:types
```

**Output**: `src/payload-types.ts`

**Usage**:
```typescript
import type { Page, Post, Media, User, Category } from '@/payload-types'
```

---

## Collection Models

### Page Model

```typescript
export interface Page {
  id: number
  title: string
  slug: string
  _status?: ('draft' | 'published') | null
  layout?: (
    | CallToActionBlock
    | ContentBlock
    | MediaBlock
    | ArchiveBlock
    | FormBlock
  )[]
  meta?: {
    title?: string | null
    description?: string | null
    image?: number | Media | null
  }
  publishedAt?: string | null
  updatedAt: string
  createdAt: string
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Auto-generated ID |
| `title` | `string` | Yes | Page title (max 255 chars) |
| `slug` | `string` | Yes | URL slug (unique, auto-slugified) |
| `_status` | `'draft' \| 'published'` | No | Publication status (default: 'draft') |
| `layout` | `LayoutBlock[]` | No | Array of layout builder blocks |
| `meta` | `object` | No | SEO metadata |
| `publishedAt` | `string` | No | ISO 8601 timestamp |
| `updatedAt` | `string` | Yes | Auto-managed timestamp |
| `createdAt` | `string` | Yes | Auto-managed timestamp |

---

### Post Model

```typescript
export interface Post {
  id: number
  title: string
  slug: string
  _status?: ('draft' | 'published') | null
  authors?:
    | {
        id?: string | null
        author?: number | User | null
      }[]
    | null
  categories?: (number | Category)[] | null
  hero?: {
    type: 'lowImpact' | 'mediumImpact' | 'highImpact'
    media?: number | Media | null
  }
  layout?: (
    | CallToActionBlock
    | ContentBlock
    | MediaBlock
    | ArchiveBlock
    | FormBlock
    | CodeBlock
  )[]
  meta?: {
    title?: string | null
    description?: string | null
    image?: number | Media | null
  }
  relatedPosts?: (number | Post)[] | null
  publishedAt?: string | null
  populatedAuthors?:
    | {
        id?: string | null
        name?: string | null
      }[]
    | null
  updatedAt: string
  createdAt: string
}
```

**Unique Features**:
- **authors**: Array of users (many-to-many relationship)
- **categories**: Array of category IDs/objects
- **hero**: Nested group with media relationship
- **relatedPosts**: Self-referencing relationship
- **populatedAuthors**: Virtual field (computed by hook)

---

### Project Model

```typescript
export interface Project {
  id: number
  title: string
  slug: string
  _status?: ('draft' | 'published') | null
  projectType: 'venture' | 'agency'
  projectStatus: 'active' | 'completed' | 'in-development'
  heroImage: number | Media
  excerpt: string
  description: {
    root: {
      type: string
      children: any[]
      direction: 'ltr' | 'rtl' | null
      format: string
      indent: number
      version: number
    }
  }
  technologies?: { tech: string; id?: string }[] | null
  links?: {
    website?: string | null
    caseStudy?: string | null
    repository?: string | null
  } | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: number | Media | null
  }
  publishedAt?: string | null
  updatedAt: string
  createdAt: string
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Auto-generated ID |
| `title` | `string` | Yes | Project title |
| `slug` | `string` | Yes | URL slug (unique) |
| `_status` | `'draft' \| 'published'` | No | Publication status |
| `projectType` | `'venture' \| 'agency'` | Yes | Project category |
| `projectStatus` | `enum` | Yes | Current status (active/completed/in-development) |
| `heroImage` | `Media` | Yes | Hero image relationship |
| `excerpt` | `string` | Yes | Brief description for listings |
| `description` | `Lexical JSON` | Yes | Full rich text description with toolbar |
| `technologies` | `array` | No | Technologies used |
| `links` | `object` | No | External project links |
| `meta` | `object` | No | SEO metadata |
| `publishedAt` | `string` | No | ISO 8601 timestamp |

**Important Notes**:
- `projectStatus` field renamed from `status` to avoid enum conflict with `_status`
- Description uses Lexical editor with FixedToolbarFeature and InlineToolbarFeature
- All listitem nodes in seed data must include `indent: 0` property

---

### Network Model

```typescript
export interface Network {
  id: number
  name: string
  role: 'designer' | 'developer' | 'strategist' | 'marketer' | 'other'
  bio?: string | null
  photo?: number | Media | null
  skills?: { skill: string; id?: string }[] | null
  featured?: boolean | null
  links?: {
    linkedIn?: string | null
    github?: string | null
    website?: string | null
  } | null
  updatedAt: string
  createdAt: string
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Auto-generated ID |
| `name` | `string` | Yes | Member name |
| `role` | `enum` | Yes | Primary role in network |
| `bio` | `string` | No | Member biography (textarea) |
| `photo` | `Media` | No | Profile photo relationship |
| `skills` | `array` | No | Array of skill strings |
| `featured` | `boolean` | No | Show on homepage (default: false) |
| `links` | `object` | No | Social/professional links |
| `updatedAt` | `string` | Yes | Auto-managed timestamp |
| `createdAt` | `string` | Yes | Auto-managed timestamp |

---

### Media Model

```typescript
export interface Media {
  id: number
  alt?: string | null
  updatedAt: string
  createdAt: string
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
  sizes?: {
    thumbnail?: {
      url?: string | null
      width?: number | null
      height?: number | null
      mimeType?: string | null
      filesize?: number | null
      filename?: string | null
    }
    card?: {
      url?: string | null
      width?: number | null
      height?: number | null
      mimeType?: string | null
      filesize?: number | null
      filename?: string | null
    }
    tablet?: {
      url?: string | null
      width?: number | null
      height?: number | null
      mimeType?: string | null
      filesize?: number | null
      filename?: string | null
    }
  }
  prefix?: string | null
}
```

**Image Sizes**:
- **thumbnail**: 400x300 (cropped)
- **card**: 768x1024 (portrait)
- **tablet**: 1024xAUTO (landscape, maintain aspect ratio)

**Focal Point**:
- `focalX` / `focalY`: 0-100 (percentage from top-left)
- Used for smart cropping in responsive sizes

---

### Category Model

```typescript
export interface Category {
  id: number
  title: string
  slug?: string | null
  parent?: number | Category | null
  breadcrumbs?:
    | {
        doc?: number | Category | null
        url?: string | null
        label?: string | null
        id?: string | null
      }[]
    | null
  updatedAt: string
  createdAt: string
}
```

**Nested Structure**:
- **parent**: Self-referencing relationship for hierarchy
- **breadcrumbs**: Auto-generated path from root to current category

**Example Breadcrumbs**:
```json
[
  {
    "doc": 1,
    "url": "/technology",
    "label": "Technology",
    "id": "abc123"
  },
  {
    "doc": 5,
    "url": "/technology/software",
    "label": "Software",
    "id": "def456"
  }
]
```

---

### User Model

```typescript
export interface User {
  id: number
  name?: string | null
  updatedAt: string
  createdAt: string
  email: string
  password: string
  loginAttempts?: number | null
  lockUntil?: string | null
}
```

**Security Fields**:
- **password**: Bcrypt hashed (never returned in API responses)
- **loginAttempts**: Incremented on failed logins
- **lockUntil**: ISO timestamp when account lock expires

**Note**: Password field excluded from API responses automatically.

---

## Layout Block Types

### CallToAction Block

```typescript
export interface CallToActionBlock {
  blockType: 'cta'
  heading?: string | null
  description?: string | null
  links?:
    | {
        link: {
          type?: ('reference' | 'custom') | null
          newTab?: boolean | null
          reference?: {
            relationTo: 'pages'
            value: number | Page
          } | null
          url?: string | null
          label: string
        }
        id?: string | null
      }[]
    | null
  id?: string | null
  blockName?: string | null
}
```

---

### Content Block

```typescript
export interface ContentBlock {
  blockType: 'content'
  content: {
    root: {
      type: string
      children: {
        type: string
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  }
  id?: string | null
  blockName?: string | null
}
```

**Lexical JSON Format**: Content stored as Lexical editor state (rich text).

---

### MediaBlock

```typescript
export interface MediaBlock {
  blockType: 'mediaBlock'
  position?: ('default' | 'fullscreen') | null
  media?: number | Media | null
  id?: string | null
  blockName?: string | null
}
```

---

### Archive Block

```typescript
export interface ArchiveBlock {
  blockType: 'archive'
  introContent?: {
    root: {
      type: string
      children: {
        type: string
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  } | null
  populateBy?: ('populatedDocs' | 'selection') | null
  relationTo?: ('posts') | null
  categories?: (number | Category)[] | null
  limit?: number | null
  selectedDocs?:
    | {
        relationTo: 'posts'
        value: number | Post
      }[]
    | null
  populatedDocs?:
    | {
        relationTo: 'posts'
        value: number | Post
      }[]
    | null
  populatedDocsTotal?: number | null
  id?: string | null
  blockName?: string | null
}
```

---

### Form Block

```typescript
export interface FormBlock {
  blockType: 'formBlock'
  form?: number | Form | null
  enableIntro: boolean
  introContent?: {
    root: {
      type: string
      children: {
        type: string
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  } | null
  enableLink: boolean
  link?: {
    type?: ('reference' | 'custom') | null
    newTab?: boolean | null
    reference?: {
      relationTo: 'pages'
      value: number | Page
    } | null
    url?: string | null
    label: string
    appearance?: ('default' | 'outline') | null
  } | null
  id?: string | null
  blockName?: string | null
}
```

---

## Validation Rules

### Built-In Validators

**String Fields**:
```typescript
{
  name: 'title',
  type: 'text',
  required: true,
  minLength: 1,
  maxLength: 255,
}
```

**Email Fields**:
```typescript
{
  name: 'email',
  type: 'email',
  required: true,
  unique: true,  // Enforced at database level
}
```

**Slug Fields**:
```typescript
{
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  admin: {
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [formatSlug('title')],  // Auto-slugify from title
  },
}
```

---

### Custom Validation

**Field-Level Validation**:

```typescript
{
  name: 'customField',
  type: 'text',
  validate: (value, { data, req }) => {
    if (!value) {
      return 'This field is required'
    }

    if (value.length < 10) {
      return 'Must be at least 10 characters'
    }

    // Async validation
    const exists = await checkUniqueness(value)
    if (exists) {
      return 'This value already exists'
    }

    return true  // Valid
  },
}
```

**Collection-Level Validation**:

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Ensure slug is set
        if (!data.slug && data.title) {
          data.slug = slugify(data.title)
        }

        return data
      },
    ],
  },
}
```

---

### Conditional Validation

**Admin Conditions** (UI only):

```typescript
{
  name: 'redirectUrl',
  type: 'text',
  required: true,
  admin: {
    condition: (data, siblingData) => {
      return data.redirectType === 'url'  // Only show/require if redirectType is 'url'
    },
  },
}
```

**Validation Conditions** (enforced):

```typescript
{
  name: 'redirectUrl',
  type: 'text',
  validate: (value, { data }) => {
    if (data.redirectType === 'url' && !value) {
      return 'Redirect URL is required when redirect type is URL'
    }
    return true
  },
}
```

---

## Hooks for Data Transformation

### Before Change Hook

```typescript
import type { CollectionBeforeChangeHook } from 'payload'

export const populatePublishedAt: CollectionBeforeChangeHook = ({
  data,
  operation,
}) => {
  if (operation === 'create' || operation === 'update') {
    if (!data.publishedAt && data._status === 'published') {
      data.publishedAt = new Date().toISOString()
    }
  }

  return data
}
```

**Registration**:
```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    beforeChange: [populatePublishedAt],
  },
}
```

---

### After Read Hook

```typescript
import type { CollectionAfterReadHook } from 'payload'

export const populateAuthors: CollectionAfterReadHook = async ({
  doc,
  req,
}) => {
  if (doc.authors && Array.isArray(doc.authors)) {
    const populatedAuthors = await Promise.all(
      doc.authors.map(async ({ author }) => {
        if (typeof author === 'number') {
          const user = await req.payload.findByID({
            collection: 'users',
            id: author,
            depth: 0,
          })

          return {
            id: user.id,
            name: user.name || user.email,
          }
        }

        return {
          id: author.id,
          name: author.name || author.email,
        }
      })
    )

    doc.populatedAuthors = populatedAuthors
  }

  return doc
}
```

**Result**: Adds virtual `populatedAuthors` field to API responses.

---

## Relationship Patterns

### Many-to-One Relationship

**Author → Post**:

```typescript
{
  name: 'author',
  type: 'relationship',
  relationTo: 'users',
  required: true,
  hasMany: false,  // Single author
}
```

**Type**:
```typescript
author: number | User  // Can be ID or populated object
```

---

### Many-to-Many Relationship

**Categories → Post**:

```typescript
{
  name: 'categories',
  type: 'relationship',
  relationTo: 'categories',
  hasMany: true,  // Multiple categories
}
```

**Type**:
```typescript
categories?: (number | Category)[] | null
```

---

### Polymorphic Relationship

**Dynamic relationship to multiple collections**:

```typescript
{
  name: 'relatedDoc',
  type: 'relationship',
  relationTo: ['pages', 'posts'],  // Can reference either collection
}
```

**Type**:
```typescript
relatedDoc?:
  | {
      relationTo: 'pages'
      value: number | Page
    }
  | {
      relationTo: 'posts'
      value: number | Post
    }
  | null
```

---

## Type-Safe Queries

### Using Generated Types

```typescript
import type { Page, Post } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Type-safe query
export async function getPublishedPages(): Promise<Page[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs  // Type: Page[]
}

// Type-safe create
export async function createPage(data: {
  title: string
  slug: string
}): Promise<Page> {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.create({
    collection: 'pages',
    data: {
      title: data.title,
      slug: data.slug,
      layout: [],
      _status: 'draft',
    },
  })

  return page  // Type: Page
}
```

---

### Type Guards

```typescript
import type { Media, Page } from '@/payload-types'

// Check if relationship is populated
export function isPopulatedMedia(media: number | Media | null): media is Media {
  return typeof media === 'object' && media !== null && 'url' in media
}

// Usage
if (isPopulatedMedia(page.meta?.image)) {
  console.log(page.meta.image.url)  // Type-safe access
}
```

---

## Computed Fields

### Virtual Fields (After Read)

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        // Add computed field
        doc.readingTime = calculateReadingTime(doc.content)
        return doc
      },
    ],
  },
}
```

**Type Extension**:
```typescript
export interface Post {
  // ... other fields
  readingTime?: number  // Virtual field (not in database)
}
```

---

## Decision History & Trade-offs

### Why Auto-Generated Types?

**Decision**: Generate TypeScript types from Payload schema instead of manual definitions.

**Rationale**:
- **Single Source of Truth**: Schema defines both database and types
- **Consistency**: Types always match database structure
- **Automation**: No manual sync required
- **Safety**: Compile-time errors for schema changes

**Trade-offs**:
- Must regenerate types after schema changes
- Generated file can be large
- Can't customize type names easily

**Mitigation**:
- Fast regeneration (`pnpm generate:types`)
- Exclude generated file from version control reviews
- Use type aliases for custom naming

---

### Why JSONB for Lexical Content?

**Decision**: Store rich text as Lexical JSON in JSONB field.

**Rationale**:
- **Structure**: Lexical provides consistent AST format
- **Queryability**: JSONB allows querying within content
- **Flexibility**: Supports custom nodes/features
- **Performance**: No additional table joins

**Trade-offs**:
- Full-text search requires indexing setup
- JSONB structure less portable than Markdown
- Can't easily migrate to different editor

**Mitigation**:
- Search plugin indexes content for full-text search
- Lexical widely adopted (Meta-backed project)
- Export/import utilities for migration

---

## Next Steps

- Review [Database Schema](./schema.md) for table structures
- See [Migrations](./migrations.md) for schema change workflow
- Review [API Examples](../api/examples.md) for querying data
