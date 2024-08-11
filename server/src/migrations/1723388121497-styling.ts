import { MigrationInterface, QueryRunner } from "typeorm";

export class Styling1723388121497 implements MigrationInterface {
    name = 'Styling1723388121497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "price_table_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "styling" jsonb NOT NULL, "is_public" boolean NOT NULL, "original_template_id" uuid, "user_id" uuid, CONSTRAINT "PK_fa522f1b417e7cb95d44ee9f285" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD "template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "price_table" ADD CONSTRAINT "FK_fa522f1b417e7cb95d44ee9f285" FOREIGN KEY ("template_id") REFERENCES "price_table_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD CONSTRAINT "FK_04cfd54a9e258e6e676ba4911fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD CONSTRAINT "FK_2875069c94d39876eaf422a825d" FOREIGN KEY ("original_template_id") REFERENCES "price_table_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP CONSTRAINT "FK_2875069c94d39876eaf422a825d"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP CONSTRAINT "FK_04cfd54a9e258e6e676ba4911fd"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP CONSTRAINT "FK_fa522f1b417e7cb95d44ee9f285"`);
        await queryRunner.query(`ALTER TABLE "price_table" DROP COLUMN "template_id"`);
        await queryRunner.query(`DROP TABLE "price_table_template"`);
    }

}
