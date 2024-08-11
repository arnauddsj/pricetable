import { MigrationInterface, QueryRunner } from "typeorm";

export class Temlates1723390427159 implements MigrationInterface {
    name = 'Temlates1723390427159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "version" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "html_template" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "vue_component" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "vue_component"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "html_template"`);
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "version"`);
    }

}
