import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostTypeTable1791285631533 implements MigrationInterface {
    name = 'CreatePostTypeTable1791285631533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_400bdb7ca6883e4329ea4c79056" UNIQUE ("name"), CONSTRAINT "PK_fbd367b0f90f065f0e54f858a6a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "post_type"`);
    }

}
