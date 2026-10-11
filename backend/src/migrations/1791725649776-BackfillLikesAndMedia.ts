import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillLikesAndMedia1791725999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "like" ("userId", "postId")
      SELECT unnest(string_to_array("likedBy", ',')), "id"
      FROM "post"
      WHERE "likedBy" <> ''
    `);

    await queryRunner.query(`
      INSERT INTO "media" ("postId", "url")
      SELECT "id", unnest(string_to_array("mediaUrls", ','))
      FROM "post"
      WHERE "mediaUrls" IS NOT NULL AND "mediaUrls" <> ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "like"`);
    await queryRunner.query(`DELETE FROM "media"`);
  }
}
