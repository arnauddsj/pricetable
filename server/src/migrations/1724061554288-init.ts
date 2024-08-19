import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1724061554288 implements MigrationInterface {
    name = 'Init1724061554288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP CONSTRAINT "FK_2875069c94d39876eaf422a825d"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP CONSTRAINT "FK_fa522f1b417e7cb95d44ee9f285"`);
        await queryRunner.query(`ALTER TABLE "feature_group" DROP CONSTRAINT "FK_e5626d600d19bcd65b1d84b493c"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "FK_15327076f2d80ee924ec537094a"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_4aff14a8a52c8ac182788d1fc9f"`);
        await queryRunner.query(`ALTER TABLE "feature_group" RENAME COLUMN "price_table_id" TO "price_table_draft_id"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "available_feature_icon_url"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "unavailable_feature_icon_url"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "original_template_id"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "payment_types"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "currency_settings"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP CONSTRAINT "REL_fa522f1b417e7cb95d44ee9f28"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "template_id"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "stripe_public_key"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "paddle_public_key"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "currency_settings"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "payment_types"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "is_published"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "published_at"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "REL_15327076f2d80ee924ec537094"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP COLUMN "template_id"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price_table_id"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "versions" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "versions" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD "price_table_template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "UQ_f9e03c27fe1cadfd1339eda525e" UNIQUE ("price_table_template_id")`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_group" ADD CONSTRAINT "FK_42c3e8b57a199989dcfaf37ada1" FOREIGN KEY ("price_table_draft_id") REFERENCES "price_table_draft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "FK_f9e03c27fe1cadfd1339eda525e" FOREIGN KEY ("price_table_template_id") REFERENCES "price_table_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "FK_a78acb14808819367f174e5ea27" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "FK_a78acb14808819367f174e5ea27"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "FK_f9e03c27fe1cadfd1339eda525e"`);
        await queryRunner.query(`ALTER TABLE "feature_group" DROP CONSTRAINT "FK_42c3e8b57a199989dcfaf37ada1"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "UQ_f9e03c27fe1cadfd1339eda525e"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP COLUMN "price_table_template_id"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "versions"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "versions"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "price_table_id" uuid`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD "template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "REL_15327076f2d80ee924ec537094" UNIQUE ("template_id")`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "published_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "is_published" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "payment_types" jsonb NOT NULL DEFAULT '[{"name": "Month", "type": "cycle", "unitName": "/month"}]'`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "currency_settings" jsonb NOT NULL DEFAULT '{"baseCurrency": "USD", "availableCurrencies": ["USD"]}'`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "paddle_public_key" character varying`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "stripe_public_key" character varying`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD CONSTRAINT "REL_fa522f1b417e7cb95d44ee9f28" UNIQUE ("template_id")`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "currency_settings" jsonb NOT NULL DEFAULT '{"baseCurrency": "USD", "availableCurrencies": ["USD"]}'`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "payment_types" jsonb NOT NULL DEFAULT '[{"name": "Month", "type": "cycle", "unitName": "/month"}]'`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "original_template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "unavailable_feature_icon_url" character varying`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "available_feature_icon_url" character varying`);
        await queryRunner.query(`ALTER TABLE "feature_group" RENAME COLUMN "price_table_draft_id" TO "price_table_id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_4aff14a8a52c8ac182788d1fc9f" FOREIGN KEY ("price_table_id") REFERENCES "price_table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "FK_15327076f2d80ee924ec537094a" FOREIGN KEY ("template_id") REFERENCES "price_table_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_group" ADD CONSTRAINT "FK_e5626d600d19bcd65b1d84b493c" FOREIGN KEY ("price_table_id") REFERENCES "price_table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD CONSTRAINT "FK_fa522f1b417e7cb95d44ee9f285" FOREIGN KEY ("template_id") REFERENCES "price_table_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD CONSTRAINT "FK_2875069c94d39876eaf422a825d" FOREIGN KEY ("original_template_id") REFERENCES "price_table_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
