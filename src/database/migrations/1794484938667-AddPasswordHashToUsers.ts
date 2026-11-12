import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordHashToUsers1794484938667 implements MigrationInterface {
    name = 'AddPasswordHashToUsers1794484938667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
    }

}
