import { MigrationInterface, QueryRunner } from "typeorm";

export class UpCountry1723131345312 implements MigrationInterface {
    name = 'UpCountry1723131345312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "country_overrides" SET DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "country_overrides" DROP DEFAULT`);
    }

}
