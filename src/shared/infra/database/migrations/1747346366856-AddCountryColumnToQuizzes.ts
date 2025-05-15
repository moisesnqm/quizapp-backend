import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCountryColumnToQuizzes1747346366856 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'quizzes',
            new TableColumn({
                name: 'country',
                type: 'varchar',
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('quizzes', 'country');
    }

}
