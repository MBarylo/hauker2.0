import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPostTypeId1791719999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "post_type" ("name")
      VALUES ('original'), ('repost'), ('poll')
      ON CONFLICT ("name") DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE "post"
      SET "postTypeId" = (
        SELECT "id" FROM "post_type"
        WHERE "name" = CASE
          WHEN "post"."originalPostId" IS NULL THEN 'original'
          ELSE 'repost'
        END
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "post"
      SET "postTypeId" = NULL
    `);
  }
}
