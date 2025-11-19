# Development Guidelines

## Development Workflow

### Local Environment Setup

**Prerequisites**:
- Node.js ≥20.9.0
- pnpm ^9 || ^10
- PostgreSQL database

**Initial Setup**:

```bash
# 1. Clone repository
git clone <repository-url>
cd payload-hce-website

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env

# Edit .env with your values:
# DATABASE_URI=postgresql://user:password@localhost:5432/payload_db
# PAYLOAD_SECRET=<random-256-bit-string>
# NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# 4. Start development server
pnpm dev

# 5. Create admin user
# Navigate to http://localhost:3000/admin
# Follow the on-screen setup wizard
```

**Generate Secure Secrets**:
```bash
# PAYLOAD_SECRET (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PREVIEW_SECRET
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# CRON_SECRET
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

### Development Commands

**Core Development**:
```bash
pnpm dev               # Start dev server (http://localhost:3000)
pnpm build             # Build for production
pnpm start             # Start production server
pnpm dev:prod          # Build and start in production mode
```

**Code Quality**:
```bash
pnpm lint              # Run ESLint
pnpm lint:fix          # Auto-fix ESLint errors
```

**Testing**:
```bash
pnpm test              # Run all tests (integration + e2e)
pnpm test:int          # Run integration tests (Vitest)
pnpm test:e2e          # Run E2E tests (Playwright)
```

**Payload**:
```bash
pnpm generate:types    # Generate TypeScript types from schema
pnpm generate:importmap # Generate import map for admin components
pnpm payload migrate:create # Create new migration
pnpm payload migrate   # Run pending migrations
```

---

### Git Workflow

**Branch Strategy**:
- `main` - Production-ready code
- `develop` - Development branch (optional)
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

**Feature Development**:

```bash
# 1. Create feature branch
git checkout -b feature/add-projects-collection

# 2. Make changes
# ... edit files ...

# 3. Regenerate types if schema changed
pnpm generate:types

# 4. Test changes
pnpm lint
pnpm test

# 5. Commit changes
git add .
git commit -m "feat: add projects collection with layout builder"

# 6. Push to remote
git push origin feature/add-projects-collection

# 7. Create pull request on GitHub
```

**Commit Message Convention**:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semi colons, etc.
refactor: code restructuring
test: adding tests
chore: updating build tasks, package manager configs, etc.
```

**Example Commits**:
```bash
git commit -m "feat: add Projects collection with draft/publish workflow"
git commit -m "fix: revalidation not triggering for nested categories"
git commit -m "docs: update CLAUDE.md with testing commands"
git commit -m "refactor: extract common access control to utilities"
git commit -m "test: add E2E tests for post creation flow"
```

---

## Code Standards

### TypeScript Best Practices

**Always Use Generated Types**:

```typescript
// ✅ GOOD: Import from generated types
import type { Page, Post, Media } from '@/payload-types'

export async function getPage(slug: string): Promise<Page | null> {
  // ...
}

// ❌ BAD: Define types manually
interface Page {
  title: string
  slug: string
  // ... (will get out of sync with schema)
}
```

---

**Strict Null Checks**:

```typescript
// ✅ GOOD: Handle null/undefined
if (page?.meta?.image && typeof page.meta.image === 'object') {
  console.log(page.meta.image.url)
}

// ❌ BAD: Assume values exist
console.log(page.meta.image.url)  // Type error + runtime error
```

---

**Async/Await Over Promises**:

```typescript
// ✅ GOOD: Async/await for readability
export async function getPublishedPosts() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({ collection: 'posts' })
    return posts.docs
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return []
  }
}

// ❌ BAD: Promise chaining
export function getPublishedPosts() {
  return getPayload({ config: configPromise })
    .then((payload) => payload.find({ collection: 'posts' }))
    .then((posts) => posts.docs)
    .catch((error) => {
      console.error('Failed to fetch posts:', error)
      return []
    })
}
```

---

### React Component Guidelines

**Server Components by Default**:

```typescript
// ✅ GOOD: Server Component (no 'use client')
import { getCachedDocument } from '@/utilities/getDocument'

export default async function PageTemplate({ slug }: { slug: string }) {
  const page = await getCachedDocument('pages', slug)()

  return <article>{page.title}</article>
}

// ❌ BAD: Client Component unnecessarily
'use client'

import { useEffect, useState } from 'react'

export default function PageTemplate({ slug }: { slug: string }) {
  const [page, setPage] = useState(null)

  useEffect(() => {
    fetch(`/api/pages?where[slug][equals]=${slug}`)
      .then((res) => res.json())
      .then((data) => setPage(data.docs[0]))
  }, [slug])

  if (!page) return <div>Loading...</div>

  return <article>{page.title}</article>
}
```

**Client Components When Needed**:

```typescript
// ✅ GOOD: Client Component for interactivity
'use client'

import { useState } from 'react'

export default function SearchForm() {
  const [query, setQuery] = useState('')

  return (
    <form>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </form>
  )
}
```

---

### Payload Collection Guidelines

**Consistent Structure**:

```typescript
// src/collections/Projects/index.ts
import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { revalidateProject } from './hooks/revalidateProject'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    // ... other fields
  ],
  hooks: {
    afterChange: [revalidateProject],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Location**: `tests/int/**/*.int.spec.ts`

**Example**:

```typescript
// tests/int/utilities/formatDateTime.int.spec.ts
import { describe, it, expect } from 'vitest'
import { formatDateTime } from '@/utilities/formatDateTime'

describe('formatDateTime', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15T10:30:00Z')
    expect(formatDateTime(date)).toBe('January 15, 2025')
  })

  it('handles null values', () => {
    expect(formatDateTime(null)).toBe('')
  })

  it('handles invalid dates', () => {
    expect(formatDateTime('invalid')).toBe('')
  })
})
```

**Run Tests**:
```bash
pnpm test:int
```

---

### Integration Tests (Payload API)

**Example**:

```typescript
// tests/int/collections/pages.int.spec.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

describe('Pages Collection', () => {
  let payload

  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })
  })

  it('creates a page successfully', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Test Page',
        slug: 'test-page',
        layout: [],
        _status: 'draft',
      },
    })

    expect(page.id).toBeDefined()
    expect(page.title).toBe('Test Page')
    expect(page.slug).toBe('test-page')
  })

  it('enforces unique slug constraint', async () => {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'First Page',
        slug: 'duplicate-slug',
        layout: [],
      },
    })

    await expect(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Second Page',
          slug: 'duplicate-slug',
          layout: [],
        },
      })
    ).rejects.toThrow()
  })
})
```

---

### E2E Tests (Playwright)

**Location**: `tests/e2e/**/*.spec.ts`

**Example**:

```typescript
// tests/e2e/admin-login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/admin/login')

    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/admin')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')

    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'wrong-password')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=incorrect')).toBeVisible()
  })
})
```

**Run Tests**:
```bash
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e --ui         # Run with Playwright UI
pnpm test:e2e --debug      # Run in debug mode
```

---

### Test Database Setup

**Option 1: Separate Test Database**

```bash
# .env.test
DATABASE_URI=postgresql://user:password@localhost:5432/payload_test
```

**Option 2: Docker Test Database**

```bash
# Start test database
docker run -d \
  --name payload-test-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=payload_test \
  -p 5433:5432 \
  postgres:16

# Run tests with test database
DATABASE_URI=postgresql://postgres:password@localhost:5433/payload_test pnpm test
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Types generated (`pnpm generate:types`)
- [ ] Environment variables configured
- [ ] Database migrations created (if schema changed)
- [ ] Build succeeds (`pnpm build`)

---

### Production Build

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Generate types
pnpm generate:types
pnpm generate:importmap

# 3. Build application
pnpm build

# 4. Run database migrations (IMPORTANT: Run before starting server)
pnpm payload migrate

# 5. Start production server
pnpm start
```

---

### Environment Variables (Production)

**Required**:
```bash
DATABASE_URI=postgresql://user:password@host:5432/db?sslmode=require
PAYLOAD_SECRET=<256-bit-random-string>
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
CRON_SECRET=<random-string>
PREVIEW_SECRET=<random-string>
NODE_ENV=production
```

**Optional**:
```bash
PORT=3000
```

---

### Deployment Platforms

#### Vercel Deployment

**Requirements**:
- Vercel account
- Vercel Postgres database

**Setup**:

```bash
# 1. Install Vercel CLI
pnpm add -g vercel

# 2. Link project
vercel link

# 3. Configure environment variables
vercel env add DATABASE_URI production
vercel env add PAYLOAD_SECRET production
vercel env add NEXT_PUBLIC_SERVER_URL production

# 4. Deploy
vercel --prod
```

**Build Command**: `pnpm build`
**Output Directory**: `.next`
**Install Command**: `pnpm install`

---

#### Self-Hosted (VPS/Docker)

**Dockerfile** (already in project):

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
```

**Build and Run**:

```bash
# Build Docker image
docker build -t payload-hce-website .

# Run container
docker run -d \
  --name payload-app \
  -p 3000:3000 \
  -e DATABASE_URI=postgresql://... \
  -e PAYLOAD_SECRET=... \
  -e NEXT_PUBLIC_SERVER_URL=https://... \
  payload-hce-website
```

**Docker Compose** (already in project):

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Database Backup

**Automated Backups** (Recommended):

```bash
# Cron job for daily backups
0 2 * * * pg_dump $DATABASE_URI | gzip > /backups/payload_$(date +\%Y\%m\%d).sql.gz
```

**Manual Backup**:

```bash
# Export database
pg_dump $DATABASE_URI > backup.sql

# Restore database
psql $DATABASE_URI < backup.sql
```

**Backup Before Deployment**:

```bash
# Always backup before running migrations
pg_dump $DATABASE_URI > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
pnpm payload migrate

# If migration fails, restore:
# psql $DATABASE_URI < backup_pre_deploy_20250115_140000.sql
```

---

## Performance Optimization

### Next.js Caching

**Cache Strategy**: On-demand ISR (Incremental Static Regeneration)

**Implementation**:

```typescript
// src/utilities/getDocument.ts
import { unstable_cache } from 'next/cache'

export const getCachedDocument = (collection: Collection, slug: string) =>
  unstable_cache(
    async () => getDocument(collection, slug),
    [collection, slug],
    {
      tags: [`${collection}_${slug}`, `${collection}_all`],
    }
  )
```

**Revalidation**:

```typescript
// src/collections/Pages/hooks/revalidatePage.ts
import { revalidateTag } from 'next/cache'

export const revalidatePage: CollectionAfterChangeHook = ({ doc }) => {
  if (doc._status === 'published') {
    revalidateTag(`pages_${doc.slug}`)
    revalidateTag('pages_all')
  }

  return doc
}
```

---

### Database Query Optimization

**Use Appropriate Depth**:

```typescript
// ✅ GOOD: Fetch only what you need
const posts = await payload.find({
  collection: 'posts',
  depth: 1,  // Only populate first level (author, hero)
  limit: 10,
})

// ❌ BAD: Over-fetching
const posts = await payload.find({
  collection: 'posts',
  depth: 5,  // Populates 5 levels (slow, unnecessary)
  limit: 10,
})
```

**Limit Results**:

```typescript
// Always set a reasonable limit
const posts = await payload.find({
  collection: 'posts',
  limit: 20,  // Don't fetch unlimited results
})
```

**Select Specific Fields**:

```typescript
// Fetch only needed fields
const posts = await payload.find({
  collection: 'posts',
  select: {
    title: true,
    slug: true,
    publishedAt: true,
  },
  depth: 0,
})
```

---

### Image Optimization

**Use Next.js Image Component**:

```typescript
import Image from 'next/image'
import type { Media } from '@/payload-types'

export function MediaImage({ media }: { media: Media }) {
  return (
    <Image
      src={media.url!}
      alt={media.alt || ''}
      width={media.width!}
      height={media.height!}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

**Responsive Images**:

```typescript
// Use generated sizes for responsive images
<picture>
  <source
    media="(max-width: 768px)"
    srcSet={media.sizes?.thumbnail?.url}
  />
  <source
    media="(max-width: 1024px)"
    srcSet={media.sizes?.card?.url}
  />
  <img src={media.url} alt={media.alt} />
</picture>
```

---

## Monitoring & Debugging

### Logging

**Server-Side Logging**:

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const payload = await getPayload({ config: configPromise })

// Use Payload logger
payload.logger.info('User logged in', { userId: user.id })
payload.logger.warn('High memory usage detected')
payload.logger.error('Database connection failed', error)
```

**Structured Logging** (Production):

```typescript
payload.logger.info({
  message: 'API request',
  method: 'GET',
  path: '/api/pages',
  duration: 45,
  userId: user?.id,
  timestamp: new Date().toISOString(),
})
```

---

### Error Tracking

**Recommended Tools**:
- Sentry (error monitoring)
- LogRocket (session replay)
- Datadog (APM)

**Example Sentry Integration**:

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

---

### Performance Monitoring

**Next.js Built-In Analytics**:

```typescript
// next.config.js
export default {
  experimental: {
    instrumentationHook: true,
  },
}
```

**Custom Performance Tracking**:

```typescript
export async function getPage(slug: string) {
  const start = Date.now()

  const page = await getCachedDocument('pages', slug)()

  const duration = Date.now() - start

  if (duration > 1000) {
    console.warn(`Slow query: ${slug} took ${duration}ms`)
  }

  return page
}
```

---

## Security Best Practices

### Secrets Management

**Never Commit Secrets**:

```bash
# .gitignore (already configured)
.env
.env.local
.env.production
.env.*.local
```

**Use Environment Variables**:

```typescript
// ✅ GOOD: Use environment variables
const secret = process.env.PAYLOAD_SECRET

// ❌ BAD: Hardcode secrets
const secret = 'my-secret-key-123'
```

---

### Input Validation

**Always Validate User Input**:

```typescript
import validator from 'validator'

{
  name: 'email',
  type: 'text',
  validate: (value) => {
    if (!validator.isEmail(value)) {
      return 'Invalid email address'
    }

    return true
  },
}
```

---

### Access Control

**Use Declarative Access Control**:

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: authenticatedOrPublished,  // Defined in src/access/
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
}
```

---

## Support & Resources

### Documentation

- **Payload CMS**: https://payloadcms.com/docs
- **Next.js**: https://nextjs.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/

### Community

- **Payload Discord**: https://discord.com/invite/payload
- **GitHub Discussions**: https://github.com/payloadcms/payload/discussions

### Internal Documentation

- **Architecture**: See [architecture/overview.md](./architecture/overview.md)
- **Authentication**: See [auth/overview.md](./auth/overview.md)
- **API Reference**: See [api/endpoints.md](./api/endpoints.md)
- **Database**: See [database/schema.md](./database/schema.md)

---

**Last Updated**: 2025-11-19
**Version**: 1.0.0
