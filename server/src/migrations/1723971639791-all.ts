import { MigrationInterface, QueryRunner } from "typeorm";

export class All1723971639791 implements MigrationInterface {
    name = 'All1723971639791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "updated_at"`);
    }

}
