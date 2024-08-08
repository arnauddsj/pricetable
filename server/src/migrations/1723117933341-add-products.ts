import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProducts1723117933341 implements MigrationInterface {
    name = 'AddProducts1723117933341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_table" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "general_settings" json NOT NULL, "stripe_public_key" character varying NOT NULL, "paddle_public_key" character varying NOT NULL, "localization_settings" json NOT NULL, "user_id" uuid, CONSTRAINT "PK_20953c75b0440a27fea68c10e9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "is_highlighted" boolean NOT NULL, "highlight_text" character varying NOT NULL, "button_settings" json NOT NULL, "stripe_product_id" character varying NOT NULL, "paddle_product_id" character varying NOT NULL, "product_table_id" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "price" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "unit_amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "billing_cycle" character varying NOT NULL, "custom_interval" character varying, "trial_period" json NOT NULL, "country_overrides" json NOT NULL, "product_id" uuid, CONSTRAINT "PK_d163e55e8cce6908b2e0f27cea4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discount" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "description" character varying NOT NULL, "type" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "is_recurring" boolean NOT NULL, "recurring_periods" integer, "expires_at" TIMESTAMP, "usage_limit" integer NOT NULL, "times_used" integer NOT NULL, CONSTRAINT "PK_d05d8712e429673e459e7f1cddb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "image_url" character varying NOT NULL, "product_table_id" uuid, CONSTRAINT "PK_b2868a3c413f050e6a98b580efc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "image_url" character varying NOT NULL, "group_id" uuid, CONSTRAINT "PK_03930932f909ca4be8e33d16a2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_features_feature" ("product_id" uuid NOT NULL, "feature_id" uuid NOT NULL, CONSTRAINT "PK_5f144f832c92ff60683d44aa261" PRIMARY KEY ("product_id", "feature_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_641ac2aec6ee52d59cfc7ded91" ON "product_features_feature" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9c6bfe8f47a658a1be1a69165" ON "product_features_feature" ("feature_id") `);
        await queryRunner.query(`CREATE TABLE "discount_applicable_products_product" ("discount_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_5baf7157af34579fbdb3ec9564f" PRIMARY KEY ("discount_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff31d2769ea5a3bf5f28d7411d" ON "discount_applicable_products_product" ("discount_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7412a648f4621d94738e08ae1a" ON "discount_applicable_products_product" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "product_table" ADD CONSTRAINT "FK_b593dec9f68fa93b97cf2fdf0ff" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_747f61c77848dbadc6957c339c8" FOREIGN KEY ("product_table_id") REFERENCES "product_table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price" ADD CONSTRAINT "FK_7511931669fa9be1c5224cf09e0" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_group" ADD CONSTRAINT "FK_f78d383c8ca27633cac8e1cc8eb" FOREIGN KEY ("product_table_id") REFERENCES "product_table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature" ADD CONSTRAINT "FK_b2868a3c413f050e6a98b580efc" FOREIGN KEY ("group_id") REFERENCES "feature_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_features_feature" ADD CONSTRAINT "FK_641ac2aec6ee52d59cfc7ded910" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_features_feature" ADD CONSTRAINT "FK_e9c6bfe8f47a658a1be1a69165f" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "discount_applicable_products_product" ADD CONSTRAINT "FK_ff31d2769ea5a3bf5f28d7411d4" FOREIGN KEY ("discount_id") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "discount_applicable_products_product" ADD CONSTRAINT "FK_7412a648f4621d94738e08ae1a5" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discount_applicable_products_product" DROP CONSTRAINT "FK_7412a648f4621d94738e08ae1a5"`);
        await queryRunner.query(`ALTER TABLE "discount_applicable_products_product" DROP CONSTRAINT "FK_ff31d2769ea5a3bf5f28d7411d4"`);
        await queryRunner.query(`ALTER TABLE "product_features_feature" DROP CONSTRAINT "FK_e9c6bfe8f47a658a1be1a69165f"`);
        await queryRunner.query(`ALTER TABLE "product_features_feature" DROP CONSTRAINT "FK_641ac2aec6ee52d59cfc7ded910"`);
        await queryRunner.query(`ALTER TABLE "feature" DROP CONSTRAINT "FK_b2868a3c413f050e6a98b580efc"`);
        await queryRunner.query(`ALTER TABLE "feature_group" DROP CONSTRAINT "FK_f78d383c8ca27633cac8e1cc8eb"`);
        await queryRunner.query(`ALTER TABLE "price" DROP CONSTRAINT "FK_7511931669fa9be1c5224cf09e0"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_747f61c77848dbadc6957c339c8"`);
        await queryRunner.query(`ALTER TABLE "product_table" DROP CONSTRAINT "FK_b593dec9f68fa93b97cf2fdf0ff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7412a648f4621d94738e08ae1a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff31d2769ea5a3bf5f28d7411d"`);
        await queryRunner.query(`DROP TABLE "discount_applicable_products_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9c6bfe8f47a658a1be1a69165"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_641ac2aec6ee52d59cfc7ded91"`);
        await queryRunner.query(`DROP TABLE "product_features_feature"`);
        await queryRunner.query(`DROP TABLE "feature"`);
        await queryRunner.query(`DROP TABLE "feature_group"`);
        await queryRunner.query(`DROP TABLE "discount"`);
        await queryRunner.query(`DROP TABLE "price"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "product_table"`);
    }

}
