import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTable1791285922084 implements MigrationInterface {
    name = 'CreateNotificationTable1791285922084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "actorId" character varying NOT NULL, "type" character varying NOT NULL, "postId" character varying, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notification"`);
    }

}
