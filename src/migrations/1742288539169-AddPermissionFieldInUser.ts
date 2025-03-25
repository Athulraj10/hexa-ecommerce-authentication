import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionFieldInUser1742288539169 implements MigrationInterface {
    name = 'AddPermissionFieldInUser1742288539169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "permissions" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "permissions"`);
    }

}
