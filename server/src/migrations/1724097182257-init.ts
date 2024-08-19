import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1724097182257 implements MigrationInterface {
    name = 'Init1724097182257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "price_table" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price_table_data" jsonb NOT NULL, "html_template" text, "custom_css" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_063855c405395c4abaf346e7ba0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "price" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_type_name" character varying NOT NULL, "unit_amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "checkout_url" character varying, "usage_tiers" jsonb, "product_id" uuid, CONSTRAINT "UQ_74bb0e5517a78585cd41727d970" UNIQUE ("product_id", "payment_type_name", "currency"), CONSTRAINT "PK_d163e55e8cce6908b2e0f27cea4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "image_url" character varying, "price_table_draft_id" uuid, CONSTRAINT "PK_b2868a3c413f050e6a98b580efc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "image_url" character varying, "available_feature_icon_url" character varying, "unavailable_feature_icon_url" character varying, "group_id" uuid, CONSTRAINT "PK_03930932f909ca4be8e33d16a2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "is_highlighted" boolean NOT NULL, "highlight_text" character varying, "button_text" character varying, "button_link" character varying, "stripe_product_id" character varying, "paddle_product_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "price_table_draft_id" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "price_table_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "is_public" boolean NOT NULL DEFAULT false, "is_featured" boolean NOT NULL DEFAULT false, "is_premium" boolean NOT NULL DEFAULT false, "is_default" boolean NOT NULL DEFAULT false, "price_table_data" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_DEFAULT_TEMPLATE" UNIQUE ("is_default"), CONSTRAINT "PK_fa522f1b417e7cb95d44ee9f285" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "price_table_draft" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "stripe_public_key" character varying, "paddle_public_key" character varying, "currency_settings" jsonb NOT NULL DEFAULT '{"baseCurrency":"USD","availableCurrencies":["USD"]}', "payment_types" jsonb NOT NULL DEFAULT '[{"name":"Month","type":"cycle","unitName":"/month"}]', "html_template" text NOT NULL, "custom_css" jsonb NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "price_table_id" uuid, "price_table_template_id" uuid, "user_id" uuid, CONSTRAINT "REL_3cc59fa1d0afc07c272fee3ff8" UNIQUE ("price_table_id"), CONSTRAINT "REL_f9e03c27fe1cadfd1339eda525" UNIQUE ("price_table_template_id"), CONSTRAINT "PK_ed68ae40940715a8a18440363d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying, "is_admin" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discount" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "code" character varying, "type" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "base_currency" character varying NOT NULL, "localized_amounts" json NOT NULL, "expires_at" TIMESTAMP, CONSTRAINT "PK_d05d8712e429673e459e7f1cddb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_features_feature" ("product_id" uuid NOT NULL, "feature_id" uuid NOT NULL, CONSTRAINT "PK_5f144f832c92ff60683d44aa261" PRIMARY KEY ("product_id", "feature_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_641ac2aec6ee52d59cfc7ded91" ON "product_features_feature" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9c6bfe8f47a658a1be1a69165" ON "product_features_feature" ("feature_id") `);
        await queryRunner.query(`CREATE TABLE "discount_applicable_products_product" ("discount_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_5baf7157af34579fbdb3ec9564f" PRIMARY KEY ("discount_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff31d2769ea5a3bf5f28d7411d" ON "discount_applicable_products_product" ("discount_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7412a648f4621d94738e08ae1a" ON "discount_applicable_products_product" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD CONSTRAINT "FK_6aad2b01d19773f86dbe2084334" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price" ADD CONSTRAINT "FK_7511931669fa9be1c5224cf09e0" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_group" ADD CONSTRAINT "FK_42c3e8b57a199989dcfaf37ada1" FOREIGN KEY ("price_table_draft_id") REFERENCES "price_table_draft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature" ADD CONSTRAINT "FK_b2868a3c413f050e6a98b580efc" FOREIGN KEY ("group_id") REFERENCES "feature_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_26878e9cb01de7fe04c22755cc3" FOREIGN KEY ("price_table_draft_id") REFERENCES "price_table_draft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD CONSTRAINT "FK_04cfd54a9e258e6e676ba4911fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "FK_3cc59fa1d0afc07c272fee3ff8c" FOREIGN KEY ("price_table_id") REFERENCES "price_table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "FK_f9e03c27fe1cadfd1339eda525e" FOREIGN KEY ("price_table_template_id") REFERENCES "price_table_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" ADD CONSTRAINT "FK_a78acb14808819367f174e5ea27" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "FK_a78acb14808819367f174e5ea27"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "FK_f9e03c27fe1cadfd1339eda525e"`);
        await queryRunner.query(`ALTER TABLE "price_table_draft" DROP CONSTRAINT "FK_3cc59fa1d0afc07c272fee3ff8c"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP CONSTRAINT "FK_04cfd54a9e258e6e676ba4911fd"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_26878e9cb01de7fe04c22755cc3"`);
        await queryRunner.query(`ALTER TABLE "feature" DROP CONSTRAINT "FK_b2868a3c413f050e6a98b580efc"`);
        await queryRunner.query(`ALTER TABLE "feature_group" DROP CONSTRAINT "FK_42c3e8b57a199989dcfaf37ada1"`);
        await queryRunner.query(`ALTER TABLE "price" DROP CONSTRAINT "FK_7511931669fa9be1c5224cf09e0"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP CONSTRAINT "FK_6aad2b01d19773f86dbe2084334"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_e50ca89d635960fda2ffeb17639"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7412a648f4621d94738e08ae1a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff31d2769ea5a3bf5f28d7411d"`);
        await queryRunner.query(`DROP TABLE "discount_applicable_products_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9c6bfe8f47a658a1be1a69165"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_641ac2aec6ee52d59cfc7ded91"`);
        await queryRunner.query(`DROP TABLE "product_features_feature"`);
        await queryRunner.query(`DROP TABLE "discount"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "price_table_draft"`);
        await queryRunner.query(`DROP TABLE "price_table_template"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "feature"`);
        await queryRunner.query(`DROP TABLE "feature_group"`);
        await queryRunner.query(`DROP TABLE "price"`);
        await queryRunner.query(`DROP TABLE "price_table"`);
        await queryRunner.query(`DROP TABLE "token"`);
    }

}
