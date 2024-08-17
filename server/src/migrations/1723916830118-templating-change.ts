import { MigrationInterface, QueryRunner } from "typeorm";

export class TemplatingChange1723916830118 implements MigrationInterface {
    name = 'TemplatingChange1723916830118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "available_currencies"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "base_currency"`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "currency_settings" jsonb NOT NULL DEFAULT '{"baseCurrency":"USD","availableCurrencies":["USD"]}'`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "currency_settings" jsonb NOT NULL DEFAULT '{"baseCurrency":"USD","availableCurrencies":["USD"]}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "currency_settings"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "currency_settings"`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "base_currency" character varying NOT NULL DEFAULT 'USD'`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "available_currencies" text`);
    }

}
