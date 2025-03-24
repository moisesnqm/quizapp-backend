import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddDescriptionToQuizzes20240315215023 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "quizzes",
            new TableColumn({
                name: "description",
                type: "varchar",
                isNullable: true // Permitindo valores nulos para compatibilidade com dados existentes
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("quizzes", "description");
    }
}
