import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateQuizResponses20250402224701 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "quiz_responses",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "uuid",
                        type: "uuid",
                        isUnique: true,
                    },
                    {
                        name: "campaign_id",
                        type: "uuid",
                    },
                    {
                        name: "quiz_id",
                        type: "uuid",
                    },
                    {
                        name: "content",
                        type: "jsonb",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
                foreignKeys: [
                    {
                        name: "FKCampaignQuizResponse",
                        columnNames: ["campaign_id"],
                        referencedTableName: "campaigns",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    },
                    {
                        name: "FKQuizQuizResponse",
                        columnNames: ["quiz_id"],
                        referencedTableName: "quizzes",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("quiz_responses")
    }
}
