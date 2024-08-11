import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1723409073890 implements MigrationInterface {
    name = 'Init1723409073890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" DROP COLUMN "styling"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_table_template" ADD "styling" jsonb NOT NULL`);
    }

}
