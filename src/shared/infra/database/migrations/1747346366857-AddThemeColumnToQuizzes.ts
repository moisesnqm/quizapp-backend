import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddThemeColumnToQuizzes1747346366857 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "quizzes",
            new TableColumn({
                name: "theme",
                type: "varchar",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("quizzes", "theme");
    }
} 