import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_image_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_image_fit" AS ENUM('cover', 'contain');
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "image_fit" "enum_pages_blocks_content_columns_image_fit" DEFAULT 'cover';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "image_fit" "enum__pages_v_blocks_content_columns_image_fit" DEFAULT 'cover';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "image_fit";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "image_fit";
  DROP TYPE "public"."enum_pages_blocks_content_columns_image_fit";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_image_fit";`)
}
