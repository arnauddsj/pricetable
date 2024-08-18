import { MigrationInterface, QueryRunner } from "typeorm";

export class All1723970391583 implements MigrationInterface {
    name = 'All1723970391583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "price_table_draft" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "stripe_public_key" character varying, "paddle_public_key" character varying, "currency_settings" jsonb NOT NULL DEFAULT '{"baseCurrency":"USD","availableCurrencies":["USD"]}', "payment_types" jsonb NOT NULL DEFAULT '[{"name":"Month","type":"cycle","unitName":"/month"}]', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "price_table_id" uuid, CONSTRAINT "REL_3cc59fa1d0afc07c272fee3ff8" UNIQUE ("price_table_id"), CONSTRAINT "PK_ed68ae40940715a8a18440363d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD "price_table_draft_id" uuid`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "is_published" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "published_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "FK_3cc59fa1d0afc07c272fee3ff8c" FOREIGN KEY ("price_table_id") REFERENCES "price_table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_26878e9cb01de7fe04c22755cc3" FOREIGN KEY ("price_table_draft_id") REFERENCES "price_table_draft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_26878e9cb01de7fe04c22755cc3"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "FK_3cc59fa1d0afc07c272fee3ff8c"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "published_at"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "is_published"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price_table_draft_id"`);
        await queryRunner.query(`DROP TABLE "price_table_draft"`);
    }

}
