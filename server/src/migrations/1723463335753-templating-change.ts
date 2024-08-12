import { MigrationInterface, QueryRunner } from "typeorm";

export class TemplatingChange1723463335753 implements MigrationInterface {
    name = 'TemplatingChange1723463335753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table" ADD "translations" jsonb`);
        await queryRunner.query(`ALTER TABLE "product" ADD "translations" jsonb`);
        await queryRunner.query(`ALTER TABLE "feature_group" ADD "translations" jsonb`);
        await queryRunner.query(`ALTER TABLE "feature" ADD "translations" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature" DROP COLUMN "translations"`);
        await queryRunner.query(`ALTER TABLE "feature_group" DROP COLUMN "translations"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "translations"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "translations"`);
    }

}
