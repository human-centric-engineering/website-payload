import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Create junction tables for the new array structure
  await db.execute(sql`
   CREATE TABLE "projects_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );

  CREATE TABLE "_projects_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );

  ALTER TABLE "projects_links" ADD CONSTRAINT "projects_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_links" ADD CONSTRAINT "_projects_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_links_order_idx" ON "projects_links" USING btree ("_order");
  CREATE INDEX "projects_links_parent_id_idx" ON "projects_links" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_links_order_idx" ON "_projects_v_version_links" USING btree ("_order");
  CREATE INDEX "_projects_v_version_links_parent_id_idx" ON "_projects_v_version_links" USING btree ("_parent_id");`)

  // Step 2: Migrate existing data from old columns to new array tables
  await db.execute(sql`
    -- Migrate website links from main projects table
    INSERT INTO "projects_links" (_order, _parent_id, id, label, url)
    SELECT 0, id, gen_random_uuid()::varchar, 'Visit Website', "links_website"
    FROM "projects"
    WHERE "links_website" IS NOT NULL AND "links_website" != '';

    -- Migrate case study links
    INSERT INTO "projects_links" (_order, _parent_id, id, label, url)
    SELECT
      CASE WHEN "links_website" IS NOT NULL AND "links_website" != '' THEN 1 ELSE 0 END,
      id,
      gen_random_uuid()::varchar,
      'Read Case Study',
      "links_case_study"
    FROM "projects"
    WHERE "links_case_study" IS NOT NULL AND "links_case_study" != '';

    -- Migrate repository links
    INSERT INTO "projects_links" (_order, _parent_id, id, label, url)
    SELECT
      (CASE WHEN "links_website" IS NOT NULL AND "links_website" != '' THEN 1 ELSE 0 END +
       CASE WHEN "links_case_study" IS NOT NULL AND "links_case_study" != '' THEN 1 ELSE 0 END),
      id,
      gen_random_uuid()::varchar,
      'View Repository',
      "links_repository"
    FROM "projects"
    WHERE "links_repository" IS NOT NULL AND "links_repository" != '';

    -- Migrate website links from version table
    INSERT INTO "_projects_v_version_links" (_order, _parent_id, label, url, _uuid)
    SELECT 0, id, 'Visit Website', "version_links_website", gen_random_uuid()::varchar
    FROM "_projects_v"
    WHERE "version_links_website" IS NOT NULL AND "version_links_website" != '';

    -- Migrate case study links from version table
    INSERT INTO "_projects_v_version_links" (_order, _parent_id, label, url, _uuid)
    SELECT
      CASE WHEN "version_links_website" IS NOT NULL AND "version_links_website" != '' THEN 1 ELSE 0 END,
      id,
      'Read Case Study',
      "version_links_case_study",
      gen_random_uuid()::varchar
    FROM "_projects_v"
    WHERE "version_links_case_study" IS NOT NULL AND "version_links_case_study" != '';

    -- Migrate repository links from version table
    INSERT INTO "_projects_v_version_links" (_order, _parent_id, label, url, _uuid)
    SELECT
      (CASE WHEN "version_links_website" IS NOT NULL AND "version_links_website" != '' THEN 1 ELSE 0 END +
       CASE WHEN "version_links_case_study" IS NOT NULL AND "version_links_case_study" != '' THEN 1 ELSE 0 END),
      id,
      'View Repository',
      "version_links_repository",
      gen_random_uuid()::varchar
    FROM "_projects_v"
    WHERE "version_links_repository" IS NOT NULL AND "version_links_repository" != '';`)

  // Step 3: Drop old columns
  await db.execute(sql`
    ALTER TABLE "projects" DROP COLUMN "links_website";
    ALTER TABLE "projects" DROP COLUMN "links_case_study";
    ALTER TABLE "projects" DROP COLUMN "links_repository";
    ALTER TABLE "_projects_v" DROP COLUMN "version_links_website";
    ALTER TABLE "_projects_v" DROP COLUMN "version_links_case_study";
    ALTER TABLE "_projects_v" DROP COLUMN "version_links_repository";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_links" CASCADE;
  DROP TABLE "_projects_v_version_links" CASCADE;
  ALTER TABLE "projects" ADD COLUMN "links_website" varchar;
  ALTER TABLE "projects" ADD COLUMN "links_case_study" varchar;
  ALTER TABLE "projects" ADD COLUMN "links_repository" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_links_website" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_links_case_study" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_links_repository" varchar;`)
}
