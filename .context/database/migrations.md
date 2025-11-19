# Database Migrations

## Migration Strategy

Payload uses **SQL migrations** for PostgreSQL schema changes in production. Local development can use auto-push mode for rapid iteration.

### Environment-Specific Behavior

| Environment | Mode | Behavior |
|-------------|------|----------|
| **Local Development** | `push: true` | Auto-applies schema changes without migrations |
| **Production** | `push: false` | Requires explicit migrations |

---

## Local Development Workflow

### Auto-Push Mode

**Configuration** (`src/payload.config.ts`):

```typescript
export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: process.env.NODE_ENV === 'development',  // Auto-push in dev
  }),
})
```

**How It Works**:
1. Modify collection config (add/change fields)
2. Restart dev server (`pnpm dev`)
3. Payload compares config to database schema
4. Schema changes applied automatically
5. Continue development immediately

**Advantages**:
- **Fast Iteration**: No manual migration steps
- **Immediate Feedback**: See schema changes instantly
- **No Files to Manage**: No migration files cluttering repo

**Limitations**:
- **No History**: Can't track schema evolution
- **No Rollback**: Can't undo changes easily
- **Data Loss Risk**: Dropping columns loses data immediately

---

## Production Migration Workflow

### Step 1: Disable Auto-Push

```typescript
// src/payload.config.ts (production)
export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: false,  // Disable auto-push in production
  }),
})
```

---

### Step 2: Create Migration

After making schema changes locally, create a migration:

```bash
pnpm payload migrate:create
```

**Interactive Prompts**:
```
? Migration name: add_featured_field_to_posts
✓ Migration created: src/migrations/20250115_add_featured_field_to_posts.ts
```

**Generated Migration File**:

```typescript
// src/migrations/20250115_add_featured_field_to_posts.ts
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts" ADD COLUMN "featured" boolean DEFAULT false;
    CREATE INDEX "idx_posts_featured" ON "posts" ("featured");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "idx_posts_featured";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "featured";
  `)
}
```

**File Naming Convention**: `YYYYMMDD_HHMMSS_description.ts`

---

### Step 3: Review Migration

**Checklist**:
- [ ] `up()` applies changes correctly
- [ ] `down()` reverses changes (rollback)
- [ ] Indexes created for new columns
- [ ] Data migration handled (if needed)
- [ ] No destructive changes without backup

**Common Issues**:
- Missing indexes on foreign keys
- Dropping columns with data (use `COPY` first)
- Not handling NULL values correctly

---

### Step 4: Test Migration Locally

```bash
# Apply migration
pnpm payload migrate

# Output:
# ✓ Executed migration: 20250115_add_featured_field_to_posts
```

**Verify**:
```bash
# Check database
psql $DATABASE_URI -c "SELECT * FROM payload_migrations ORDER BY created_at DESC LIMIT 5;"
```

---

### Step 5: Rollback (If Needed)

```bash
pnpm payload migrate:down
```

**Confirmation Prompt**:
```
? Are you sure you want to rollback the last migration? Yes
✓ Rolled back migration: 20250115_add_featured_field_to_posts
```

**Effect**: Executes `down()` function, reverses changes.

---

### Step 6: Deploy to Production

1. **Commit Migration Files**:
   ```bash
   git add src/migrations/
   git commit -m "Add featured field to posts"
   git push
   ```

2. **Deploy Application**:
   ```bash
   # Build
   pnpm build

   # Run migrations BEFORE starting server
   pnpm payload migrate

   # Start server
   pnpm start
   ```

3. **Verify Migration**:
   ```bash
   # Check applied migrations
   pnpm payload migrate:status
   ```

---

## Migration Commands

### Create Migration

```bash
pnpm payload migrate:create
```

**Alias**: `pnpm payload migrate:create --name add_field`

---

### Apply Pending Migrations

```bash
pnpm payload migrate
```

**Output**:
```
Payload Migrations
------------------
✓ No pending migrations

Applied Migrations:
- 20250101_init (batch 1)
- 20250115_add_featured_field (batch 2)
```

---

### Check Migration Status

```bash
pnpm payload migrate:status
```

**Output**:
```
Migration Status:
-----------------
Applied:
  ✓ 20250101_init
  ✓ 20250115_add_featured_field

Pending:
  - 20250120_add_tags_collection

Total: 2 applied, 1 pending
```

---

### Rollback Last Migration

```bash
pnpm payload migrate:down
```

**Options**:
- `--all` - Rollback all migrations (dangerous!)
- `--batch N` - Rollback specific batch

---

### Fresh Migration (Development Only)

```bash
pnpm payload migrate:fresh
```

**Warning**: Drops all tables and re-runs all migrations. **DATA LOSS**.

---

## Migration Patterns

### Adding a Field

```typescript
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "pages"
    ADD COLUMN "featured" boolean DEFAULT false NOT NULL;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "pages"
    DROP COLUMN IF EXISTS "featured";
  `)
}
```

---

### Changing a Field Type

```typescript
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ALTER COLUMN "reading_time" TYPE integer
    USING reading_time::integer;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ALTER COLUMN "reading_time" TYPE varchar(50)
    USING reading_time::varchar;
  `)
}
```

---

### Renaming a Field

```typescript
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "media"
    RENAME COLUMN "alt_text" TO "alt";
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "media"
    RENAME COLUMN "alt" TO "alt_text";
  `)
}
```

---

### Adding an Index

```typescript
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    CREATE INDEX "idx_posts_published_at"
    ON "posts" ("published_at" DESC)
    WHERE "_status" = 'published';
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "idx_posts_published_at";
  `)
}
```

---

### Data Migration

```typescript
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Add new column
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ADD COLUMN "slug_lowercase" varchar(255);
  `)

  // Migrate data
  await payload.db.drizzle.execute(sql`
    UPDATE "posts"
    SET "slug_lowercase" = LOWER("slug");
  `)

  // Add constraints
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ALTER COLUMN "slug_lowercase" SET NOT NULL;

    CREATE UNIQUE INDEX "idx_posts_slug_lowercase"
    ON "posts" ("slug_lowercase");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "idx_posts_slug_lowercase";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "slug_lowercase";
  `)
}
```

---

### Adding a Relationship

```typescript
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Add foreign key column
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ADD COLUMN "author_id" integer;
  `)

  // Add foreign key constraint
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ADD CONSTRAINT "fk_posts_author"
    FOREIGN KEY ("author_id")
    REFERENCES "users"("id")
    ON DELETE SET NULL;
  `)

  // Add index for performance
  await payload.db.drizzle.execute(sql`
    CREATE INDEX "idx_posts_author_id"
    ON "posts" ("author_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    DROP CONSTRAINT IF EXISTS "fk_posts_author";

    DROP INDEX IF EXISTS "idx_posts_author_id";

    ALTER TABLE "posts"
    DROP COLUMN IF EXISTS "author_id";
  `)
}
```

---

## Migration Table Schema

### `payload_migrations` Table

```sql
CREATE TABLE payload_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  batch INTEGER NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Example Data**:
```sql
SELECT * FROM payload_migrations;
```

| id | name | batch | updated_at | created_at |
|----|------|-------|------------|------------|
| 1 | 20250101_init | 1 | 2025-01-01 10:00:00 | 2025-01-01 10:00:00 |
| 2 | 20250115_add_featured | 2 | 2025-01-15 14:00:00 | 2025-01-15 14:00:00 |
| 3 | 20250120_add_tags | 2 | 2025-01-20 09:00:00 | 2025-01-20 09:00:00 |

**Batch Number**: Increments each time `migrate` command runs. Used for rolling back multiple migrations.

---

## Handling Data Loss

### Safe Column Removal

**Don't**:
```typescript
// ❌ BAD: Immediate data loss
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts" DROP COLUMN "old_field";
  `)
}
```

**Do**:
```typescript
// ✅ GOOD: Two-step migration

// Migration 1: Mark as deprecated, stop using in code
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ADD COLUMN "new_field" text;
  `)

  // Copy data
  await payload.db.drizzle.execute(sql`
    UPDATE "posts"
    SET "new_field" = "old_field";
  `)
}

// Migration 2 (after deployment and verification): Remove old column
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    DROP COLUMN "old_field";
  `)
}
```

---

### Backup Before Migration

```bash
# Backup database before running migration
pg_dump $DATABASE_URI > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration
pnpm payload migrate

# If something goes wrong:
psql $DATABASE_URI < backup_20250115_140000.sql
```

---

## Zero-Downtime Migrations

### Additive Changes

**Safe Operations** (no downtime):
- Adding nullable columns
- Adding indexes (use `CONCURRENTLY`)
- Adding tables
- Creating new relationships

**Example**:
```typescript
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Add column (nullable initially)
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ADD COLUMN "featured" boolean;
  `)

  // Set default for existing rows
  await payload.db.drizzle.execute(sql`
    UPDATE "posts"
    SET "featured" = false
    WHERE "featured" IS NULL;
  `)

  // Make NOT NULL after data migration
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "posts"
    ALTER COLUMN "featured" SET NOT NULL;
  `)

  // Create index concurrently (doesn't lock table)
  await payload.db.drizzle.execute(sql`
    CREATE INDEX CONCURRENTLY "idx_posts_featured"
    ON "posts" ("featured");
  `)
}
```

---

### Breaking Changes

**Dangerous Operations** (potential downtime):
- Renaming columns (requires code changes)
- Changing column types
- Removing columns
- Adding NOT NULL constraints

**Strategy**: Deploy in phases.

**Phase 1**: Make additive changes
```typescript
// Add new column, keep old column
ALTER TABLE "posts" ADD COLUMN "slug_new" varchar(255);
UPDATE "posts" SET "slug_new" = "slug";
```

**Phase 2**: Update application code to use new column

**Phase 3**: Remove old column
```typescript
ALTER TABLE "posts" DROP COLUMN "slug";
ALTER TABLE "posts" RENAME COLUMN "slug_new" TO "slug";
```

---

## CI/CD Integration

### Automated Migration in Pipeline

**Example GitHub Actions Workflow**:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        run: pnpm build

      - name: Run database migrations
        env:
          DATABASE_URI: ${{ secrets.DATABASE_URI }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
        run: pnpm payload migrate

      - name: Deploy to production
        run: |
          # Deploy built application
          # (depends on hosting provider)
```

**Important**: Migrations run **before** deployment to ensure schema matches code.

---

## Troubleshooting

### Migration Failed Mid-Execution

**Symptom**: Migration partially applied, database in inconsistent state.

**Solution**:
1. Check `payload_migrations` table - is migration recorded?
2. If recorded, manually rollback:
   ```bash
   pnpm payload migrate:down
   ```
3. If not recorded, manually revert changes via SQL
4. Fix migration code
5. Re-run migration

---

### Migration Already Applied

**Symptom**: `Migration already exists` error.

**Cause**: Migration file exists but not recorded in `payload_migrations`.

**Solution**:
```sql
-- Manually record migration
INSERT INTO payload_migrations (name, batch)
VALUES ('20250115_add_featured_field', 2);
```

---

### Conflicting Migrations

**Symptom**: Multiple developers created migrations with same name/timestamp.

**Solution**:
1. Merge conflicts in migration files
2. Rename one migration to later timestamp
3. Coordinate with team on migration order

---

## Decision History & Trade-offs

### Why SQL Migrations Over ORM Migrations?

**Decision**: Use raw SQL in migrations instead of Payload ORM operations.

**Rationale**:
- **Explicit Control**: See exact SQL being executed
- **Performance**: No ORM overhead
- **Debugging**: Easier to troubleshoot failures
- **Portability**: Can run migrations outside Payload

**Trade-offs**:
- More verbose than ORM methods
- Requires PostgreSQL knowledge
- Harder to make database-agnostic

**Mitigation**:
- Provide migration templates/examples
- Document common patterns
- Payload only supports PostgreSQL in this project (no multi-DB support needed)

---

### Why Batch Rollback Instead of Individual?

**Decision**: Track migrations in batches, rollback entire batch at once.

**Rationale**:
- **Atomic Deployments**: All changes in deployment rolled back together
- **Consistency**: Prevents partial rollbacks
- **Simplicity**: One command to rollback deployment

**Trade-offs**:
- Can't rollback individual migrations in batch
- More destructive if batch has many migrations

**Mitigation**:
- Keep deployments small (1-3 migrations per batch)
- Test migrations thoroughly before production
- Use `--down` flag for fine-grained rollback if needed

---

## Next Steps

- Review [Database Schema](./schema.md) for table structures
- See [Database Models](./models.md) for TypeScript types
- Review [Guidelines](../guidelines.md) for deployment workflow
