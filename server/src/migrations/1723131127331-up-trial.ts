import { MigrationInterface, QueryRunner } from "typeorm";

export class UpTrial1723131127331 implements MigrationInterface {
    name = 'UpTrial1723131127331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "trial_period" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "trial_period" SET DEFAULT '{"enabled": false, "days": 0}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "trial_period" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "trial_period" SET NOT NULL`);
    }

}
