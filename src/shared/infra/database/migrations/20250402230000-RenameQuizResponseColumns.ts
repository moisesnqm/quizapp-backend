import { MigrationInterface, QueryRunner } from "typeorm"

export class RenameQuizResponseColumns20250402230000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renomear as colunas para o padrão camelCase
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            RENAME COLUMN campaign_id TO "campaignId";
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            RENAME COLUMN quiz_id TO "quizId";
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            RENAME COLUMN created_at TO "createdAt";
        `);
        
        // Atualizar as foreign keys para usar os novos nomes de colunas
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            DROP CONSTRAINT "FKCampaignQuizResponse";
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            DROP CONSTRAINT "FKQuizQuizResponse";
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            ADD CONSTRAINT "FKCampaignQuizResponse" 
            FOREIGN KEY ("campaignId") 
            REFERENCES campaigns(id) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE;
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            ADD CONSTRAINT "FKQuizQuizResponse" 
            FOREIGN KEY ("quizId") 
            REFERENCES quizzes(id) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter as alterações, voltando ao padrão snake_case
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            DROP CONSTRAINT "FKCampaignQuizResponse";
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            DROP CONSTRAINT "FKQuizQuizResponse";
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            RENAME COLUMN "campaignId" TO campaign_id;
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            RENAME COLUMN "quizId" TO quiz_id;
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            RENAME COLUMN "createdAt" TO created_at;
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            ADD CONSTRAINT "FKCampaignQuizResponse" 
            FOREIGN KEY (campaign_id) 
            REFERENCES campaigns(id) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE;
        `);
        
        await queryRunner.query(`
            ALTER TABLE quiz_responses 
            ADD CONSTRAINT "FKQuizQuizResponse" 
            FOREIGN KEY (quiz_id) 
            REFERENCES quizzes(id) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE;
        `);
    }
} 