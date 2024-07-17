import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigratios1721215501285 implements MigrationInterface {
    name = 'FirstMigratios1721215501285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "firstName" TO "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "name" TO "firstName"`);
    }

}
