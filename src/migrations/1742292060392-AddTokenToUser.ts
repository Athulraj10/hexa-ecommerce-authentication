import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokenToUser1742292060392 implements MigrationInterface {
    name = 'AddTokenToUser1742292060392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "permissions" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "permissions"`);
    }

}
