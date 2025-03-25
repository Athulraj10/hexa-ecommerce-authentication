import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionToUser1742296642032 implements MigrationInterface {
    name = 'AddPermissionToUser1742296642032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "permissions" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "permissions"`);
    }

}
