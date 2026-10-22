import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOldLikesAndMediaColumns1792669311059 implements MigrationInterface {
  name = 'DropOldLikesAndMediaColumns1792669311059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "UQ_like_user_post" UNIQUE ("userId", "postId")`,
    );
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "likedBy"`);
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "mediaUrls"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "media" WHERE "postId" IN (
     SELECT "id" FROM "post" WHERE "originalPostId" IS NOT NULL
   )`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD "likedBy" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE "post" ADD "mediaUrls" text`);
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "UQ_like_user_post"`,
    );
  }
}
