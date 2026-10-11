import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostTypeIdToPost1791719858511 implements MigrationInterface {
    name = 'AddPostTypeIdToPost1791719858511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "postTypeId" integer`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_3d9582fbce5ebb00b1d9179272c" FOREIGN KEY ("postTypeId") REFERENCES "post_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_3d9582fbce5ebb00b1d9179272c"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "postTypeId"`);
    }

}
