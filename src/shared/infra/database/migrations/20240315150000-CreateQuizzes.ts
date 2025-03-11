import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateQuizzes20240315150000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "quizzes",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "subject",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "varchar",
                    },
                    {
                        name: "startDate",
                        type: "timestamp",
                    },
                    {
                        name: "endDate",
                        type: "timestamp",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("quizzes")
    }
} 