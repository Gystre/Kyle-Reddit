import {MigrationInterface, QueryRunner} from "typeorm";

export class Post1609095815135 implements MigrationInterface {
    name = 'Post1609095815135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "imageLink" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "imageLink"`);
    }

}
