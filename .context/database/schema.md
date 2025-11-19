# Database Schema

## Database Technology

**PostgreSQL** via `@payloadcms/db-postgres` adapter

- **ORM**: Payload's collection-based ORM (wraps Drizzle ORM)
- **Migrations**: SQL migrations generated from Payload schema
- **Type Safety**: Full TypeScript support via generated types

---

## Entity Relationship Diagram

```mermaid
erDiagram
    PAGES ||--o{ PAGES_VERSIONS : has
    PAGES ||--o{ PAGES_RELS : has
    PAGES {
        int id PK
        varchar title
        varchar slug UK
        enum _status
        jsonb layout
        jsonb meta
        timestamp published_at
        timestamp updated_at
        timestamp created_at
    }

    POSTS ||--o{ POSTS_VERSIONS : has
    POSTS ||--o{ POSTS_RELS : has
    POSTS {
        int id PK
        varchar title
        varchar slug UK
        enum _status
        jsonb layout
        jsonb meta
        timestamp published_at
        timestamp updated_at
        timestamp created_at
    }

    MEDIA {
        int id PK
        varchar alt
        varchar filename
        varchar mime_type
        int filesize
        int width
        int height
        int focal_x
        int focal_y
        jsonb sizes
        varchar url
        timestamp updated_at
        timestamp created_at
    }

    CATEGORIES ||--o{ CATEGORIES : parent
    CATEGORIES {
        int id PK
        varchar title
        varchar slug
        int parent_id FK
        jsonb breadcrumbs
        timestamp updated_at
        timestamp created_at
    }

    USERS {
        int id PK
        varchar email UK
        varchar name
        varchar password
        int login_attempts
        timestamp lock_until
        timestamp updated_at
        timestamp created_at
    }

    PAGES_RELS }o--|| MEDIA : references
    POSTS_RELS }o--|| MEDIA : references
    POSTS_RELS }o--|| CATEGORIES : references
    POSTS_RELS }o--|| USERS : references
    POSTS_RELS }o--|| POSTS : references

    HEADER {
        int id PK
        jsonb nav_items
        timestamp updated_at
        timestamp created_at
    }

    FOOTER {
        int id PK
        jsonb nav_items
        timestamp updated_at
        timestamp created_at
    }

    FORMS {
        int id PK
        varchar title
        jsonb fields
        jsonb emails
        jsonb confirmation_message
        enum redirect_type
        varchar redirect_url
        timestamp updated_at
        timestamp created_at
    }

    FORM_SUBMISSIONS {
        int id PK
        int form_id FK
        jsonb submission_data
        timestamp updated_at
        timestamp created_at
    }

    FORMS ||--o{ FORM_SUBMISSIONS : has

    PAYLOAD_PREFERENCES {
        int id PK
        varchar key UK
        int user_id FK
        jsonb value
        timestamp updated_at
        timestamp created_at
    }

    PAYLOAD_MIGRATIONS {
        int id PK
        varchar name UK
        int batch
        timestamp updated_at
        timestamp created_at
    }
```

---

## Collections

### Pages Collection

**Table**: `pages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `title` | VARCHAR(255) | NOT NULL | Page title |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| `_status` | ENUM('draft', 'published') | DEFAULT 'draft' | Publication status |
| `layout` | JSONB | | Layout builder blocks |
| `meta` | JSONB | | SEO metadata (title, description, image) |
| `published_at` | TIMESTAMP | | Publication timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Related Tables**:
- `pages_versions` - Version history for drafts/revisions
- `pages_rels` - Relationships to other collections (media, etc.)

**Indexes**:
```sql
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(_status);
CREATE INDEX idx_pages_published_at ON pages(published_at);
```

---

### Posts Collection

**Table**: `posts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `title` | VARCHAR(255) | NOT NULL | Post title |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| `_status` | ENUM('draft', 'published') | DEFAULT 'draft' | Publication status |
| `layout` | JSONB | | Layout builder blocks |
| `meta` | JSONB | | SEO metadata |
| `published_at` | TIMESTAMP | | Publication timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Relationships** (via `posts_rels` table):
- `author` → `users` (many-to-one)
- `categories` → `categories` (many-to-many)
- `hero` → `media` (many-to-one)
| `related_posts` → `posts` (many-to-many)

**Indexes**:
```sql
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(_status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
```

---

### Media Collection

**Table**: `media`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `alt` | VARCHAR(255) | | Alternative text for accessibility |
| `filename` | VARCHAR(255) | NOT NULL | File name on disk |
| `mime_type` | VARCHAR(100) | NOT NULL | MIME type (e.g., image/jpeg) |
| `filesize` | INTEGER | NOT NULL | File size in bytes |
| `width` | INTEGER | | Image width in pixels |
| `height` | INTEGER | | Image height in pixels |
| `focal_x` | INTEGER | DEFAULT 50 | Focal point X coordinate (%) |
| `focal_y` | INTEGER | DEFAULT 50 | Focal point Y coordinate (%) |
| `sizes` | JSONB | | Generated image sizes |
| `url` | VARCHAR(500) | | Public URL to file |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Image Sizes** (stored in `sizes` JSONB):
- `thumbnail` - 400x300
- `card` - 768x1024
- `tablet` - 1024xAUTO

**Indexes**:
```sql
CREATE INDEX idx_media_filename ON media(filename);
CREATE INDEX idx_media_mime_type ON media(mime_type);
```

---

### Categories Collection

**Table**: `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `title` | VARCHAR(255) | NOT NULL | Category name |
| `slug` | VARCHAR(255) | NOT NULL | URL-friendly slug |
| `parent_id` | INTEGER | FOREIGN KEY | Parent category (for nesting) |
| `breadcrumbs` | JSONB | | Hierarchical path |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Self-Referencing Relationship**:
```sql
ALTER TABLE categories
ADD CONSTRAINT fk_categories_parent
FOREIGN KEY (parent_id) REFERENCES categories(id)
ON DELETE SET NULL;
```

**Indexes**:
```sql
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

---

### Users Collection (Auth-Enabled)

**Table**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (login) |
| `name` | VARCHAR(255) | | User's display name |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `login_attempts` | INTEGER | DEFAULT 0 | Failed login counter |
| `lock_until` | TIMESTAMP | | Account lock expiration |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Security**:
- Password stored as bcrypt hash (never plaintext)
- Login attempts tracked for brute-force protection
- Account locked after 5 failed attempts for 10 minutes

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

---

## Relationship Tables

### Pages Relationships (`pages_rels`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `parent_id` | INTEGER | Pages document ID |
| `path` | VARCHAR(255) | Relationship field path |
| `order` | INTEGER | Order in array relationships |
| `media_id` | INTEGER | Foreign key to media |

**Purpose**: Stores relationships between pages and media (hero images, SEO images, etc.)

---

### Posts Relationships (`posts_rels`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `parent_id` | INTEGER | Posts document ID |
| `path` | VARCHAR(255) | Relationship field path (author, categories, etc.) |
| `order` | INTEGER | Order in array relationships |
| `categories_id` | INTEGER | Foreign key to categories |
| `users_id` | INTEGER | Foreign key to users (author) |
| `media_id` | INTEGER | Foreign key to media |
| `posts_id` | INTEGER | Foreign key to posts (related posts) |

**Purpose**: Stores all relationships for posts collection.

---

## Versioning Tables

### Pages Versions (`pages_versions`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Version ID |
| `parent_id` | INTEGER | Original document ID |
| `version` | JSONB | Full document snapshot |
| `autosave` | BOOLEAN | Is this an autosave? |
| `updated_at` | TIMESTAMP | Version creation time |
| `created_at` | TIMESTAMP | Version creation time |
| `published_locale` | VARCHAR(10) | Locale for this version |
| `latest` | BOOLEAN | Is this the latest version? |

**Purpose**: Stores draft versions and revision history.

**Version Limit**: Maximum 50 versions per document (configurable).

---

## Global Data

### Header Global (`header`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Always 1 (singleton) |
| `nav_items` | JSONB | Navigation items array |
| `updated_at` | TIMESTAMP | Last update |
| `created_at` | TIMESTAMP | Creation time |

**Nav Items Structure** (JSONB):
```json
[
  {
    "id": "abc123",
    "link": {
      "type": "reference",
      "label": "About",
      "reference": {
        "relationTo": "pages",
        "value": 123
      }
    }
  }
]
```

---

### Footer Global (`footer`)

Similar structure to Header.

---

## Plugin Collections

### Forms Collection (`forms`)

**Table**: `forms`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `title` | VARCHAR(255) | Form name |
| `fields` | JSONB | Form field definitions |
| `emails` | JSONB | Email notification settings |
| `confirmation_message` | JSONB | Success message (Lexical JSON) |
| `redirect_type` | ENUM('none', 'url', 'reference') | Post-submission action |
| `redirect_url` | VARCHAR(500) | Custom redirect URL |
| `updated_at` | TIMESTAMP | Last update |
| `created_at` | TIMESTAMP | Creation time |

---

### Form Submissions (`form_submissions`)

**Table**: `form_submissions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `form_id` | INTEGER | Foreign key to forms |
| `submission_data` | JSONB | User-submitted data |
| `updated_at` | TIMESTAMP | Submission time |
| `created_at` | TIMESTAMP | Submission time |

**Relationship**:
```sql
ALTER TABLE form_submissions
ADD CONSTRAINT fk_form_submissions_form
FOREIGN KEY (form_id) REFERENCES forms(id)
ON DELETE CASCADE;
```

---

## System Tables

### Payload Preferences (`payload_preferences`)

**Purpose**: Stores user preferences for admin UI.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `key` | VARCHAR(255) | Preference key (unique) |
| `user_id` | INTEGER | Foreign key to users |
| `value` | JSONB | Preference value |
| `updated_at` | TIMESTAMP | Last update |
| `created_at` | TIMESTAMP | Creation time |

---

### Payload Migrations (`payload_migrations`)

**Purpose**: Tracks applied database migrations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `name` | VARCHAR(255) | Migration file name (unique) |
| `batch` | INTEGER | Batch number |
| `updated_at` | TIMESTAMP | Application time |
| `created_at` | TIMESTAMP | Application time |

**Example Data**:
```sql
SELECT * FROM payload_migrations;
```

| id | name | batch | updated_at |
|----|------|-------|------------|
| 1 | 20250101_init | 1 | 2025-01-01 10:00:00 |
| 2 | 20250115_add_pages | 1 | 2025-01-15 14:30:00 |

---

## JSONB Field Schemas

### Layout Block Structure

**Example** (Content Block):

```json
{
  "blockType": "content",
  "id": "507f1f77bcf86cd799439013",
  "content": {
    "root": {
      "type": "root",
      "format": "",
      "indent": 0,
      "version": 1,
      "children": [
        {
          "type": "paragraph",
          "format": "",
          "indent": 0,
          "version": 1,
          "children": [
            {
              "type": "text",
              "format": 0,
              "text": "This is content."
            }
          ]
        }
      ],
      "direction": "ltr"
    }
  }
}
```

**Block Types**:
- `content` - Rich text content
- `cta` - Call to action
- `mediaBlock` - Image/video
- `archive` - Post archive
- `formBlock` - Embedded form

---

### SEO Meta Structure

```json
{
  "title": "Page Title | Site Name",
  "description": "Page description for search engines",
  "image": 123,  // Relationship to media collection
  "preview": {
    "url": "https://example.com/page",
    "title": "Preview Title",
    "description": "Preview Description"
  }
}
```

---

### Media Sizes Structure

```json
{
  "thumbnail": {
    "url": "/media/image-1234-400x300.jpg",
    "width": 400,
    "height": 300,
    "mimeType": "image/jpeg",
    "filesize": 15234,
    "filename": "image-1234-400x300.jpg"
  },
  "card": {
    "url": "/media/image-1234-768x1024.jpg",
    "width": 768,
    "height": 1024,
    "mimeType": "image/jpeg",
    "filesize": 89456,
    "filename": "image-1234-768x1024.jpg"
  }
}
```

---

## Database Configuration

### Connection String

```bash
# .env
DATABASE_URI=postgresql://user:password@localhost:5432/payload_db?sslmode=require
```

**SSL Modes**:
- `disable` - No SSL (local development only)
- `require` - SSL required but no certificate validation
- `verify-ca` - SSL with CA certificate validation
- `verify-full` - SSL with full certificate validation

---

### Payload Config

```typescript
// src/payload.config.ts
export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Development: auto-push schema changes
    push: process.env.NODE_ENV === 'development',

    // Production: use migrations
    // push: false,
  }),
})
```

---

## Performance Considerations

### Recommended Indexes

**Already Created by Payload**:
- Primary keys (all collections)
- Unique constraints (email, slug fields)
- Foreign keys (relationships)

**Custom Indexes** (add via migration):

```sql
-- Full-text search on post titles/content
CREATE INDEX idx_posts_title_search ON posts
USING GIN (to_tsvector('english', title));

-- Composite index for common queries
CREATE INDEX idx_posts_status_published ON posts(_status, published_at DESC)
WHERE _status = 'published';

-- JSONB index for layout blocks
CREATE INDEX idx_pages_layout ON pages USING GIN (layout);
```

---

### Query Optimization

**Use `depth` parameter wisely**:
```typescript
// ❌ BAD: Over-fetching (deep population)
const page = await payload.find({
  collection: 'pages',
  depth: 5,  // Populates 5 levels of relationships
})

// ✅ GOOD: Fetch only what you need
const page = await payload.find({
  collection: 'pages',
  depth: 1,  // Populate only first-level relationships
})
```

---

## Decision History & Trade-offs

### Why PostgreSQL Over MongoDB?

**Decision**: Use PostgreSQL instead of MongoDB (both supported by Payload).

**Rationale**:
- **ACID Compliance**: Critical for versioning and draft workflow
- **Schema Enforcement**: Catches bugs early with type checking
- **Relational Integrity**: Foreign keys ensure data consistency
- **Ecosystem**: Better tooling for backups, monitoring, migrations

**Trade-offs**:
- Requires explicit migrations in production
- Less flexible for schema changes
- Slightly more complex setup

**Mitigation**:
- Local development uses `push: true` (auto-migration)
- Migration workflow documented and automated
- Payload ORM abstracts most SQL complexity

---

### Why JSONB for Layout Blocks?

**Decision**: Store layout blocks as JSONB instead of separate tables.

**Rationale**:
- **Flexibility**: Blocks can have varying structures
- **Performance**: Single query fetches entire page/post
- **Simplicity**: No complex joins for nested block data
- **PostgreSQL JSONB**: Efficient indexing and querying

**Trade-offs**:
- Can't easily query across block types
- JSONB data isn't as portable as normalized tables
- Harder to enforce schema on block content

**Mitigation**:
- Payload validates block structure before saving
- JSONB indexes allow efficient querying when needed
- Search plugin indexes content for full-text search

---

## Next Steps

- Review [Database Models](./models.md) for TypeScript type definitions
- See [Migrations](./migrations.md) for migration workflow
- Review [API Endpoints](../api/endpoints.md) for querying the database
