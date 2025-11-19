# Substrate Documentation

## Project: Payload HCE Website

A production-ready content management system built with Payload CMS 3.64.0 and Next.js 15, providing a monolithic full-stack application with an admin panel, GraphQL/REST APIs, and a responsive frontend served from a single deployment.

### Tech Stack Overview

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19, TypeScript 5.7.3, Node.js ≥20.9.0
- **CMS**: Payload CMS 3.64.0 (headless CMS with admin UI)
- **Database**: PostgreSQL with `@payloadcms/db-postgres` adapter
- **Styling**: TailwindCSS 3.4 + shadcn/ui components
- **Rich Text**: Lexical editor with custom features
- **Testing**: Vitest (integration), Playwright (E2E)
- **Package Manager**: pnpm ^9 || ^10

### Architecture Pattern

**Monolithic Next.js App Router** with route group separation:
- CMS backend and public frontend unified in single application
- Route groups `(payload)` and `(frontend)` provide logical separation
- Server-side rendering with on-demand ISR revalidation
- PostgreSQL for structured relational data with versioning

---

## Documentation Structure

### 🏗️ [Architecture](./architecture/overview.md)
Understanding the system design, data flow, and component organization.

- **[Overview](./architecture/overview.md)** - System architecture, request flow diagrams, deployment model
- **[Dependencies](./architecture/dependencies.md)** - Payload Local API injection, Next.js integration patterns
- **[Patterns](./architecture/patterns.md)** - Code organization, error handling, revalidation strategies

### 🔐 [Authentication](./auth/overview.md)
JWT-based authentication with Payload's built-in auth system.

- **[Overview](./auth/overview.md)** - Authentication flow, session management, token lifecycle
- **[Integration](./auth/integration.md)** - Next.js middleware integration, access control patterns
- **[Security](./auth/security.md)** - Threat model, CSRF protection, secure cookie configuration

### 🌐 [API](./api/endpoints.md)
REST and GraphQL APIs for content management and frontend data fetching.

- **[Endpoints](./api/endpoints.md)** - Complete API reference for collections, globals, auth
- **[Headers](./api/headers.md)** - Authentication headers, CORS configuration, rate limiting
- **[Examples](./api/examples.md)** - Client implementations using Payload Local API and fetch

### 🗄️ [Database](./database/schema.md)
PostgreSQL schema design with Payload's collection-based ORM.

- **[Schema](./database/schema.md)** - Collection schemas, relationships, field types with ERD
- **[Models](./database/models.md)** - Type-safe models, validation rules, computed fields
- **[Migrations](./database/migrations.md)** - Migration workflow, version control, rollback strategies

### 📋 [Guidelines](./guidelines.md)
Development workflow, testing strategies, and deployment procedures.

---

## AI Usage Patterns

This substrate documentation is optimized for AI-assisted development. Follow these patterns when working with AI tools:

### For Feature Implementation

```
Context: I'm working on [feature name] in the Payload HCE Website project.
Review: substrate.md + architecture/patterns.md + [relevant domain docs]
Task: Implement [specific requirement] following existing patterns.
```

**Example:**
```
Context: Adding a new "Projects" collection with draft/publish workflow.
Review: substrate.md + database/models.md + architecture/patterns.md
Task: Create collection config with layout builder, SEO plugin, and revalidation hooks.
```

### For Debugging

```
Context: Investigating [issue description] in [component/feature].
Review: substrate.md + architecture/overview.md + [specific domain]
Task: Identify root cause and propose solution following security guidelines.
```

**Example:**
```
Context: Draft preview not showing updated content after save.
Review: substrate.md + architecture/patterns.md (revalidation section)
Task: Check cache tags, revalidation hooks, and preview route configuration.
```

### For Code Review

```
Context: Reviewing PR for [feature/fix name].
Review: substrate.md + guidelines.md + [affected domains]
Task: Validate against architectural patterns, security model, and testing requirements.
```

### For Onboarding

```
Context: New developer joining the project.
Review: substrate.md → architecture/overview.md → guidelines.md
Task: Understand system architecture, set up local environment, complete first task.
```

---

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Database Setup**
   ```bash
   # Local development uses push: true (auto-migration)
   pnpm dev
   ```

4. **Create Admin User**
   Navigate to `http://localhost:3000/admin` and follow the setup wizard.

5. **Generate Types**
   ```bash
   pnpm generate:types
   pnpm generate:importmap
   ```

---

## Critical Concepts

### Payload Local API Pattern
Server-side operations use Payload's Local API (not HTTP):
```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const payload = await getPayload({ config: configPromise })
const page = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } } })
```

### Access Control Architecture
Declarative access control at collection/field level:
```typescript
access: {
  read: authenticatedOrPublished,  // Public sees published, users see drafts
  create: authenticated,            // Only logged-in users
  update: authenticated,
  delete: authenticated,
}
```

### Cache Invalidation Strategy
Next.js revalidation triggered by Payload hooks:
```typescript
hooks: {
  afterChange: [revalidatePage],    // On publish, revalidate frontend route
  afterDelete: [revalidateDelete],  // Clear cache on deletion
}
```

### Type Safety
Generated types from Payload schema ensure type safety across stack:
```typescript
import type { Page, Post, User } from '@/payload-types'
```

---

## Support & Resources

- **Payload Documentation**: https://payloadcms.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Project CLAUDE.md**: Development commands and architecture overview
- **Internal Docs**: See domain-specific documentation above

---

**Last Updated**: 2025-11-19
**Payload Version**: 3.64.0
**Next.js Version**: 15.4.7
**Database**: PostgreSQL
