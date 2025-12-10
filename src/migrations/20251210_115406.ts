import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_network_content_cta_section_linked_in_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "_pages_v_version_network_content_cta_section_linked_in_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages" ADD COLUMN "network_content_headline" varchar DEFAULT 'Building Our Network';
  ALTER TABLE "pages" ADD COLUMN "network_content_description" jsonb;
  ALTER TABLE "pages" ADD COLUMN "network_content_cta_section_title" varchar DEFAULT 'Connect With Us';
  ALTER TABLE "pages" ADD COLUMN "network_content_cta_section_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_network_content_headline" varchar DEFAULT 'Building Our Network';
  ALTER TABLE "_pages_v" ADD COLUMN "version_network_content_description" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_network_content_cta_section_title" varchar DEFAULT 'Connect With Us';
  ALTER TABLE "_pages_v" ADD COLUMN "version_network_content_cta_section_description" varchar;
  ALTER TABLE "pages_network_content_cta_section_linked_in_links" ADD CONSTRAINT "pages_network_content_cta_section_linked_in_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_network_content_cta_section_linked_in_links" ADD CONSTRAINT "_pages_v_version_network_content_cta_section_linked_in_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_network_content_cta_section_linked_in_links_order_idx" ON "pages_network_content_cta_section_linked_in_links" USING btree ("_order");
  CREATE INDEX "pages_network_content_cta_section_linked_in_links_parent_id_idx" ON "pages_network_content_cta_section_linked_in_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_network_content_cta_section_linked_in_links_order_idx" ON "_pages_v_version_network_content_cta_section_linked_in_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_network_content_cta_section_linked_in_links_parent_id_idx" ON "_pages_v_version_network_content_cta_section_linked_in_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_network_content_cta_section_linked_in_links" CASCADE;
  DROP TABLE "_pages_v_version_network_content_cta_section_linked_in_links" CASCADE;
  ALTER TABLE "pages" DROP COLUMN "network_content_headline";
  ALTER TABLE "pages" DROP COLUMN "network_content_description";
  ALTER TABLE "pages" DROP COLUMN "network_content_cta_section_title";
  ALTER TABLE "pages" DROP COLUMN "network_content_cta_section_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_network_content_headline";
  ALTER TABLE "_pages_v" DROP COLUMN "version_network_content_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_network_content_cta_section_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_network_content_cta_section_description";`)
}
