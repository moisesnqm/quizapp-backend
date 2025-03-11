import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm"

export class CreateCampaigns20240315150001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "campaigns",
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
                        name: "owner",
                        type: "varchar",
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

        await queryRunner.createTable(
            new Table({
                name: "campaigns_quizzes",
                columns: [
                    {
                        name: "campaign_id",
                        type: "uuid",
                    },
                    {
                        name: "quiz_id",
                        type: "uuid",
                    },
                ],
            })
        )

        await queryRunner.createForeignKey(
            "campaigns_quizzes",
            new TableForeignKey({
                columnNames: ["campaign_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "campaigns",
                onDelete: "CASCADE",
            })
        )

        await queryRunner.createForeignKey(
            "campaigns_quizzes",
            new TableForeignKey({
                columnNames: ["quiz_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "quizzes",
                onDelete: "CASCADE",
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("campaigns_quizzes")
        await queryRunner.dropTable("campaigns")
    }
} 