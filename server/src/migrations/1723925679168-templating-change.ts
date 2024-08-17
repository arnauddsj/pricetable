import { MigrationInterface, QueryRunner } from "typeorm";

export class TemplatingChange1723925679168 implements MigrationInterface {
    name = 'TemplatingChange1723925679168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "button_text" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "button_link" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "button_link" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "button_text" SET NOT NULL`);
    }

}
