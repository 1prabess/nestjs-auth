import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtToUsers1794469468032 implements MigrationInterface {
    name = 'AddUpdatedAtToUsers1794469468032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    }

}
