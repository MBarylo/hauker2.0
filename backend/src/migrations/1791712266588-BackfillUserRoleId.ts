import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillUserRoleId1791712266588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role" ("name")
      SELECT DISTINCT "role" FROM "user"
      ON CONFLICT ("name") DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE "user"
      SET "roleId" = "role"."id"
      FROM "role"
      WHERE "user"."role" = "role"."name"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "user"
      SET "roleId" = NULL
    `);
  }
}
