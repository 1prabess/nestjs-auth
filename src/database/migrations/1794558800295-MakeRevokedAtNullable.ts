import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeRevokedAtNullable1794558800295 implements MigrationInterface {
  name = 'MakeRevokedAtNullable1794558800295';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "revoked_at" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "revoked_at" SET NOT NULL`,
    );
  }
}
